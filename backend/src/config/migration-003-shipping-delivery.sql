-- ============================================
-- Migración 003: Despacho, documento tributario y tiempo de entrega
-- ============================================

-- Agregar campos de despacho y documento a orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_region VARCHAR(255) DEFAULT NULL AFTER customer_phone,
  ADD COLUMN IF NOT EXISTS shipping_commune VARCHAR(255) DEFAULT NULL AFTER shipping_region,
  ADD COLUMN IF NOT EXISTS shipping_cost INT DEFAULT 0 AFTER shipping_commune,
  ADD COLUMN IF NOT EXISTS document_type ENUM('boleta', 'factura') DEFAULT 'boleta' AFTER shipping_cost;

-- Agregar en_transito al ENUM admin_status
ALTER TABLE orders
  MODIFY COLUMN admin_status ENUM('en_proceso', 'en_transito', 'entregado', 'cancelado', 'produciendo', 'enviado')
  DEFAULT 'en_proceso';

-- Agregar tiempo de entrega a productos
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS delivery_time VARCHAR(100) DEFAULT '' AFTER descripcion;
