const Review = require('../models/Review');
const Contract = require('../models/Contract');
const FreelancerProfile = require('../models/FreelancerProfile');
const EmployerProfile = require('../models/EmployerProfile');

const updateUserRating = async (userId, role) => {
  const reviews = await Review.find({ reviewee: userId, isPublic: true });
  if (!reviews.length) return;
  const avg = reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length;
  const rounded = Math.round(avg * 10) / 10;
  if (role === 'freelancer') {
    await FreelancerProfile.findOneAndUpdate({ user: userId }, { averageRating: rounded, totalReviews: reviews.length });
  } else {
    await EmployerProfile.findOneAndUpdate({ user: userId }, { averageRating: rounded, totalReviews: reviews.length });
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { contractId, overallRating, ratings, comment } = req.body;
    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only review completed contracts' });

    const isEmployer = contract.employer.toString() === req.user._id.toString();
    const isFreelancer = contract.freelancer.toString() === req.user._id.toString();
    if (!isEmployer && !isFreelancer) return res.status(403).json({ success: false, message: 'Not authorised' });

    const revieweeId = isEmployer ? contract.freelancer : contract.employer;
    const existing = await Review.findOne({ contract: contractId, reviewer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed this contract' });

    const review = await Review.create({
      contract: contractId, project: contract.project,
      reviewer: req.user._id, reviewee: revieweeId,
      reviewerRole: isEmployer ? 'employer' : 'freelancer',
      ratings, overallRating, comment
    });

    const revieweeUser = isEmployer ? await require('../models/User').findById(revieweeId) : await require('../models/User').findById(revieweeId);
    await updateUserRating(revieweeId, revieweeUser?.role);

    if (req.user.role === 'employer') {
      const fl = await FreelancerProfile.findOne({ user: contract.freelancer });
      if (fl) {
        const reviews = await Review.find({ reviewee: contract.freelancer });
        const avg = reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length;
        const completedCount = fl.completedJobs;
        let jss = Math.min(100, Math.round(avg * 18 + Math.min(completedCount * 2, 10)));
        fl.jss = jss;
        if (jss >= 90 && completedCount >= 20) fl.sellerLevel = 'topRated';
        else if (jss >= 80 && completedCount >= 10) fl.sellerLevel = 'level2';
        else if (completedCount >= 5) fl.sellerLevel = 'level1';
        await fl.save();
      }
    }

    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

exports.getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ reviewee: req.params.userId, isPublic: true })
      .populate('reviewer', 'name avatar role')
      .populate('project', 'title')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments({ reviewee: req.params.userId, isPublic: true });
    res.json({ success: true, count: reviews.length, total, data: reviews });
  } catch (err) { next(err); }
};

exports.getGigReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId, isPublic: true })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) { next(err); }
};
