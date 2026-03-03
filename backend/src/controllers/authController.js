import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/db.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Guardar refresh token en DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// POST /api/auth/refresh
export async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token requerido' });
  }

  try {
    // Verificar que el token sea válido
    const payload = verifyRefreshToken(refreshToken);

    // Verificar que exista en DB y no esté expirado
    const [tokens] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [refreshToken]
    );

    if (tokens.length === 0) {
      return res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }

    // Obtener usuario
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [payload.id]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
    console.error('Error en refresh:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// POST /api/auth/logout
export async function logout(req, res) {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    }
    res.json({ message: 'Sesión cerrada' });
  } catch (err) {
    console.error('Error en logout:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// POST /api/auth/recovery
export async function requestRecovery(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requerido' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      // No revelar si el email existe o no
      return res.json({ message: 'Si el email existe, se generó una llave de recuperación' });
    }

    const user = users[0];
    const recoveryKey = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      'INSERT INTO password_recovery (user_id, recovery_key, expires_at) VALUES (?, ?, ?)',
      [user.id, recoveryKey, expiresAt]
    );

    // Por ahora solo log — en el futuro se puede enviar por email
    console.log(`Recovery key para ${email}: ${recoveryKey}`);

    res.json({ message: 'Si el email existe, se generó una llave de recuperación' });
  } catch (err) {
    console.error('Error en recovery:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// GET /api/auth/me (protegido)
export async function me(req, res) {
  try {
    const [users] = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error('Error en me:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
