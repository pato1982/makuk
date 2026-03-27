import { Router } from 'express';
import { SHIPPING_ZONES, DEFAULT_SHIPPING_PRICE, DEFAULT_SHIPPING_NAME, getShippingCost } from '../data/shippingZones.js';

const router = Router();

// GET /api/shipping/cost?commune=Santiago
router.get('/cost', (req, res) => {
  const { commune } = req.query;
  const result = getShippingCost(commune);
  res.json(result);
});

// GET /api/shipping/zones — devuelve todas las zonas (para info)
router.get('/zones', (req, res) => {
  res.json({
    zones: SHIPPING_ZONES,
    default: { zone: DEFAULT_SHIPPING_NAME, price: DEFAULT_SHIPPING_PRICE },
  });
});

export default router;
