const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/confirm', paymentController.confirmPayment);
router.get('/history', paymentController.getPaymentHistory);
router.post('/:paymentId/refund', paymentController.processRefund);
router.get('/config', paymentController.getPublishableKey);

module.exports = router;
