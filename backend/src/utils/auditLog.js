import pool from '../config/db.js';

/**
 * Registra una acción de administrador en la tabla de auditoría.
 *
 * @param {object} req - Express request (necesita req.user y headers para IP)
 * @param {'crear'|'editar'|'eliminar'} action - Tipo de acción
 * @param {string} section - Sección afectada (header, products, categories, etc.)
 * @param {string} details - Descripción legible del cambio
 */
export async function logAudit(req, action, section, details) {
  try {
    const userId = req.user?.id || null;
    const userEmail = req.user?.email || 'desconocido';
    const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for']?.split(',')[0] || req.ip || null;

    await pool.query(
      'INSERT INTO admin_audit_log (user_id, user_email, ip, action, section, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, userEmail, ip, action, section, details]
    );
  } catch (err) {
    // Nunca bloquear la operación principal por un error de auditoría
    console.error('Error registrando auditoría:', err.message);
  }
}
