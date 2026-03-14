const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead, deleteNotification } = require('../controllers/notifications');
const { protect } = require('../middleware/auth');
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllRead);
router.delete('/:id', protect, deleteNotification);
module.exports = router;