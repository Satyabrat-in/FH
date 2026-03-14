const crypto = require('crypto');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const { sendEmail, emailTemplates } = require('../utils/email');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified, connects: user.connects, membershipPlan: user.membershipPlan } });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ success: false, message: 'All fields are required' });
    if (!['freelancer', 'employer'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role });

    if (role === 'freelancer') {
      await FreelancerProfile.create({ user: user._id });
    } else {
      await EmployerProfile.create({ user: user._id, companyName: req.body.companyName || name });
    }

    const verifyToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    try {
      await sendEmail({ to: user.email, subject: 'Verify your FreelanceHub account', html: emailTemplates.verification(user.name, verifyUrl) });
    } catch (e) {}

    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account suspended. Contact support.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ user: user._id });
    } else if (user.role === 'employer') {
      profile = await EmployerProfile.findOne({ user: user._id });
    }
    res.json({ success: true, user, profile });
  } catch (err) { next(err); }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ verificationToken: hashedToken });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    try {
      await sendEmail({ to: user.email, subject: 'FreelanceHub Password Reset', html: emailTemplates.passwordReset(user.name, resetUrl) });
    } catch (e) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};
