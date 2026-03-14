const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const Project = require('../models/Project');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const { createNotification } = require('../utils/notifications');
const { sendEmail, emailTemplates } = require('../utils/email');

const getRazorpay = () => new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

const PLATFORM_FEE = Number(process.env.PLATFORM_FEE_PERCENT || 5) / 100;

exports.createEscrowOrder = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.body.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.employer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });

    const amount = req.body.milestoneId
      ? contract.milestones.id(req.body.milestoneId)?.amount
      : contract.totalAmount;
    if (!amount) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: `esc_${contract._id}_${Date.now()}` });

    const platformFee = Math.round(amount * PLATFORM_FEE * 100) / 100;
    const payment = await Payment.create({
      contract: contract._id, project: contract.project,
      payer: req.user._id, payee: contract.freelancer,
      amount, platformFee, netAmount: amount - platformFee,
      type: 'escrow_deposit', escrowStatus: 'pending',
      razorpayOrderId: order.id,
      milestoneId: req.body.milestoneId || undefined
    });

    res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, paymentId: payment._id, keyId: process.env.RAZORPAY_KEY_ID } });
  } catch (err) { next(err); }
};

exports.verifyEscrowPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpaySignature) return res.status(400).json({ success: false, message: 'Payment verification failed' });

    const payment = await Payment.findByIdAndUpdate(paymentId, { escrowStatus: 'deposited', razorpayPaymentId, razorpaySignature, depositedAt: new Date() }, { new: true });

    if (payment.milestoneId) {
      const contract = await Contract.findById(payment.contract);
      const milestone = contract?.milestones.id(payment.milestoneId);
      if (milestone) { milestone.status = 'in_progress'; await contract.save(); }
    }

    const io = req.app.get('io');
    await createNotification(io, { userId: payment.payee, type: 'payment', title: 'Escrow Funded', message: `₹${payment.amount.toLocaleString('en-IN')} has been deposited in escrow. You can start work.`, relatedEntityType: 'payment', relatedEntityId: payment._id, actionUrl: '/dashboard' });

    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};

exports.releasePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('contract');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.payer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });
    if (payment.escrowStatus !== 'deposited') return res.status(400).json({ success: false, message: 'Payment is not in escrow' });

    payment.escrowStatus = 'released';
    payment.releasedAt = new Date();
    await payment.save();

    await User.findByIdAndUpdate(payment.payee, { $inc: { totalEarned: payment.netAmount } });
    await FreelancerProfile.findOneAndUpdate({ user: payment.payee }, { $inc: { totalEarnings: payment.netAmount, completedJobs: 1 } });
    await EmployerProfile.findOneAndUpdate({ user: payment.payer }, { $inc: { totalSpent: payment.amount } });

    const contract = payment.contract;
    const allPayments = await Payment.find({ contract: contract._id, type: 'escrow_deposit' });
    const allReleased = allPayments.every(p => p.escrowStatus === 'released');
    if (allReleased) {
      contract.status = 'completed';
      contract.completedAt = new Date();
      await contract.save();
      if (contract.project) await Project.findByIdAndUpdate(contract.project, { status: 'completed' });
    }

    const freelancer = await User.findById(payment.payee);
    const io = req.app.get('io');
    await createNotification(io, { userId: payment.payee, type: 'payment', title: 'Payment Released!', message: `₹${payment.netAmount.toLocaleString('en-IN')} has been released to your account`, relatedEntityType: 'payment', relatedEntityId: payment._id, actionUrl: '/dashboard' });

    try {
      const project = await Project.findById(payment.project);
      await sendEmail({ to: freelancer.email, subject: 'Payment Released', html: emailTemplates.paymentReleased(freelancer.name, payment.netAmount, project?.title || 'your project') });
    } catch (e) {}

    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const query = req.user.role === 'employer' ? { payer: req.user._id } : { payee: req.user._id };
    const payments = await Payment.find(query).populate('project', 'title').populate('contract', 'title').sort('-createdAt');
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) { next(err); }
};

exports.getEarningsSummary = async (req, res, next) => {
  try {
    const payments = await Payment.find({ payee: req.user._id, escrowStatus: 'released' });
    const inEscrow = await Payment.aggregate([{ $match: { payee: req.user._id, escrowStatus: 'deposited' } }, { $group: { _id: null, total: { $sum: '$netAmount' } } }]);
    const byMonth = await Payment.aggregate([
      { $match: { payee: req.user._id, escrowStatus: 'released', releasedAt: { $exists: true } } },
      { $group: { _id: { year: { $year: '$releasedAt' }, month: { $month: '$releasedAt' } }, total: { $sum: '$netAmount' } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    const totalEarned = payments.reduce((s, p) => s + p.netAmount, 0);
    res.json({ success: true, data: { totalEarned, inEscrow: inEscrow[0]?.total || 0, byMonth } });
  } catch (err) { next(err); }
};

exports.buyConnects = async (req, res, next) => {
  try {
    const { amount, connects } = req.body;
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: `conn_${req.user._id}_${Date.now()}` });
    res.json({ success: true, data: { orderId: order.id, amount: order.amount, connects, keyId: process.env.RAZORPAY_KEY_ID } });
  } catch (err) { next(err); }
};

exports.verifyConnectsPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, connects } = req.body;
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    if (hmac.digest('hex') !== razorpaySignature) return res.status(400).json({ success: false, message: 'Verification failed' });

    const user = await User.findByIdAndUpdate(req.user._id, { $inc: { connects: Number(connects) } }, { new: true });
    res.json({ success: true, connects: user.connects });
  } catch (err) { next(err); }
};
