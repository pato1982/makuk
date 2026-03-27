-- Migración 005: Posición y zoom para imagen_2 e imagen_3
ALTER TABLE products ADD COLUMN image2_pos_x DECIMAL(5,2) DEFAULT 50.00 AFTER imagen_3;
ALTER TABLE products ADD COLUMN image2_pos_y DECIMAL(5,2) DEFAULT 50.00 AFTER image2_pos_x;
ALTER TABLE products ADD COLUMN image2_zoom DECIMAL(3,2) DEFAULT 1.00 AFTER image2_pos_y;
ALTER TABLE products ADD COLUMN image3_pos_x DECIMAL(5,2) DEFAULT 50.00 AFTER image2_zoom;
ALTER TABLE products ADD COLUMN image3_pos_y DECIMAL(5,2) DEFAULT 50.00 AFTER image3_pos_x;
ALTER TABLE products ADD COLUMN image3_zoom DECIMAL(3,2) DEFAULT 1.00 AFTER image3_pos_y;
