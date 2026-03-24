-- Migración: agregar columna admin_status a orders
-- Ejecutar en el VPS: mysql -u makuk_user -p makuk_db < migration-002-admin-status.sql

ALTER TABLE orders
  ADD COLUMN admin_status ENUM('en_proceso', 'cancelado', 'produciendo', 'enviado', 'entregado')
  DEFAULT 'en_proceso'
  COMMENT 'Estado administrativo de la orden (gestión interna)'
  AFTER status;
