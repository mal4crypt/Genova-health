const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Chat room management
router.post('/rooms', chatController.createChatRoom);
router.get('/rooms', chatController.getChatRooms);
router.get('/rooms/:roomId/messages', chatController.getChatHistory);
router.put('/rooms/:roomId/read', chatController.markAsRead);

module.exports = router;
