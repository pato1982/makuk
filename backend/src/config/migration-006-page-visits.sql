-- Migration 006: Tabla para registro de visitas al sitio
CREATE TABLE IF NOT EXISTS page_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page VARCHAR(255) NOT NULL DEFAULT '/',
  ip VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(512) DEFAULT NULL,
  visited_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visited_at (visited_at),
  INDEX idx_page (page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
