const User = require('../models/User');
const Project = require('../models/Project');
const Contract = require('../models/Contract');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const Review = require('../models/Review');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, freelancers, employers, activeProjects, totalContracts, totalRevenue] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'employer' }),
      Project.countDocuments({ status: 'active' }),
      Contract.countDocuments(),
      Payment.aggregate([{ $match: { escrowStatus: 'released' } }, { $group: { _id: null, total: { $sum: '$platformFee' } } }])
    ]);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) } });
    res.json({ success: true, data: { totalUsers, freelancers, employers, activeProjects, totalContracts, platformRevenue: totalRevenue[0]?.total || 0, newUsersToday } });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, isActive, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip((page-1)*limit).limit(Number(limit)),
      User.countDocuments(query)
    ]);
    res.json({ success: true, count: users.length, total, pages: Math.ceil(total/limit), data: users });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive, role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.getDisputes = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const disputes = await Dispute.find(query)
      .populate('raisedBy', 'name email').populate('againstUser', 'name email')
      .populate('contract', 'title totalAmount').sort('-createdAt');
    res.json({ success: true, count: disputes.length, data: disputes });
  } catch (err) { next(err); }
};

exports.resolveDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id).populate('contract');
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    const { resolution, resolutionDetails } = req.body;
    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolutionDetails = resolutionDetails;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    const contract = dispute.contract;
    if (resolution === 'full_payment_released') {
      contract.status = 'completed';
    } else if (resolution === 'full_refund') {
      contract.status = 'cancelled';
    }
    await contract.save();

    const { createNotification } = require('../utils/notifications');
    const io = req.app.get('io');
    for (const userId of [dispute.raisedBy, dispute.againstUser]) {
      await createNotification(io, { userId, type: 'dispute', title: 'Dispute Resolved', message: `Your dispute has been resolved: ${resolutionDetails}`, relatedEntityType: 'dispute', relatedEntityId: dispute._id, actionUrl: '/dashboard' });
    }

    res.json({ success: true, data: dispute });
  } catch (err) { next(err); }
};

exports.getProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const [projects, total] = await Promise.all([
      Project.find(query).populate('employer', 'name email').sort('-createdAt').skip((page-1)*limit).limit(Number(limit)),
      Project.countDocuments(query)
    ]);
    res.json({ success: true, count: projects.length, total, data: projects });
  } catch (err) { next(err); }
};

exports.removeContent = async (req, res, next) => {
  try {
    const { type, id, reason } = req.body;
    if (type === 'project') await Project.findByIdAndUpdate(id, { status: 'cancelled' });
    else if (type === 'review') await Review.findByIdAndDelete(id);
    res.json({ success: true, message: 'Content removed' });
  } catch (err) { next(err); }
};
