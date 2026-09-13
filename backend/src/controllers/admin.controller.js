import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { recalculateProductRating } from './review.controller.js';

const ensureDbConnected = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database is connecting. Please ensure your IP is whitelisted in MongoDB Atlas Network Access.'
    });
    return false;
  }
  return true;
};

/**
 * @desc    Get comprehensive admin dashboard analytics & metrics
 * @route   GET /api/admin/dashboard
 */
export const getDashboardStats = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      revenueAgg,
      lowStockCount,
      lowStockProducts,
      recentOrders,
      ordersByStatusAgg
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Product.find({ stock: { $lte: 5 } })
        .select('name price stock category brand images availability')
        .limit(10),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('user', 'name email phone'),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ])
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const ordersByStatus = {};
    ordersByStatusAgg.forEach((item) => {
      ordersByStatus[item._id] = { count: item.count, revenue: item.revenue };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockCount,
        lowStockProducts,
        recentOrders,
        ordersByStatus
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin dashboard statistics'
    });
  }
};

/**
 * @desc    Get all customers with order statistics
 * @route   GET /api/admin/customers
 */
export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: 'customer' };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const customers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    // Enhance customer records with order aggregates
    const customerIds = customers.map((c) => c._id);
    const orderAggs = await Order.aggregate([
      { $match: { user: { $in: customerIds } } },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' }
        }
      }
    ]);

    const orderMap = {};
    orderAggs.forEach((agg) => {
      orderMap[agg._id.toString()] = agg;
    });

    const enhanced = customers.map((c) => {
      const stats = orderMap[c._id.toString()] || {
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: null
      };
      return {
        ...c.toObject(),
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate
      };
    });

    return res.status(200).json({
      success: true,
      count: enhanced.length,
      data: enhanced
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customer list'
    });
  }
};

/**
 * @desc    Get single customer profile with orders
 * @route   GET /api/admin/customers/:id
 */
export const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: 'customer'
    }).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const orders = await Order.find({ user: customer._id }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      data: {
        customer,
        orders
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customer details'
    });
  }
};

/**
 * @desc    Get all orders with filtering & search
 * @route   GET /api/admin/orders
 */
export const getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { orderNumber: regex },
        { 'customer.name': regex },
        { 'customer.email': regex },
        { 'customer.phone': regex }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name email phone'),
      Order.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      data: orders
    });
  } catch (error) {
    console.error('Error in getOrders:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

/**
 * @desc    Get single order details
 * @route   GET /api/admin/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images category brand');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch order details'
    });
  }
};

/**
 * @desc    Update order status in workflow
 * @route   PATCH /api/admin/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowedStatuses = [
      'Ordered',
      'Confirmed',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const wasCancelled = order.status === 'Cancelled';
    if (status === 'Cancelled' && !wasCancelled && !order.stockRestored) {
      await Promise.all(order.items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) return;
        product.stock += item.quantity;
        await product.save();
      }));
      order.stockRestored = true;
    }
    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order transitioned to ${status}`
    });

    if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status'
    });
  }
};

/**
 * @desc    Quick update product stock quantity (never negative)
 * @route   PATCH /api/admin/products/:id/stock
 */
export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || isNaN(Number(stock))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid numeric stock quantity'
      });
    }

    const numericStock = Math.floor(Number(stock));
    if (numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be negative'
      });
    }

    let availability = 'In Stock';
    if (numericStock === 0) {
      availability = 'Out of Stock';
    } else if (numericStock === 1) {
      availability = 'Only 1 Left';
    } else if (numericStock === 2) {
      availability = 'Only 2 Left';
    } else if (numericStock === 3) {
      availability = 'Only 3 Left';
    } else if (numericStock <= 5) {
      availability = 'Limited Stock';
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        stock: numericStock,
        availability
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update stock quantity'
    });
  }
};

/**
 * @desc    Get all reviews for moderation
 * @route   GET /api/admin/reviews
 */
export const getReviews = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ customerName: regex }, { comment: regex }];
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .populate('product', 'name images category brand price');

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error in getReviews:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch reviews'
    });
  }
};

/**
 * @desc    Moderate review status (approved / hidden)
 * @route   PATCH /api/admin/reviews/:id/status
 */
export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'hidden', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of 'pending', 'approved', 'rejected', or 'hidden'"
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await recalculateProductRating(review.product);

    return res.status(200).json({
      success: true,
      message: `Review status changed to ${status}`,
      data: review
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update review status'
    });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/admin/reviews/:id
 */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await recalculateProductRating(review.product);

    return res.status(200).json({
      success: true,
      message: 'Review removed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete review'
    });
  }
};
