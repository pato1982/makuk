import { Router } from 'express';
import { createOrder, handleConfirmation, handleReturn, getOrder } from '../controllers/orderController.js';

const router = Router();

// Fase 1: Frontend envía carrito + datos cliente → crea orden + llama Flow
router.post('/', createOrder);

// Fase 2: Flow envía webhook de confirmación (POST con token)
router.post('/confirm', handleConfirmation);

// Fase 3: Flow redirige al cliente aquí (POST con token) → redirige al frontend
router.post('/return', handleReturn);

// Consultar estado de una orden
router.get('/:commerceOrder', getOrder);

export default router;
