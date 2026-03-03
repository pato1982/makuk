import { Router } from 'express';
import { getAllContent } from '../controllers/contentController.js';

const router = Router();

router.get('/', getAllContent);

export default router;
