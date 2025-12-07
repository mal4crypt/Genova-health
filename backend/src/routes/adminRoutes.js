const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(isAdmin);

// User management
router.get('/users/:role', adminController.getAllUsers);
router.get('/user/:userId', adminController.getUserDetails);

// Provider verification
router.put('/verify/:providerType/:providerId', adminController.verifyProvider);

// System statistics
router.get('/stats', adminController.getSystemStats);

// Activity logs
router.get('/activity', adminController.getRecentActivity);

module.exports = router;
