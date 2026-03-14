const Message = require('../models/Message');
const User = require('../models/User');

const getConversationId = (id1, id2) => [id1, id2].sort().join('_');

exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }], deletedBy: { $ne: req.user._id } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' }, unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $eq: ['$receiver', req.user._id] }] }, 1, 0] } } } },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    const conversations = await Promise.all(messages.map(async m => {
      const otherId = m.lastMessage.sender.toString() === userId ? m.lastMessage.receiver : m.lastMessage.sender;
      const otherUser = await User.findById(otherId).select('name avatar role lastActive');
      return { conversationId: m._id, otherUser, lastMessage: m.lastMessage, unreadCount: m.unreadCount };
    }));

    res.json({ success: true, data: conversations });
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const conversationId = getConversationId(req.user._id.toString(), userId);
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ conversationId, deletedBy: { $ne: req.user._id } })
      .populate('sender', 'name avatar').populate('receiver', 'name avatar')
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));

    await Message.updateMany({ conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });

    const otherUser = await User.findById(userId).select('name avatar role lastActive');
    res.json({ success: true, data: { messages: messages.reverse(), otherUser } });
  } catch (err) { next(err); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, attachments, projectId, messageType, offer } = req.body;
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ success: false, message: 'User not found' });

    const conversationId = getConversationId(req.user._id.toString(), receiverId);
    const message = await Message.create({
      conversationId, sender: req.user._id, receiver: receiverId,
      content, attachments: attachments || [], project: projectId,
      messageType: messageType || 'text', offer
    });

    await message.populate([{ path: 'sender', select: 'name avatar' }, { path: 'receiver', select: 'name avatar' }]);

    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('newMessage', message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (![message.sender.toString(), message.receiver.toString()].includes(req.user._id.toString())) return res.status(403).json({ success: false, message: 'Not authorised' });
    if (!message.deletedBy.includes(req.user._id)) {
      message.deletedBy.push(req.user._id);
      await message.save();
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) { next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const conversationId = getConversationId(req.user._id.toString(), req.params.userId);
    await Message.updateMany({ conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, isRead: false, deletedBy: { $ne: req.user._id } });
    res.json({ success: true, count });
  } catch (err) { next(err); }
};
