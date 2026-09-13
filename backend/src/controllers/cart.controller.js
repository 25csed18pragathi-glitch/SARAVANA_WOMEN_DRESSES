import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    return res.json({ success: true, data: cart || { user: req.user._id, items: [] } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch cart' });
  }
};

export const replaceCart = async (req, res) => {
  try {
    const requestedItems = Array.isArray(req.body.items) ? req.body.items : [];
    const items = [];

    for (const item of requestedItems) {
      if (!isValidId(item.product)) return res.status(400).json({ success: false, message: 'Invalid product ID' });
      const product = await Product.findById(item.product).select('_id stock sizes colors');
      if (!product) return res.status(400).json({ success: false, message: 'Product no longer exists' });
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
        return res.status(400).json({ success: false, message: `${product._id} has only ${product.stock} available` });
      }
      items.push({ product: product._id, size: item.size || 'Free Size', color: item.color || 'Standard', quantity });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, items },
      { upsert: true, new: true, runValidators: true }
    ).populate('items.product');
    return res.json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to save cart' });
  }
};

export const clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });
  return res.json({ success: true, data: { items: [] } });
};
