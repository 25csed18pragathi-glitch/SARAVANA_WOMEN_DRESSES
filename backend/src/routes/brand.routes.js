import express from 'express';
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} from '../controllers/brand.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, adminOnly, createBrand)
  .get(getAllBrands);

router.route('/:id')
  .get(getBrandById)
  .put(protect, adminOnly, updateBrand)
  .delete(protect, adminOnly, deleteBrand);

export default router;
