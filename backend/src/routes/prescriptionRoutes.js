const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Prescription management
router.post('/', prescriptionController.createPrescription);
router.get('/', prescriptionController.getPrescriptions);
router.get('/:prescriptionId', prescriptionController.getPrescriptionById);
router.put('/:prescriptionId/status', prescriptionController.updatePrescriptionStatus);

// Pharmacies
router.get('/pharmacies/list', prescriptionController.getPharmacies);

module.exports = router;
