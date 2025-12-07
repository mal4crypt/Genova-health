const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Delivery management
router.post('/', deliveryController.createDeliveryOrder);
router.put('/:deliveryId/assign', deliveryController.assignDriver);
router.put('/:deliveryId/status', deliveryController.updateDeliveryStatus);

// Get deliveries
router.get('/driver', deliveryController.getDriverDeliveries);
router.get('/patient', deliveryController.getPatientDeliveries);
router.get('/:deliveryId/track', deliveryController.trackDelivery);

// Admin functions
router.get('/drivers/available', deliveryController.getAvailableDrivers);

module.exports = router;
