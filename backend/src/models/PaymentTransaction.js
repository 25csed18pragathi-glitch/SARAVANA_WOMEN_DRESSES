import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema(
  {
    paymentId: { type: String, index: true },
    razorpayOrderId: { type: String, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['Created', 'Paid', 'Failed', 'Refunded'], default: 'Created', index: true },
    paidAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('PaymentTransaction', paymentTransactionSchema);
