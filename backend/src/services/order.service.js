import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getCheckoutItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) throw new Error('No order items specified');
  const normalized = [];
  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId || item.product || item._id)) throw new Error('Invalid product ID');
    const product = await Product.findById(item.productId || item.product || item._id);
    const quantity = Number(item.quantity);
    if (!product) throw new Error('One or more products no longer exist');
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error(`Invalid quantity for ${product.name}`);
    if (quantity > product.stock) throw new Error(`${product.name} has only ${product.stock} available`);
    normalized.push({
      product,
      quantity,
      size: item.size || 'Free Size',
      color: item.color || 'Standard',
      price: product.finalPrice ?? product.price
    });
  }
  return normalized;
};

export const calculateCheckout = (items) => {
  const normalized = items.reduce((result, item) => {
    result.push({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] || '',
      price: item.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity
    });
    return result;
  }, []);
  const subtotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 999 ? 0 : 99;
  return { items: normalized, subtotal, shippingFee, totalAmount: subtotal + shippingFee };
};

export const decrementStock = async (items, session) => {
  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product._id, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true, session }
    );
    if (!updated) throw new Error(`${item.product.name} is no longer available in the requested quantity`);
  }
};

export const createOrderRecord = async ({ user, shippingAddress, checkout, paymentMethod, paymentStatus, notes, session }) => {
  const orderNumber = `SWD-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
  const [order] = await Order.create([{
    orderNumber,
    user: user._id,
    customer: {
      name: user.name,
      email: user.email,
      phone: user.phone || shippingAddress?.phone || '',
      shippingAddress: {
        street: shippingAddress?.street || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || 'Tamil Nadu',
        pincode: shippingAddress?.pincode || ''
      }
    },
    items: checkout.items,
    totalAmount: checkout.totalAmount,
    paymentMethod,
    paymentStatus,
    status: 'Ordered',
    notes: notes || '',
    timeline: [{ status: 'Ordered', note: 'Order placed successfully by customer' }]
  }], { session });
  return order;
};
