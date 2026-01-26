const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/create', reminderController.createReminder);
router.get('/list', reminderController.getReminders);
router.post('/:reminderId/taken', reminderController.markTaken);
router.post('/:reminderId/snooze', reminderController.snoozeReminder);
router.get('/check-due', reminderController.checkDueReminders);

module.exports = router;
