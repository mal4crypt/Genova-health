const express = require('express');
const router = express.Router();
const fitnessController = require('../controllers/fitnessController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/metrics', fitnessController.logMetric);
router.get('/metrics', fitnessController.getMetrics);
router.get('/goals', fitnessController.getGoals);
router.post('/goals', fitnessController.createGoal);
router.get('/achievements', fitnessController.getAchievements);

module.exports = router;
