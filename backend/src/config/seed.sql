-- ============================================
-- MAKUK DB - Datos iniciales desde content.json
-- ============================================

-- HEADER
INSERT INTO header (id, logo, tagline) VALUES
(1, 'MAKUK', 'Joyería Tejida en Cobre');

-- NAV ITEMS
INSERT INTO nav_items (header_id, label, section_id, sort_order) VALUES
(1, 'Inicio', 'inicio', 1),
(1, 'Colecciones', 'categorias', 2),
(1, 'Nosotros', 'nosotros', 3),
(1, 'Presencia Global', 'mundial', 4),
(1, 'Contacto', 'contacto', 5);

-- HERO
INSERT INTO hero (id, title, subtitle, cta_text, background_image) VALUES
(1, 'El Arte de la Elegancia', 'Joyas únicas tejidas a mano en cobre, con el alma de la artesanía chilena', 'Descubrir Colección', 'banner.jpg');

-- INTRO
INSERT INTO intro (id, title, paragraph) VALUES
(1, 'Artesanía que cuenta historias', 'Somos una joyería exclusiva que domina el arte de tejer el cobre. Cada pieza es una obra maestra que fusiona diseño contemporáneo con técnicas artesanales chilenas transmitidas por generaciones.');

-- CATEGORIES SECTION
INSERT INTO categories_section (id, title, subtitle) VALUES
(1, 'Nuestras Colecciones', 'Explora nuestra exclusiva selección de joyas artesanales');

