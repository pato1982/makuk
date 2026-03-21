import nodemailer from 'nodemailer';

// ============================================
// TRANSPORTER (reutiliza config de contacto)
// ============================================

let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
}

// ============================================
// HELPERS
// ============================================

function formatPrice(amount) {
  return '$' + Number(amount).toLocaleString('es-CL');
}

function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================
// PLANTILLA: Email al comprador
// ============================================

function buildBuyerEmail(order, items) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid #f0ebe3; font-size:14px; color:#333;">
        ${item.product_name}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #f0ebe3; font-size:14px; color:#666; text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #f0ebe3; font-size:14px; color:#333; text-align:right;">
        ${formatPrice(item.line_total)}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#faf8f5; font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:600px; margin:0 auto; padding:20px;">

    <!-- Header -->
    <div style="background:#1a1207; padding:30px; text-align:center; border-radius:8px 8px 0 0;">
      <h1 style="margin:0; color:#c8956c; font-size:28px; font-weight:400; letter-spacing:3px;">MAKUK</h1>
      <p style="margin:5px 0 0; color:#a08c72; font-size:12px; letter-spacing:2px;">COBRETEJIDO ARTESANAL</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff; padding:35px 30px; border-left:1px solid #e8e0d4; border-right:1px solid #e8e0d4;">

      <h2 style="margin:0 0 5px; color:#1a1207; font-size:22px; font-weight:400;">¡Gracias por tu compra!</h2>
      <p style="margin:0 0 25px; color:#666; font-size:14px; line-height:1.6;">
        Hola <strong>${order.customer_name}</strong>, tu pago ha sido procesado exitosamente.
        A continuación el detalle de tu pedido.
      </p>

      <!-- Orden info -->
      <div style="background:#faf8f5; padding:16px 20px; border-radius:6px; margin-bottom:25px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0; font-size:13px; color:#888;">ORDEN</td>
            <td style="padding:4px 0; font-size:14px; color:#333; text-align:right; font-weight:600;">
              ${order.commerce_order}
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0; font-size:13px; color:#888;">FECHA</td>
            <td style="padding:4px 0; font-size:14px; color:#333; text-align:right;">
              ${formatDate(order.paid_at || order.created_at)}
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0; font-size:13px; color:#888;">MEDIO DE PAGO</td>
            <td style="padding:4px 0; font-size:14px; color:#333; text-align:right;">
              ${order.payment_method || 'Webpay'}
            </td>
          </tr>
        </table>
      </div>

      <!-- Productos -->
      <h3 style="margin:0 0 12px; color:#1a1207; font-size:16px; font-weight:600; border-bottom:2px solid #c8956c; padding-bottom:8px;">
        Productos
      </h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <thead>
          <tr style="background:#faf8f5;">
            <th style="padding:10px 12px; text-align:left; font-size:12px; color:#888; font-weight:500;">PRODUCTO</th>
            <th style="padding:10px 12px; text-align:center; font-size:12px; color:#888; font-weight:500;">CANT.</th>
            <th style="padding:10px 12px; text-align:right; font-size:12px; color:#888; font-weight:500;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Totales -->
      <div style="border-top:2px solid #1a1207; padding-top:15px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0; font-size:13px; color:#888;">Subtotal (Neto)</td>
            <td style="padding:4px 0; font-size:14px; color:#333; text-align:right;">${formatPrice(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; font-size:13px; color:#888;">IVA (19%)</td>
            <td style="padding:4px 0; font-size:14px; color:#333; text-align:right;">${formatPrice(order.iva)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0 0; font-size:18px; color:#1a1207; font-weight:600;">Total pagado</td>
            <td style="padding:8px 0 0; font-size:18px; color:#1a1207; text-align:right; font-weight:600;">
              ${formatPrice(order.total)}
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#1a1207; padding:25px 30px; border-radius:0 0 8px 8px; text-align:center;">
      <p style="margin:0 0 8px; color:#c8956c; font-size:13px;">
        ¿Tienes alguna pregunta sobre tu pedido?
      </p>
      <p style="margin:0 0 15px; color:#a08c72; font-size:13px;">
        Escríbenos a <a href="mailto:cobretejido@gmail.com" style="color:#c8956c;">cobretejido@gmail.com</a>
      </p>
      <p style="margin:0; color:#555; font-size:11px;">
        Makuk — Cobretejido Artesanal &bull; Santiago, Chile
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ============================================
// PLANTILLA: Email al comercio (notificación)
// ============================================

function buildCommerceEmail(order, items) {
  const itemList = items.map(i =>
    `<li style="padding:4px 0; font-size:14px;">${i.product_name} x${i.quantity} — ${formatPrice(i.line_total)}</li>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family:Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:20px;">
    <div style="background:#fff; padding:30px; border-radius:8px; border-left:4px solid #22c55e;">

      <h2 style="margin:0 0 5px; color:#1a1207; font-size:20px;">
        ✅ Nueva venta confirmada
      </h2>
      <p style="margin:0 0 20px; color:#666; font-size:14px;">
        Orden <strong>${order.commerce_order}</strong> — ${formatDate(order.paid_at || order.created_at)}
      </p>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#888;">Cliente</td>
          <td style="padding:6px 0; font-size:14px; color:#333;">${order.customer_name}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#888;">Email</td>
          <td style="padding:6px 0; font-size:14px; color:#333;">${order.customer_email}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#888;">Teléfono</td>
          <td style="padding:6px 0; font-size:14px; color:#333;">${order.customer_phone || 'No proporcionado'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#888;">Medio de pago</td>
          <td style="padding:6px 0; font-size:14px; color:#333;">${order.payment_method || 'Webpay'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; font-size:13px; color:#888;">Flow Order</td>
          <td style="padding:6px 0; font-size:14px; color:#333;">#${order.flow_order || 'N/A'}</td>
        </tr>
      </table>

      <h3 style="margin:0 0 8px; font-size:15px; color:#1a1207; border-bottom:1px solid #eee; padding-bottom:6px;">
        Productos
      </h3>
      <ul style="margin:0 0 20px; padding-left:20px;">${itemList}</ul>

      <div style="background:#f0fdf4; padding:15px; border-radius:6px; text-align:center;">
        <span style="font-size:24px; font-weight:700; color:#16a34a;">${formatPrice(order.total)}</span>
        <br>
        <span style="font-size:12px; color:#888;">Neto ${formatPrice(order.subtotal)} + IVA ${formatPrice(order.iva)}</span>
      </div>

    </div>
  </div>
</body>
</html>`;
}

// ============================================
// ENVIAR EMAILS DE CONFIRMACIÓN
// ============================================

export async function sendOrderConfirmationEmails(order, items) {
  const from = `"Makuk" <${process.env.GMAIL_USER}>`;
  const commerceEmail = process.env.CONTACT_TO_EMAIL || process.env.GMAIL_USER;

  const results = { buyer: false, commerce: false, errors: [] };

  // Email al comprador
  try {
    await getTransporter().sendMail({
      from,
      to: order.customer_email,
      subject: `Confirmación de compra — Orden ${order.commerce_order}`,
      html: buildBuyerEmail(order, items),
    });
    results.buyer = true;
    console.log(`Email de confirmación enviado a ${order.customer_email}`);
  } catch (err) {
    results.errors.push(`Buyer email failed: ${err.message}`);
    console.error('Error enviando email al comprador:', err.message);
  }

  // Email al comercio
  try {
    await getTransporter().sendMail({
      from,
      to: commerceEmail,
      subject: `Nueva venta — ${order.commerce_order} — ${formatPrice(order.total)}`,
      html: buildCommerceEmail(order, items),
    });
    results.commerce = true;
    console.log(`Email de venta enviado a ${commerceEmail}`);
  } catch (err) {
    results.errors.push(`Commerce email failed: ${err.message}`);
    console.error('Error enviando email al comercio:', err.message);
  }

  return results;
}
