import express from 'express';
import { getMyOrders, getOrderById, createOrder } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Customer order routes require authentication
router.use(protect);

router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);

export default router;
