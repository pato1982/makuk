-- ============================================
-- MIGRACIÓN 001: Sistema de Órdenes y Pagos Flow
-- Fecha: 2026-03-19
-- Branch: feature/flow-api-integration
-- ============================================
-- Este schema captura el ciclo de vida COMPLETO
-- de una transacción Flow según el diagrama de 3 fases:
--   1. Creación de orden → /payment/create
--   2. Confirmación webhook → urlConfirmation + /payment/getStatus
--   3. Retorno cliente → urlReturn + /payment/getStatus
-- ============================================

-- ============================================
-- TABLA: orders
-- Orden de compra del cliente con todo el
-- contexto de la transacción Flow
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- === IDENTIFICADORES ===
  commerce_order VARCHAR(100) NOT NULL UNIQUE COMMENT 'ID único generado por Makuk (ej: MKK-20260319-001)',
  flow_order INT NULL COMMENT 'Número de orden asignado por Flow',
  flow_token VARCHAR(255) NULL COMMENT 'Token devuelto por /payment/create',

  -- === DATOS DEL CLIENTE ===
  customer_name VARCHAR(255) NOT NULL COMMENT 'Nombre completo del comprador',
  customer_email VARCHAR(255) NOT NULL COMMENT 'Email del comprador (requerido por Flow)',
  customer_phone VARCHAR(50) NULL COMMENT 'Teléfono de contacto (opcional)',

  -- === MONTOS ===
  subtotal INT NOT NULL DEFAULT 0 COMMENT 'Monto neto en CLP (sin IVA)',
  iva INT NOT NULL DEFAULT 0 COMMENT 'IVA 19% en CLP',
  total INT NOT NULL DEFAULT 0 COMMENT 'Total a pagar en CLP (subtotal + IVA)',
  currency VARCHAR(10) DEFAULT 'CLP' COMMENT 'Moneda (siempre CLP para Flow Chile)',

  -- === ESTADO DEL PAGO ===
  status ENUM('pending', 'processing', 'paid', 'rejected', 'cancelled', 'error')
    DEFAULT 'pending' COMMENT 'Estado interno de la orden',
  admin_status ENUM('en_proceso', 'cancelado', 'produciendo', 'enviado', 'entregado')
    DEFAULT 'en_proceso' COMMENT 'Estado administrativo de la orden (gestión interna)',
  flow_status INT NULL COMMENT 'Código de estado Flow: 1=pending, 2=paid, 3=rejected, 4=cancelled',
  payment_method VARCHAR(50) NULL COMMENT 'Método de pago usado (webpay, servipag, multicaja, etc.)',

  -- === URLs DE CALLBACK (Fase 1: lo que enviamos a Flow) ===
  url_confirmation VARCHAR(500) NOT NULL COMMENT 'URL donde Flow envía POST de confirmación (webhook)',
  url_return VARCHAR(500) NOT NULL COMMENT 'URL donde Flow redirige al cliente post-pago',
  checkout_url VARCHAR(500) NULL COMMENT 'URL completa de checkout Flow (url + token)',

  -- === RESPONSE DE /payment/create (Fase 1) ===
  flow_create_response JSON NULL COMMENT 'Response completo de POST /payment/create',

  -- === RESPONSE DE CONFIRMACIÓN (Fase 2: webhook) ===
  flow_confirm_response JSON NULL COMMENT 'Response de GET /payment/getStatus en urlConfirmation',
  confirmed_at TIMESTAMP NULL COMMENT 'Timestamp cuando Flow envió el webhook de confirmación',

  -- === RESPONSE DE RETORNO (Fase 3: cliente vuelve) ===
  flow_return_response JSON NULL COMMENT 'Response de GET /payment/getStatus en urlReturn',
  returned_at TIMESTAMP NULL COMMENT 'Timestamp cuando el cliente volvió a Makuk',

  -- === DATOS DE PAGO (extraídos del getStatus) ===
  paid_at TIMESTAMP NULL COMMENT 'Fecha/hora del pago exitoso',
  payer_email VARCHAR(255) NULL COMMENT 'Email del pagador (puede diferir del customer)',
  transaction_id VARCHAR(255) NULL COMMENT 'ID de transacción del medio de pago',

  -- === METADATA ===
  ip_address VARCHAR(45) NULL COMMENT 'IP del cliente al crear la orden',
  user_agent TEXT NULL COMMENT 'User-Agent del navegador del cliente',
  notes TEXT NULL COMMENT 'Notas internas (admin)',

  -- === TIMESTAMPS ===
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- === ÍNDICES ===
  INDEX idx_flow_token (flow_token),
  INDEX idx_flow_order (flow_order),
  INDEX idx_status (status),
  INDEX idx_customer_email (customer_email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Órdenes de compra con ciclo de vida completo Flow';


-- ============================================
-- TABLA: order_items
-- Detalle de productos en cada orden
-- (snapshot del momento de compra)
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL COMMENT 'FK a products (NULL si el producto fue eliminado)',

  -- === SNAPSHOT DEL PRODUCTO AL MOMENTO DE COMPRA ===
  product_name VARCHAR(255) NOT NULL COMMENT 'Nombre del producto (snapshot)',
  product_category VARCHAR(100) NULL COMMENT 'Categoría del producto (snapshot)',
  product_image VARCHAR(500) NULL COMMENT 'URL imagen del producto (snapshot)',

  -- === PRECIO Y CANTIDAD ===
  unit_price INT NOT NULL COMMENT 'Precio unitario en CLP al momento de compra',
  quantity INT NOT NULL DEFAULT 1,
  line_total INT NOT NULL COMMENT 'unit_price × quantity',

  -- === TIMESTAMPS ===
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- === FOREIGN KEYS ===
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,

  -- === ÍNDICES ===
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Items de cada orden con snapshot de precios al momento de compra';


-- ============================================
-- TABLA: order_status_log
-- Historial de cambios de estado para
-- trazabilidad y debugging con soporte Flow
-- ============================================

CREATE TABLE IF NOT EXISTS order_status_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,

  previous_status VARCHAR(20) NULL COMMENT 'Estado anterior',
  new_status VARCHAR(20) NOT NULL COMMENT 'Nuevo estado',
  source ENUM('system', 'webhook', 'return', 'admin', 'timeout') NOT NULL
    COMMENT 'Quién originó el cambio',

  -- === DATOS DEL EVENTO ===
  flow_response JSON NULL COMMENT 'Response completo de Flow en este evento',
  request_ip VARCHAR(45) NULL COMMENT 'IP de donde vino el request',
  details TEXT NULL COMMENT 'Descripción del evento o error',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Log de cambios de estado - trazabilidad para soporte Flow';
