import { Router } from 'express';
import { login, refresh, logout, requestRecovery, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/recovery', requestRecovery);
router.get('/me', requireAuth, me);

export default router;
