import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getProductReviews, createReview, getMyReviews } from '../controllers/review.controller.js';

const router = express.Router();
router.get('/product/:productId', getProductReviews);
router.use(protect);
router.get('/mine', getMyReviews);
router.post('/', createReview);

export default router;
