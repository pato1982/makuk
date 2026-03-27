-- Migración 004: Agregar imagen_2 e imagen_3 a productos
-- Permite hasta 3 imágenes por producto (carrusel en popup)

ALTER TABLE products ADD COLUMN imagen_2 VARCHAR(500) DEFAULT '' AFTER imagen;
ALTER TABLE products ADD COLUMN imagen_3 VARCHAR(500) DEFAULT '' AFTER imagen_2;
