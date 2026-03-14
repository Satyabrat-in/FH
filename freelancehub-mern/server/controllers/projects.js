const Project = require('../models/Project');
const Application = require('../models/Application');
const Contract = require('../models/Contract');
const EmployerProfile = require('../models/EmployerProfile');
const { createNotification } = require('../utils/notifications');
const { findMatchesForProject } = require('../services/matching');

exports.getProjects = async (req, res, next) => {
  try {
    const { search, category, skills, minBudget, maxBudget, budgetType, duration, sort = '-createdAt', page = 1, limit = 12 } = req.query;
    const query = { status: 'active', visibility: 'public' };

    if (category) query.category = category;
    if (budgetType) query.budgetType = budgetType;
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }
    if (skills) query.skills = { $in: skills.split(',').map(s => new RegExp(s.trim(), 'i')) };

    let dbQuery = Project.find(search ? { ...query, $text: { $search: search } } : query)
      .populate('employer', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const [projects, total] = await Promise.all([dbQuery, Project.countDocuments(query)]);
    res.json({ success: true, count: projects.length, total, pages: Math.ceil(total / limit), data: projects });
  } catch (err) { next(err); }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('employer', 'name avatar').populate('awardedTo', 'name avatar');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await Project.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    let hasApplied = false;
    if (req.user) {
      const app = await Application.findOne({ project: project._id, freelancer: req.user._id });
      hasApplied = !!app;
    }
    res.json({ success: true, data: project, hasApplied });
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    req.body.employer = req.user._id;
    const project = await Project.create(req.body);
    await EmployerProfile.findOneAndUpdate({ user: req.user._id }, { $inc: { projectsPosted: 1 } });

    const io = req.app.get('io');
    const matches = await findMatchesForProject(project, 5);
    for (const match of matches) {
      await createNotification(io, { userId: match.profile.user._id || match.profile.user, type: 'project_match', title: 'New Project Match', message: `New project "${project.title}" matches your skills (${match.score}% match)`, relatedEntityType: 'project', relatedEntityId: project._id, actionUrl: `/projects/${project._id}` });
    }
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }
    project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }
    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

exports.getMyProjects = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { employer: req.user._id };
    if (status) query.status = status;
    const projects = await Project.find(query).sort('-createdAt').populate('awardedTo', 'name avatar');
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) { next(err); }
};

exports.awardProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.employer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });

    const { freelancerId } = req.body;
    const application = await Application.findOne({ project: project._id, freelancer: freelancerId });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    project.status = 'awarded';
    project.awardedTo = freelancerId;
    project.awardedAt = new Date();
    await project.save();

    application.status = 'awarded';
    await application.save();

    await Application.updateMany({ project: project._id, freelancer: { $ne: freelancerId }, status: 'submitted' }, { status: 'rejected' });

    const contract = await Contract.create({
      project: project._id, employer: req.user._id, freelancer: freelancerId,
      title: project.title, totalAmount: application.proposedBudget,
      budgetType: project.budgetType, milestones: project.milestones || [],
      status: 'pending_acceptance'
    });

    const io = req.app.get('io');
    await createNotification(io, { userId: freelancerId, type: 'contract', title: 'You got the project!', message: `You have been awarded "${project.title}". A contract has been created.`, relatedEntityType: 'contract', relatedEntityId: contract._id, actionUrl: `/contracts/${contract._id}` });

    res.json({ success: true, data: { project, contract } });
  } catch (err) { next(err); }
};

exports.getProjectMatches = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.employer.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' });
    const matches = await findMatchesForProject(project, 10);
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
};

exports.getRecommendedProjects = async (req, res, next) => {
  try {
    const FreelancerProfile = require('../models/FreelancerProfile');
    const { findMatchingProjectsForFreelancer } = require('../services/matching');
    const profile = await FreelancerProfile.findOne({ user: req.user._id });
    if (!profile) return res.json({ success: true, data: [] });
    const projects = await Project.find({ status: 'active', visibility: 'public' }).limit(50);
    const matches = await findMatchingProjectsForFreelancer(profile, projects);
    res.json({ success: true, data: matches.map(m => ({ ...m.project.toObject(), matchScore: m.score })) });
  } catch (err) { next(err); }
};
