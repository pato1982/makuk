-- Migration 007: Tabla de auditoría para acciones de administrador
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  user_email VARCHAR(255) DEFAULT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  action ENUM('crear', 'editar', 'eliminar') NOT NULL,
  section VARCHAR(100) NOT NULL,
  details TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_section (section),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
