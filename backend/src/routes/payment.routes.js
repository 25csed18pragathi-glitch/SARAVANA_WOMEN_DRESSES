import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { createRazorpayOrder, verifyRazorpayPayment, getPaymentTransactions } from '../controllers/payment.controller.js';

const router = express.Router();
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);
router.get('/transactions', protect, adminOnly, getPaymentTransactions);

export default router;
