import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getCart, replaceCart, clearCart } from '../controllers/cart.controller.js';

const router = express.Router();
router.use(protect);
router.get('/', getCart);
router.put('/', replaceCart);
router.delete('/', clearCart);

export default router;
