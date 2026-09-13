import express from 'express';
import {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateProductStock,
  getReviews,
  updateReviewStatus,
  deleteReview
} from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { getAdminShopSettings, updateShopSettings } from '../controllers/shopSettings.controller.js';

const router = express.Router();

// Apply auth and admin-only protection to all admin routes
router.use(protect, adminOnly);

router.get('/shop-settings', getAdminShopSettings);
router.put('/shop-settings', updateShopSettings);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// Stock
router.patch('/products/:id/stock', updateProductStock);

// Reviews
router.get('/reviews', getReviews);
router.patch('/reviews/:id/status', updateReviewStatus);
router.delete('/reviews/:id', deleteReview);

export default router;
