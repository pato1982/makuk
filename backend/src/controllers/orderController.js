import crypto from 'crypto';
import pool from '../config/db.js';
import { sendOrderConfirmationEmails } from '../utils/emailService.js';

// ============================================
// FLOW API HELPERS (server-side)
// ============================================

function getFlowBaseUrl() {
  const env = process.env.FLOW_ENV || 'sandbox';
  return env === 'production'
    ? 'https://www.flow.cl/api'
    : 'https://sandbox.flow.cl/api';
}

function signParams(params, secretKey) {
  const keys = Object.keys(params).sort();
  const toSign = keys.map(k => k + params[k]).join('');
  return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
}

async function flowPost(endpoint, params) {
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error('Flow credentials not configured (FLOW_API_KEY / FLOW_SECRET_KEY)');
  }

  const allParams = cleanParams({ ...params, apiKey });
  allParams.s = signParams(allParams, secretKey);

  const body = new URLSearchParams(allParams).toString();
  const url = `${getFlowBaseUrl()}${endpoint}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function flowGet(endpoint, params) {
  const apiKey = process.env.FLOW_API_KEY;
  const secretKey = process.env.FLOW_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error('Flow credentials not configured');
  }

  const allParams = cleanParams({ ...params, apiKey });
  allParams.s = signParams(allParams, secretKey);

  const qs = new URLSearchParams(allParams).toString();
  const url = `${getFlowBaseUrl()}${endpoint}?${qs}`;

  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ============================================
// HELPERS
// ============================================

function generateCommerceOrder() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MKK-${date}-${rand}`;
}

