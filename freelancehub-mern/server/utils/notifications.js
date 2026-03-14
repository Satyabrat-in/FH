const Notification = require('../models/Notification');

const createNotification = async (io, { userId, type, title, message, relatedEntityType, relatedEntityId, actionUrl }) => {
  const notification = await Notification.create({ user: userId, type, title, message, relatedEntityType, relatedEntityId, actionUrl });
  if (io) {
    io.to(userId.toString()).emit('notification', {
      _id: notification._id, type, title, message, actionUrl, createdAt: notification.createdAt
    });
  }
  return notification;
};

module.exports = { createNotification };
