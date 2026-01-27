const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/profile-picture', ...uploadController.uploadProfilePicture);
router.post('/medical-document', ...uploadController.uploadMedicalDocument);
router.post('/lab-result', ...uploadController.uploadLabResult);

module.exports = router;
