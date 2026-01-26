const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/book', appointmentController.bookAppointment);
router.get('/list', appointmentController.getAppointments);
router.patch('/:id/reschedule', appointmentController.rescheduleAppointment);
router.delete('/:id/cancel', appointmentController.cancelAppointment);
router.get('/available-slots', appointmentController.getAvailableSlots);

module.exports = router;
