const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All notification routes are protected
router.use(auth);

router.get('/', getNotifications);

// Mark all as read must be before /:id/read to avoid matching 'read-all' as an id
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
