import express from 'express';
import { upload, uploadImage } from '../controllers/upload.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Allow single image upload on /api/upload
router.post('/', protect, adminOnly, upload.single('image'), uploadImage);

// Allow multi-image upload on /api/upload/multiple
router.post('/multiple', protect, adminOnly, upload.array('images', 8), uploadImage);

export default router;
