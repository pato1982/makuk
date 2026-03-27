-- ============================================
-- MAKUK DB - Esquema completo
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_recovery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recovery_key VARCHAR(255) NOT NULL,
  used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- HEADER + NAV
-- ============================================

CREATE TABLE IF NOT EXISTS header (
  id INT AUTO_INCREMENT PRIMARY KEY,
  logo VARCHAR(255) NOT NULL DEFAULT 'MAKUK',
  tagline VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS nav_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  header_id INT NOT NULL DEFAULT 1,
  label VARCHAR(100) NOT NULL,
  section_id VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (header_id) REFERENCES header(id) ON DELETE CASCADE
);

-- ============================================
-- HERO
-- ============================================

CREATE TABLE IF NOT EXISTS hero (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  subtitle TEXT,
  cta_text VARCHAR(255) DEFAULT '',
  background_image VARCHAR(500) DEFAULT ''
);

-- ============================================
-- INTRO
-- ============================================

CREATE TABLE IF NOT EXISTS intro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  paragraph TEXT
);

-- ============================================
-- CATEGORIAS
-- ============================================

CREATE TABLE IF NOT EXISTS categories_section (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  subtitle VARCHAR(500) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(500) DEFAULT '',
  sort_order INT DEFAULT 0
);

-- ============================================
-- PRODUCTOS
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  imagen VARCHAR(500) DEFAULT '',
  precio_actual INT DEFAULT 0,
  precio_anterior INT DEFAULT 0,
  descripcion TEXT,
  delivery_time VARCHAR(100) DEFAULT '',
  destacado TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  image_pos_x DECIMAL(5,2) DEFAULT 50.00,
  image_pos_y DECIMAL(5,2) DEFAULT 50.00,
  image_zoom DECIMAL(3,2) DEFAULT 1.00
);

-- ============================================
-- PIEZAS UNICAS
-- ============================================

CREATE TABLE IF NOT EXISTS unique_pieces_section (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  subtitle TEXT
);

-- ============================================
-- ABOUT (NOSOTROS)
-- ============================================

CREATE TABLE IF NOT EXISTS about (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  image VARCHAR(500) DEFAULT '',
  paragraphs JSON
);

CREATE TABLE IF NOT EXISTS about_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  about_id INT NOT NULL DEFAULT 1,
  icon VARCHAR(100) DEFAULT '',
  text VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (about_id) REFERENCES about(id) ON DELETE CASCADE
);

-- ============================================
-- PROCESO
-- ============================================

CREATE TABLE IF NOT EXISTS process_section (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS process_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  process_id INT NOT NULL DEFAULT 1,
  icon VARCHAR(100) DEFAULT '',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (process_id) REFERENCES process_section(id) ON DELETE CASCADE
);

-- ============================================
-- PRESENCIA GLOBAL
-- ============================================

CREATE TABLE IF NOT EXISTS worldwide (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  subtitle VARCHAR(500) DEFAULT '',
  paragraph TEXT
);

CREATE TABLE IF NOT EXISTS worldwide_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worldwide_id INT NOT NULL DEFAULT 1,
  numero VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  label_corta VARCHAR(100) DEFAULT '',
  sort_order INT DEFAULT 0,
  FOREIGN KEY (worldwide_id) REFERENCES worldwide(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS worldwide_countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worldwide_id INT NOT NULL DEFAULT 1,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(500) DEFAULT '',
  sort_order INT DEFAULT 0,
  FOREIGN KEY (worldwide_id) REFERENCES worldwide(id) ON DELETE CASCADE
);

-- ============================================
-- TESTIMONIOS
-- ============================================

CREATE TABLE IF NOT EXISTS testimonials_section (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL DEFAULT 1,
  texto TEXT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(255) DEFAULT '',
  sort_order INT DEFAULT 0,
  FOREIGN KEY (section_id) REFERENCES testimonials_section(id) ON DELETE CASCADE
);

-- ============================================
-- FOOTER
-- ============================================

CREATE TABLE IF NOT EXISTS footer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  logo VARCHAR(255) DEFAULT 'MAKUK',
  description TEXT,
  facebook_url VARCHAR(500) DEFAULT '',
  instagram_url VARCHAR(500) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  whatsapp_number VARCHAR(50) DEFAULT '',
  whatsapp_display VARCHAR(100) DEFAULT '',
  address VARCHAR(500) DEFAULT '',
  copyright TEXT,
  credits VARCHAR(255) DEFAULT ''
);

-- ============================================
-- PAGINA PRODUCTOS
-- ============================================

CREATE TABLE IF NOT EXISTS products_page (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) DEFAULT '',
  subtitle VARCHAR(500) DEFAULT '',
  filter_all_text VARCHAR(255) DEFAULT '',
  sort_labels JSON
);
