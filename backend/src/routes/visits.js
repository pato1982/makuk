import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// POST /api/visits — registrar una visita (público, sin auth)
router.post('/', async (req, res) => {
  try {
    const page = req.body.page || '/';
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    await pool.query(
      'INSERT INTO page_visits (page, ip, user_agent) VALUES (?, ?, ?)',
      [page, ip, userAgent]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('Error registrando visita:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
