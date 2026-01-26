const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/health-score', analyticsController.getHealthScore);
router.get('/trends', analyticsController.getHealthTrends);
router.post('/predict', analyticsController.predictHealthRisks);
router.get('/recommendations', analyticsController.getRecommendations);

module.exports = router;
