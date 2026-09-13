import express from 'express';
import { getPublicShopSettings } from '../controllers/shopSettings.controller.js';

const router = express.Router();
router.get('/', getPublicShopSettings);

export default router;
