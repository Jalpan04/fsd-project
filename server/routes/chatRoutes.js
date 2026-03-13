const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getConversations, getMessages, sendMessage, markAsRead, getUnreadCount } = require('../controllers/chatController');
const upload = require('../middleware/uploadMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/unread-count', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);
router.post('/', protect, upload.single('image'), sendMessage);
router.put('/:userId/read', protect, markAsRead);

module.exports = router;