-- CATEGORIES
INSERT INTO categories (slug, nombre, descripcion, imagen, sort_order) VALUES
('pulseras', 'Pulseras', 'Tejidos únicos para tu muñeca', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=300&fit=crop', 1),
('collares', 'Collares', 'Elegancia que abraza tu cuello', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop', 2),
('pendientes', 'Pendientes', 'Detalles que iluminan tu rostro', 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=300&fit=crop', 3),
('anillos', 'Anillos', 'Círculos de arte en tus dedos', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=300&fit=crop', 4),
('tobilleras', 'Tobilleras', 'Gracia para cada paso', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop', 5),
('broches', 'Broches', 'Accesorios con personalidad', 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=300&fit=crop', 6),
('diademas', 'Diademas', 'Corona tu belleza natural', 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=400&h=300&fit=crop', 7),
('sets', 'Sets Completos', 'Conjuntos armoniosos', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop', 8),
('personalizadas', 'Personalizadas', 'Diseños únicos para ti', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=300&fit=crop', 9),
('limitada', 'Edición Limitada', 'Piezas exclusivas de colección', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=300&fit=crop', 10);

-- PRODUCTS
INSERT INTO products (nombre, categoria, imagen, precio_actual, precio_anterior, descripcion, destacado, sort_order) VALUES
('Pulsera Andina', 'pulseras', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop', 45000, 55000, 'Pulsera tejida a mano con la técnica ancestral del cobre chileno. Cada pieza es única.', 1, 1),
('Collar Espiral', 'collares', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', 78000, 95000, 'Collar con diseño espiral que representa la conexión con la naturaleza.', 1, 2),
('Anillo Tejido', 'anillos', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop', 32000, 40000, 'Anillo con tejido fino de cobre, perfecto para ocasiones especiales.', 0, 3),
('Pendientes Luna', 'pendientes', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop', 28000, 35000, 'Pendientes con forma de luna creciente, símbolo de renovación.', 1, 4),
('Tobillera Pacífico', 'tobilleras', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', 25000, 30000, 'Tobillera inspirada en las olas del océano Pacífico.', 0, 5),
('Brazalete Raíces', 'pulseras', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&h=400&fit=crop', 52000, 65000, 'Brazalete ancho con diseño de raíces entrelazadas.', 0, 6),
('Collar Alma', 'collares', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', 85000, 100000, 'Collar largo con colgante central de cobre tejido.', 0, 7),
('Set Completo Tierra', 'sets', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop', 120000, 150000, 'Set completo que incluye collar, pulsera y pendientes a juego.', 1, 8);

-- UNIQUE PIECES SECTION
INSERT INTO unique_pieces_section (id, title, subtitle) VALUES
(1, 'Piezas Únicas', 'Joyas irrepetibles, creadas una sola vez. Arte exclusivo para quienes buscan lo extraordinario.');

-- ABOUT
INSERT INTO about (id, title, image, paragraphs) VALUES
(1, 'Nuestra Historia', 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?w=600&h=500&fit=crop',
'["MAKUK nace de la pasión por la joyería en cobre y la artesanía de excelencia. Somos herederos de una tradición artesanal única: el arte de tejer el cobre chileno.","Cada pieza que creamos es el resultado de horas de dedicación, donde manos expertas transforman el cobre en obras de arte tejidas que llevan consigo elegancia atemporal.","Nuestra técnica exclusiva de diseño nos distingue en el mercado mundial. No solo vendemos joyas, compartimos arte y belleza con el mundo."]');

-- ABOUT FEATURES
INSERT INTO about_features (about_id, icon, text, sort_order) VALUES
(1, 'fa-gem', '100% Artesanal', 1),
(1, 'fa-gem', 'Cobre Tejido', 2),
(1, 'fa-heart', 'Hecho con Amor', 3);

-- PROCESS SECTION
INSERT INTO process_section (id, title) VALUES
(1, 'Nuestro Arte');

-- PROCESS STEPS
INSERT INTO process_steps (process_id, icon, title, description, sort_order) VALUES
(1, 'fa-gem', 'Selección', 'Elegimos el mejor cobre de la más alta pureza', 1),
(1, 'fa-fire', 'Preparación', 'Preparamos y damos forma a los hilos de cobre', 2),
(1, 'fa-hands', 'Creación', 'Manos expertas tejen cada pieza de cobre a mano', 3),
(1, 'fa-star', 'Perfección', 'Pulido y acabado de alta calidad', 4);

-- WORLDWIDE
INSERT INTO worldwide (id, title, subtitle, paragraph) VALUES
(1, 'Presencia Global', 'El arte de la joyería fina conquista el mundo', 'Nuestras joyas han cruzado fronteras para adornar a personas en los cinco continentes. La exclusividad de nuestros diseños tejidos en cobre ha cautivado a amantes del arte y la joyería en todo el mundo.');

-- WORLDWIDE STATS
INSERT INTO worldwide_stats (worldwide_id, numero, label, label_corta, sort_order) VALUES
(1, '25+', 'Países', 'Países', 1),
(1, '10K+', 'Clientes Felices', 'Clientes', 2),
(1, '15', 'Años de Experiencia', 'Trayectoria', 3),
(1, '100%', 'Artesanal', 'Artesanal', 4);

-- WORLDWIDE COUNTRIES
INSERT INTO worldwide_countries (worldwide_id, nombre, descripcion, imagen, sort_order) VALUES
(1, 'Francia', 'París nos recibe con elegancia', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop', 1),
(1, 'Estados Unidos', 'Nueva York ama nuestro arte', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=300&h=200&fit=crop', 2),
(1, 'Japón', 'Tokio valora la artesanía', 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=300&h=200&fit=crop', 3),
(1, 'España', 'Madrid celebra nuestra tradición', 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=300&h=200&fit=crop', 4),
(1, 'Australia', 'Sídney descubre el cobre', 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=300&h=200&fit=crop', 5),
(1, 'Italia', 'Roma aprecia la belleza', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&h=200&fit=crop', 6);

-- TESTIMONIALS SECTION
INSERT INTO testimonials_section (id, title) VALUES
(1, 'Lo Que Dicen Nuestros Clientes');

-- TESTIMONIALS
INSERT INTO testimonials (section_id, texto, nombre, ubicacion, sort_order) VALUES
(1, 'Una pieza de arte que llevo con orgullo. La calidad del tejido en cobre es simplemente incomparable.', 'María González', 'Madrid, España', 1),
(1, 'Nunca había visto algo así. El trabajo artesanal es exquisito y cada detalle cuenta una historia.', 'Sophie Dubois', 'París, Francia', 2),
(1, 'Un regalo perfecto que representa la belleza de Chile. Mi esposa quedó maravillada.', 'James Wilson', 'Nueva York, USA', 3),
(1, 'La artesanía chilena en su máxima expresión. Cada vez que uso mi collar recibo muchos cumplidos.', 'Laura Martínez', 'Buenos Aires, Argentina', 4),
(1, 'Increíble trabajo manual. Se nota el amor y dedicación en cada detalle del tejido de cobre.', 'Hans Müller', 'Berlín, Alemania', 5),
(1, 'Una joya única que conecta con la cultura chilena. La recomiendo a todos mis amigos.', 'Yuki Tanaka', 'Tokio, Japón', 6);

-- FOOTER
INSERT INTO footer (id, logo, description, facebook_url, instagram_url, email, whatsapp_number, whatsapp_display, address, copyright, credits) VALUES
(1, 'MAKUK', 'Joyería tejida en cobre, creada con pasión y dedicación desde Chile para el mundo.',
'https://facebook.com', 'https://instagram.com', 'contacto@makuk.cl',
'34612345678', '+34 612 345 678', 'Madrid, España',
'© 2024 MAKUK - Joyería Tejida en Cobre. Todos los derechos reservados.',
'Desarrollado por CHSystem');

-- PRODUCTS PAGE
INSERT INTO products_page (id, title, subtitle, filter_all_text, sort_labels) VALUES
(1, 'Nuestra Colección', 'Descubre el arte del cobre tejido', 'Todas las categorías',
'{"destacados":"Destacados","precio-menor":"Precio: Menor a Mayor","precio-mayor":"Precio: Mayor a Menor","nombre":"Nombre A-Z"}');
