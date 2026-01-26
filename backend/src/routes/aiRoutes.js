const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/symptoms/check', aiController.checkSymptoms);
router.post('/mental-health/chat', aiController.mentalHealthChat);
router.post('/health/qa', aiController.healthQA);

module.exports = router;