async function logStatusChange(conn, orderId, prevStatus, newStatus, source, flowResponse, ip, details) {
  await conn.execute(
    `INSERT INTO order_status_log (order_id, previous_status, new_status, source, flow_response, request_ip, details)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [orderId, prevStatus, newStatus, source, flowResponse ? JSON.stringify(flowResponse) : null, ip, details]
  );
}

// ============================================
// FASE 1: CREAR ORDEN + LLAMAR A FLOW
// POST /api/orders
// ============================================

export async function createOrder(req, res) {
  const conn = await pool.getConnection();

  try {
    const { customer, items, shipping, documentType, factura } = req.body;

    // Validar datos del cliente
    if (!customer?.name || !customer?.email) {
      return res.status(400).json({ error: 'Nombre y email del cliente son requeridos' });
    }
    if (!items?.length) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    if (!shipping?.commune || !shipping?.region) {
      return res.status(400).json({ error: 'La región y comuna de despacho son requeridas' });
    }

    // Validar datos de factura si el tipo es factura
    if (documentType === 'factura') {
      const { rut, razonSocial, giro, direccion, comuna } = req.body.factura || {};
      if (!rut || !razonSocial || !giro || !direccion || !comuna) {
        return res.status(400).json({ error: 'Todos los campos de factura son requeridos (RUT, razón social, giro, dirección, comuna)' });
      }
      // Validar formato RUT chileno (NN.NNN.NNN-X o sin puntos)
      const rutClean = rut.replace(/[.\-]/g, '').toUpperCase();
      if (!/^\d{7,8}[0-9K]$/.test(rutClean)) {
        return res.status(400).json({ error: 'Formato de RUT inválido' });
      }
    }

    await conn.beginTransaction();

    // Calcular totales
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Buscar producto en DB para snapshot (categoría, imagen)
      // Si se envía productId, usar ese; si no, buscar por nombre + precio
      let product = null;
      if (item.productId) {
        const [rows] = await conn.execute(
          'SELECT id, nombre, categoria, imagen, precio_actual FROM products WHERE id = ? LIMIT 1',
          [item.productId]
        );
        product = rows[0] || null;
      } else {
        const [rows] = await conn.execute(
          'SELECT id, nombre, categoria, imagen, precio_actual FROM products WHERE nombre = ? AND precio_actual = ? LIMIT 1',
          [item.nombre, item.precioUnitario]
        );
        product = rows[0] || null;
      }

      // Siempre usar el precio del carrito (es lo que el cliente vio)
      const unitPrice = item.precioUnitario;
      const lineTotal = unitPrice * item.cantidad;
      subtotal += lineTotal;

      orderItems.push({
        product_id: product?.id || null,
        product_name: item.nombre,
        product_category: product?.categoria || null,
        product_image: product?.imagen || null,
        unit_price: unitPrice,
        quantity: item.cantidad,
        line_total: lineTotal,
      });
    }

    // subtotal ya viene con IVA incluido (precio bruto del frontend)
    // Se agrega el costo de despacho al total cobrado
    const shippingCost = shipping?.cost ?? 0;
    const total = subtotal + shippingCost;
    const neto = Math.round(subtotal / 1.19);
    const iva = subtotal - neto;

    // Generar ID de orden del comercio
    const commerceOrder = generateCommerceOrder();

    // URLs de callback (apuntan al dominio público vía Nginx)
    const baseUrl = process.env.FRONTEND_URL || 'https://makuk.cl';
    const urlConfirmation = `${baseUrl}/api/orders/confirm`;
    const urlReturn = `${baseUrl}/api/orders/return`;

    // Crear orden en DB con estado pending
    // Datos de factura (solo si documentType === 'factura')
    const f = documentType === 'factura' && factura ? factura : {};

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (commerce_order, customer_name, customer_email, customer_phone,
        shipping_region, shipping_commune, shipping_cost, document_type,
        factura_rut, factura_razon_social, factura_giro, factura_direccion, factura_comuna,
        subtotal, iva, total, url_confirmation, url_return, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        commerceOrder, customer.name, customer.email, customer.phone || null,
        shipping.region, shipping.commune, shippingCost, documentType || 'boleta',
        f.rut || null, f.razonSocial || null, f.giro || null, f.direccion || null, f.comuna || null,
        subtotal, iva, total, urlConfirmation, urlReturn,
        req.ip, req.get('user-agent'),
      ]
    );

    const orderId = orderResult.insertId;

    // Insertar items
    for (const item of orderItems) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, product_category, product_image,
          unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.product_category, item.product_image,
          item.unit_price, item.quantity, item.line_total]
      );
    }

    // Log de creación
    await logStatusChange(conn, orderId, null, 'pending', 'system', null, req.ip, 'Orden creada');

    // Llamar a Flow /payment/create
    const flowParams = {
      commerceOrder,
      subject: `Compra Makuk - ${commerceOrder}`,
      amount: total,
      email: customer.email,
      currency: 'CLP',
      urlConfirmation,
      urlReturn,
      timeout: 3600, // 1 hora: si el comprador no paga, Flow expira y cancela la orden
    };

    const flowResult = await flowPost('/payment/create', flowParams);

    if (!flowResult.ok || !flowResult.data?.token) {
      // Flow rechazó la solicitud
      await conn.execute(
        `UPDATE orders SET status = 'error', flow_create_response = ? WHERE id = ?`,
        [JSON.stringify(flowResult.data), orderId]
      );
      await logStatusChange(conn, orderId, 'pending', 'error', 'system', flowResult.data, req.ip,
        `Flow rechazó /payment/create: ${flowResult.data?.message || JSON.stringify(flowResult.data)}`);
      await conn.commit();

      return res.status(502).json({
        error: 'Error al crear la orden en Flow',
        details: flowResult.data,
        commerceOrder,
      });
    }

    // Guardar datos de Flow
    const { token, url, flowOrder } = flowResult.data;
    const checkoutUrl = `${url}?token=${token}`;

    await conn.execute(
      `UPDATE orders SET flow_token = ?, flow_order = ?, checkout_url = ?,
        flow_create_response = ?, status = 'processing' WHERE id = ?`,
      [token, flowOrder, checkoutUrl, JSON.stringify(flowResult.data), orderId]
    );
    await logStatusChange(conn, orderId, 'pending', 'processing', 'system', flowResult.data, req.ip,
      `Flow order creada: token=${token}, flowOrder=${flowOrder}`);

    await conn.commit();

    // Retornar al frontend
    res.json({
      success: true,
      commerceOrder,
      checkoutUrl,
      token,
      flowOrder,
      total,
    });

  } catch (err) {
    await conn.rollback();
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Error interno al crear la orden', details: err.message });
  } finally {
    conn.release();
  }
}

// ============================================
// FASE 2: WEBHOOK DE CONFIRMACIÓN
// POST /api/orders/confirm
// Flow envía POST con token en el body
// ============================================

export async function handleConfirmation(req, res) {
  const conn = await pool.getConnection();

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Buscar orden por token
    const [orders] = await conn.execute(
      'SELECT * FROM orders WHERE flow_token = ? LIMIT 1',
      [token]
    );

    if (!orders.length) {
      console.warn(`Webhook: orden no encontrada para token ${token}`);
      return res.status(200).send('OK'); // Siempre responder 200 a Flow
    }

    const order = orders[0];

    // Consultar estado en Flow
    const statusResult = await flowGet('/payment/getStatus', { token });

    if (!statusResult.ok) {
      await logStatusChange(conn, order.id, order.status, order.status, 'webhook', statusResult.data, req.ip,
        `Error consultando getStatus: ${statusResult.status}`);
      return res.status(200).send('OK');
    }

    const flowData = statusResult.data;
    const flowStatus = flowData.status; // 1=pending, 2=paid, 3=rejected, 4=cancelled

    // Mapear estado Flow → estado interno
    let newStatus = order.status;
    if (flowStatus === 2) newStatus = 'paid';
    else if (flowStatus === 3) newStatus = 'rejected';
    else if (flowStatus === 4) newStatus = 'cancelled';

    await conn.beginTransaction();

    // Actualizar orden
    await conn.execute(
      `UPDATE orders SET
        status = ?, flow_status = ?, flow_confirm_response = ?, confirmed_at = NOW(),
        payment_method = ?, paid_at = ?, payer_email = ?, transaction_id = ?
       WHERE id = ?`,
      [
        newStatus,
        flowStatus,
        JSON.stringify(flowData),
        flowData.paymentData?.media || null,
        flowStatus === 2 ? new Date(flowData.paymentData?.date || Date.now()) : null,
        flowData.payer || null,
        flowData.paymentData?.transferDate || null,
        order.id,
      ]
    );

    await logStatusChange(conn, order.id, order.status, newStatus, 'webhook', flowData, req.ip,
      `Confirmación Flow: status=${flowStatus}, method=${flowData.paymentData?.media || 'N/A'}`);

    await conn.commit();

    // Enviar emails de confirmación si el pago fue exitoso
    if (newStatus === 'paid') {
      // Obtener items de la orden para el email
      const [orderItems] = await pool.execute(
        'SELECT * FROM order_items WHERE order_id = ? ORDER BY id',
        [order.id]
      );

      // Construir objeto orden actualizado con datos del pago
      const updatedOrder = {
        ...order,
        status: newStatus,
        payment_method: flowData.paymentData?.media || null,
        paid_at: flowData.paymentData?.date || new Date(),
      };

      // Enviar emails (no bloquea la respuesta a Flow)
      sendOrderConfirmationEmails(updatedOrder, orderItems)
        .then(r => console.log('Emails enviados:', r))
        .catch(e => console.error('Error enviando emails:', e));
    }

    // Siempre responder 200 a Flow
    res.status(200).send('OK');

  } catch (err) {
    await conn.rollback();
    console.error('Error in confirmation webhook:', err);
    res.status(200).send('OK'); // Aun con error, responder 200
  } finally {
    conn.release();
  }
}

// ============================================
// FASE 3: RETORNO DEL CLIENTE
// POST /api/orders/return (Flow envía POST)
// Redirige al frontend con el commerceOrder
// ============================================

export async function handleReturn(req, res) {
  const conn = await pool.getConnection();

  try {
    const { token } = req.body;

    if (!token) {
      return res.redirect('/payment-result?error=no_token');
    }

    // Buscar orden
    const [orders] = await conn.execute(
      'SELECT * FROM orders WHERE flow_token = ? LIMIT 1',
      [token]
    );

    if (!orders.length) {
      return res.redirect('/payment-result?error=order_not_found');
    }

    const order = orders[0];

    // Consultar estado actualizado en Flow
    const statusResult = await flowGet('/payment/getStatus', { token });

    if (statusResult.ok) {
      const flowData = statusResult.data;
      const flowStatus = flowData.status;

      let newStatus = order.status;
      if (flowStatus === 2) newStatus = 'paid';
      else if (flowStatus === 3) newStatus = 'rejected';
      else if (flowStatus === 4) newStatus = 'cancelled';

      await conn.beginTransaction();

      await conn.execute(
        `UPDATE orders SET
          flow_return_response = ?, returned_at = NOW(),
          status = ?, flow_status = ?,
          payment_method = COALESCE(payment_method, ?),
          paid_at = COALESCE(paid_at, ?),
          payer_email = COALESCE(payer_email, ?)
         WHERE id = ?`,
        [
          JSON.stringify(flowData),
          newStatus,
          flowStatus,
          flowData.paymentData?.media || null,
          flowStatus === 2 ? new Date(flowData.paymentData?.date || Date.now()) : null,
          flowData.payer || null,
          order.id,
        ]
      );

      await logStatusChange(conn, order.id, order.status, newStatus, 'return', flowData, req.ip,
        `Cliente retornó: status=${flowStatus}`);

      await conn.commit();
    }

    // Redirigir al frontend con el ID de la orden
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendUrl}/payment-result?order=${order.commerce_order}`);

  } catch (err) {
    await conn.rollback();
    console.error('Error in return handler:', err);
    res.redirect('/payment-result?error=internal');
  } finally {
    conn.release();
  }
}

