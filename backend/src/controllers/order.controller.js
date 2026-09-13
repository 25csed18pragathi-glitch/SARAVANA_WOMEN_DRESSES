import Order from '../models/Order.js';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import {
  getCheckoutItems,
  calculateCheckout,
  decrementStock,
  createOrderRecord
} from '../services/order.service.js';

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders/my-orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

/**
 * @desc    Get single order details for customer or admin
 * @route   GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('items.product', 'name images price');
    } else {
      order = await Order.findOne({ orderNumber: id }).populate('items.product', 'name images price');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ensure customer can only view their own order
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this order'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order details'
    });
  }
};

/**
 * @desc    Create a new customer order
 * @route   POST /api/orders
 */
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { items, shippingAddress, paymentMethod = 'COD', notes } = req.body;
    if (paymentMethod !== 'COD') return res.status(400).json({ success: false, message: 'Online payments must be verified through Razorpay' });
    const checkoutItems = await getCheckoutItems(items);
    const checkout = calculateCheckout(checkoutItems);
    let order;
    await session.withTransaction(async () => {
      await decrementStock(checkoutItems, session);
      order = await createOrderRecord({ user: req.user, shippingAddress, checkout, paymentMethod, paymentStatus: 'Pending', notes, session });
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { session });
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating order'
    });
  } finally {
    await session.endSession();
  }
};
