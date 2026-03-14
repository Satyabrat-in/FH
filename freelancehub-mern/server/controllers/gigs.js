const Gig = require('../models/Gig');
const User = require('../models/User');

exports.getGigs = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, delivery, level, sort = '-averageRating', page = 1, limit = 12 } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query['packages.basic.price'] = {};
      if (minPrice) query['packages.basic.price'].$gte = Number(minPrice);
      if (maxPrice) query['packages.basic.price'].$lte = Number(maxPrice);
    }
    if (delivery) query['packages.basic.deliveryDays'] = { $lte: Number(delivery) };

    let gigs = await Gig.find(search ? { ...query, $text: { $search: search } } : query)
      .populate('seller', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (level) {
      const FreelancerProfile = require('../models/FreelancerProfile');
      const sellerIds = gigs.map(g => g.seller._id);
      const profiles = await FreelancerProfile.find({ user: { $in: sellerIds }, sellerLevel: level }).select('user');
      const levelUserIds = new Set(profiles.map(p => p.user.toString()));
      gigs = gigs.filter(g => levelUserIds.has(g.seller._id.toString()));
    }

    const total = await Gig.countDocuments(query);
    res.json({ success: true, count: gigs.length, total, pages: Math.ceil(total / limit), data: gigs });
  } catch (err) { next(err); }
};

exports.getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('seller', 'name avatar');
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    await Gig.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
    const FreelancerProfile = require('../models/FreelancerProfile');
    const sellerProfile = await FreelancerProfile.findOne({ user: gig.seller._id });
    res.json({ success: true, data: gig, sellerProfile });
  } catch (err) { next(err); }
};

exports.createGig = async (req, res, next) => {
  try {
    req.body.seller = req.user._id;
    const gig = await Gig.create(req.body);
    res.status(201).json({ success: true, data: gig });
  } catch (err) { next(err); }
};

exports.updateGig = async (req, res, next) => {
  try {
    let gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.seller.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });
    gig = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: gig });
  } catch (err) { next(err); }
};

exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.seller.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });
    await gig.deleteOne();
    res.json({ success: true, message: 'Gig deleted' });
  } catch (err) { next(err); }
};

exports.getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ seller: req.user._id }).sort('-createdAt');
    res.json({ success: true, count: gigs.length, data: gigs });
  } catch (err) { next(err); }
};

exports.orderGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.seller.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot order own gig' });

    const { packageType = 'basic' } = req.body;
    const pkg = gig.packages[packageType];
    if (!pkg || !pkg.price) return res.status(400).json({ success: false, message: 'Invalid package' });

    const contract = await require('../models/Contract').create({
      gig: gig._id, employer: req.user._id, freelancer: gig.seller,
      title: `Gig Order: ${gig.title} (${packageType})`,
      totalAmount: pkg.price, budgetType: 'fixed',
      milestones: [{ title: 'Delivery', description: pkg.description, amount: pkg.price, dueDate: new Date(Date.now() + pkg.deliveryDays * 24 * 60 * 60 * 1000) }],
      status: 'pending_acceptance'
    });

    const io = req.app.get('io');
    const { createNotification } = require('../utils/notifications');
    await createNotification(io, { userId: gig.seller, type: 'contract', title: 'New Gig Order', message: `${req.user.name} ordered your gig "${gig.title}"`, relatedEntityType: 'contract', relatedEntityId: contract._id, actionUrl: `/contracts/${contract._id}` });

    res.status(201).json({ success: true, data: contract });
  } catch (err) { next(err); }
};
