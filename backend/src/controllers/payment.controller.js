import crypto from 'crypto';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import PaymentTransaction from '../models/PaymentTransaction.js';
import Cart from '../models/Cart.js';
import {
  getCheckoutItems,
  calculateCheckout,
  decrementStock,
  createOrderRecord
} from '../services/order.service.js';

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay test credentials are not configured');
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

const getRequestItems = async (user, items) => {
  if (Array.isArray(items) && items.length) return getCheckoutItems(items);
  const cart = await Cart.findOne({ user: user._id }).lean();
  return getCheckoutItems(cart?.items || []);
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const checkoutItems = await getRequestItems(req.user, req.body.items);
    const checkout = calculateCheckout(checkoutItems);
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({ amount: Math.round(checkout.totalAmount * 100), currency: 'INR', receipt: `swd_${Date.now()}` });
    await PaymentTransaction.create({
      razorpayOrderId: razorpayOrder.id,
      user: req.user._id,
      amount: checkout.totalAmount,
      paymentMethod: 'Razorpay',
      status: 'Created'
    });
    return res.status(201).json({ success: true, data: { keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: razorpayOrder.id, amount: checkout.totalAmount, currency: 'INR', checkout } });
  } catch (error) {
    return res.status(503).json({ success: false, message: error.message || 'Unable to create payment order' });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature, shippingAddress, notes } = req.body;
  if (!razorpayOrderId || !paymentId || !signature) return res.status(400).json({ success: false, message: 'Incomplete Razorpay payment response' });
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${paymentId}`).digest('hex');
  if (expected !== signature) return res.status(400).json({ success: false, message: 'Payment signature verification failed' });

  const session = await mongoose.startSession();
  try {
    const transaction = await PaymentTransaction.findOne({ razorpayOrderId, user: req.user._id });
    if (!transaction) return res.status(404).json({ success: false, message: 'Payment transaction not found' });
    if (transaction.status === 'Paid' && transaction.order) return res.json({ success: true, data: await transaction.populate('order') });
    const checkoutItems = await getRequestItems(req.user, req.body.items);
    const checkout = calculateCheckout(checkoutItems);
    if (Math.round(checkout.totalAmount * 100) !== Number(transaction.amount) * 100) return res.status(400).json({ success: false, message: 'Payment amount no longer matches the current cart' });

    let order;
    await session.withTransaction(async () => {
      await decrementStock(checkoutItems, session);
      order = await createOrderRecord({ user: req.user, shippingAddress, checkout, paymentMethod: 'Razorpay', paymentStatus: 'Paid', notes, session });
      await PaymentTransaction.updateOne({ _id: transaction._id }, { paymentId, order: order._id, status: 'Paid', paidAt: new Date() }, { session });
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { session });
    });
    return res.status(201).json({ success: true, message: 'Payment verified and order created', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  } finally {
    await session.endSession();
  }
};

export const getPaymentTransactions = async (req, res) => {
  try {
    const transactions = await PaymentTransaction.find().sort({ createdAt: -1 }).populate('user', 'name email').populate('order', 'orderNumber');
    return res.json({ success: true, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch payment transactions' });
  }
};
