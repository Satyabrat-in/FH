const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  contract: { type: mongoose.Schema.ObjectId, ref: 'Contract' },
  project: { type: mongoose.Schema.ObjectId, ref: 'Project' },
  gig: { type: mongoose.Schema.ObjectId, ref: 'Gig' },
  payer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  payee: { type: mongoose.Schema.ObjectId, ref: 'User' },
  amount: { type: Number, required: true, min: 0 },
  platformFee: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  type: { type: String, enum: ['escrow_deposit', 'milestone_release', 'gig_payment', 'withdrawal', 'refund', 'connects_purchase', 'membership'], required: true },
  escrowStatus: { type: String, enum: ['pending', 'deposited', 'released', 'refunded', 'disputed', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['razorpay', 'upi', 'bank_transfer', 'paytm', 'paypal', 'wallet'], default: 'razorpay' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  milestoneId: mongoose.Schema.ObjectId,
  notes: String,
  depositedAt: Date,
  releasedAt: Date,
  refundedAt: Date
}, { timestamps: true });

paymentSchema.index({ payer: 1, type: 1 });
paymentSchema.index({ payee: 1, type: 1 });
paymentSchema.index({ contract: 1 });
paymentSchema.index({ escrowStatus: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
