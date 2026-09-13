import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const recalculateRating = async (productId) => {
  const approved = await Review.find({ product: productId, status: 'approved' });
  const rating = approved.length ? approved.reduce((sum, review) => sum + review.rating, 0) / approved.length : 0;
  await Product.findByIdAndUpdate(productId, { rating: Number(rating.toFixed(1)), reviewCount: approved.length });
};

export const getProductReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' }).sort({ createdAt: -1 }).populate('user', 'name avatar');
    return res.json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch reviews' });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5 || !comment?.trim()) return res.status(400).json({ success: false, message: 'Rating must be 1 to 5 and review text is required' });
    const purchased = await Order.exists({ user: req.user._id, status: { $ne: 'Cancelled' }, 'items.product': productId });
    if (!purchased) return res.status(403).json({ success: false, message: 'You can review products purchased from your account' });
    if (await Review.exists({ user: req.user._id, product: productId })) return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    const review = await Review.create({ product: productId, user: req.user._id, customerName: req.user.name, customerAvatar: req.user.avatar, rating: numericRating, comment: comment.trim(), status: 'pending' });
    return res.status(201).json({ success: true, data: review, message: 'Review submitted for approval' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit review' });
  }
};

export const getMyReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('product', 'name images');
  return res.json({ success: true, data: reviews });
};

export const recalculateProductRating = recalculateRating;