// ============================================
// CONSULTAR ORDEN
// GET /api/orders/:commerceOrder
// ============================================

export async function getOrder(req, res) {
  try {
    const { commerceOrder } = req.params;

    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE commerce_order = ? LIMIT 1',
      [commerceOrder]
    );

    if (!orders.length) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = orders[0];

    // Obtener items
    const [items] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY id',
      [order.id]
    );

    // Obtener log de estados
    const [statusLog] = await pool.execute(
      'SELECT * FROM order_status_log WHERE order_id = ? ORDER BY created_at',
      [order.id]
    );

    // Parsear JSON fields
    const parseJson = (val) => {
      if (!val) return null;
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch { return val; }
    };

    res.json({
      ...order,
      flow_create_response: parseJson(order.flow_create_response),
      flow_confirm_response: parseJson(order.flow_confirm_response),
      flow_return_response: parseJson(order.flow_return_response),
      items,
      statusLog,
    });

  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Error al consultar la orden' });
  }
}

// ============================================
// ADMIN: LISTAR ÓRDENES
// GET /api/admin/orders
// ============================================

export async function getAdminOrders(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const { status, adminStatus, search, dateFrom, dateTo, sortBy, sortDir } = req.query;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }
    if (adminStatus) {
      conditions.push('o.admin_status = ?');
      params.push(adminStatus);
    }
    if (search) {
      conditions.push('(o.commerce_order LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (dateFrom) {
      conditions.push('DATE(o.created_at) >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('DATE(o.created_at) <= ?');
      params.push(dateTo);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSort = { date: 'o.created_at', total: 'o.total', order: 'o.commerce_order' };
    const sortCol = allowedSort[sortBy] || 'o.created_at';
    const sortDirSafe = sortDir === 'asc' ? 'ASC' : 'DESC';

    const query = `
      SELECT o.id, o.commerce_order, o.customer_name, o.customer_email, o.customer_phone,
             o.subtotal, o.iva, o.total, o.status, o.admin_status, o.flow_status, o.payment_method,
             o.flow_order, o.created_at, o.paid_at,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
      FROM orders o
      ${where}
      ORDER BY ${sortCol} ${sortDirSafe}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [orders] = await pool.execute(query, params);
    const [countResult] = await pool.execute(`SELECT COUNT(*) AS total FROM orders o ${where}`, params);
    const total = countResult[0].total;

    res.json({
      orders,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ error: 'Error al consultar las órdenes' });
  }
}

// ============================================
// ADMIN: DETALLE DE ORDEN
// GET /api/admin/orders/:commerceOrder
// ============================================

// ============================================
// ADMIN: ACTUALIZAR ESTADO ADMINISTRATIVO
// PUT /api/admin/orders/:commerceOrder/status
// ============================================

export async function updateAdminOrderStatus(req, res) {
  const conn = await pool.getConnection();
  try {
    const { commerceOrder } = req.params;
    const { admin_status } = req.body;

    const allowed = ['en_proceso', 'en_transito', 'entregado', 'cancelado', 'produciendo', 'enviado'];
    if (!allowed.includes(admin_status)) {
      return res.status(400).json({ error: `Estado inválido. Permitidos: ${allowed.join(', ')}` });
    }

    const [orders] = await conn.execute(
      'SELECT id, admin_status FROM orders WHERE commerce_order = ? LIMIT 1',
      [commerceOrder]
    );

    if (!orders.length) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = orders[0];
    const prevStatus = order.admin_status;

    await conn.beginTransaction();

    await conn.execute(
      'UPDATE orders SET admin_status = ? WHERE id = ?',
      [admin_status, order.id]
    );

    await logStatusChange(conn, order.id, prevStatus || 'null', admin_status, 'admin', null, req.ip,
      `Admin cambió estado a: ${admin_status}`);

    await conn.commit();

    res.json({ message: 'Estado actualizado', admin_status });
  } catch (err) {
    await conn.rollback();
    console.error('Error updating admin status:', err);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  } finally {
    conn.release();
  }
}

// ============================================
// ADMIN: DETALLE DE ORDEN
// GET /api/admin/orders/:commerceOrder
// ============================================

export async function getAdminOrderDetail(req, res) {
  try {
    const { commerceOrder } = req.params;

    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE commerce_order = ? LIMIT 1',
      [commerceOrder]
    );

    if (!orders.length) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = orders[0];

    const [items] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY id',
      [order.id]
    );

    const [statusLog] = await pool.execute(
      'SELECT * FROM order_status_log WHERE order_id = ? ORDER BY created_at',
      [order.id]
    );

    const parseJson = (val) => {
      if (!val) return null;
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch { return val; }
    };

    res.json({
      ...order,
      flow_create_response: parseJson(order.flow_create_response),
      flow_confirm_response: parseJson(order.flow_confirm_response),
      flow_return_response: parseJson(order.flow_return_response),
      items,
      statusLog,
    });
  } catch (err) {
    console.error('Error fetching admin order detail:', err);
    res.status(500).json({ error: 'Error al consultar la orden' });
  }
}
