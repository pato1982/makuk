import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  updateHeader, updateHero, updateIntro,
  updateCategories, updateProducts, updateUniquePieces,
  updateAbout, updateProcess, updateWorldwide,
  updateTestimonials, updateFooter, updateProductsPage,
  getStats
} from '../controllers/adminController.js';

const router = Router();

// Todas las rutas requieren JWT
router.use(requireAuth);

router.put('/header', updateHeader);
router.put('/hero', updateHero);
router.put('/intro', updateIntro);
router.put('/categories', updateCategories);
router.put('/products', updateProducts);
router.put('/unique-pieces', updateUniquePieces);
router.put('/about', updateAbout);
router.put('/process', updateProcess);
router.put('/worldwide', updateWorldwide);
router.put('/testimonials', updateTestimonials);
router.put('/footer', updateFooter);
router.put('/products-page', updateProductsPage);
router.get('/stats', getStats);

export default router;
