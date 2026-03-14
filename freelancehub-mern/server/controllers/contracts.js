const Contract = require('../models/Contract');
const Project = require('../models/Project');
const { createNotification } = require('../utils/notifications');
const { sendEmail, emailTemplates } = require('../utils/email');
const User = require('../models/User');

exports.getMyContracts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = req.user.role === 'freelancer' ? { freelancer: req.user._id } : { employer: req.user._id };
    if (status) query.status = status;
    const contracts = await Contract.find(query)
      .populate('project', 'title category')
      .populate('employer', 'name avatar')
      .populate('freelancer', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, count: contracts.length, data: contracts });
  } catch (err) { next(err); }
};

exports.getContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('project').populate('employer', 'name avatar email').populate('freelancer', 'name avatar email');
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    const isParty = [contract.employer._id.toString(), contract.freelancer._id.toString()].includes(req.user._id.toString());
    if (!isParty && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorised' });
    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
};

exports.acceptContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.freelancer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });
    if (contract.status !== 'pending_acceptance') return res.status(400).json({ success: false, message: 'Contract cannot be accepted at this stage' });

    contract.status = 'active';
    contract.freelancerAccepted = true;
    contract.startDate = new Date();
    await contract.save();

    await Project.findByIdAndUpdate(contract.project, { status: 'in_progress' });

    const io = req.app.get('io');
    await createNotification(io, { userId: contract.employer, type: 'contract', title: 'Contract Accepted', message: `Freelancer accepted your contract. Work has begun!`, relatedEntityType: 'contract', relatedEntityId: contract._id, actionUrl: `/contracts/${contract._id}` });

    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
};

exports.submitMilestone = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.freelancer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });

    const { milestoneId, deliverables } = req.body;
    const milestone = contract.milestones.id(milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    milestone.status = 'submitted';
    milestone.deliverables = deliverables || [];
    milestone.submittedAt = new Date();
    await contract.save();

    const allSubmitted = contract.milestones.every(m => m.status === 'submitted' || m.status === 'approved');
    if (allSubmitted && contract.milestones.length > 0) {
      await Project.findByIdAndUpdate(contract.project, { status: 'submitted' });
    }

    const io = req.app.get('io');
    await createNotification(io, { userId: contract.employer, type: 'contract', title: 'Work Submitted', message: `Milestone "${milestone.title}" has been submitted for review`, relatedEntityType: 'contract', relatedEntityId: contract._id, actionUrl: `/contracts/${contract._id}` });

    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
};

exports.submitFullWork = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.freelancer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });

    contract.status = 'active';
    await Project.findByIdAndUpdate(contract.project, { status: 'submitted' });
    await contract.save();

    const io = req.app.get('io');
    await createNotification(io, { userId: contract.employer, type: 'contract', title: 'Work Submitted for Review', message: 'The freelancer has submitted the completed work', relatedEntityType: 'contract', relatedEntityId: contract._id, actionUrl: `/contracts/${contract._id}` });

    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
};

exports.requestRevision = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.employer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });

    if (req.body.milestoneId) {
      const milestone = contract.milestones.id(req.body.milestoneId);
      if (milestone) milestone.status = 'revision_requested';
    }
    await contract.save();
    await Project.findByIdAndUpdate(contract.project, { status: 'in_progress' });

    const io = req.app.get('io');
    await createNotification(io, { userId: contract.freelancer, type: 'contract', title: 'Revision Requested', message: `Client requested a revision: ${req.body.reason || 'Please review the feedback'}`, relatedEntityType: 'contract', relatedEntityId: contract._id, actionUrl: `/contracts/${contract._id}` });

    res.json({ success: true, message: 'Revision requested' });
  } catch (err) { next(err); }
};

exports.logTime = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.freelancer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });
    if (contract.budgetType !== 'hourly') return res.status(400).json({ success: false, message: 'Not an hourly contract' });

    const { date, hours, description } = req.body;
    contract.timeEntries.push({ date, hours, description });
    contract.hoursLogged += Number(hours);
    await contract.save();

    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
};

exports.createDirectContract = async (req, res, next) => {
  try {
    const { freelancerId, title, terms, totalAmount, budgetType, hourlyRate, milestones } = req.body;
    const contract = await Contract.create({
      employer: req.user._id, freelancer: freelancerId,
      title, terms, totalAmount, budgetType, hourlyRate,
      milestones: milestones || [], status: 'pending_acceptance'
    });

    const freelancer = await User.findById(freelancerId);
    const io = req.app.get('io');
    await createNotification(io, { userId: freelancerId, type: 'contract', title: 'Direct Contract Offer', message: `${req.user.name} sent you a direct contract: "${title}"`, relatedEntityType: 'contract', relatedEntityId: contract._id, actionUrl: `/contracts/${contract._id}` });

    try {
      await sendEmail({ to: freelancer.email, subject: `Direct Contract: ${title}`, html: emailTemplates.contractCreated(freelancer.name, title) });
    } catch (e) {}

    res.status(201).json({ success: true, data: contract });
  } catch (err) { next(err); }
};
