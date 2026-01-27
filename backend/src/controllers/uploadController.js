const { upload, uploadToCloudinary } = require('../services/uploadService');

// Upload profile picture
exports.uploadProfilePicture = [
    upload.single('profilePicture'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const result = await uploadToCloudinary(
                req.file.buffer,
                'genova-health/profiles'
            );

            // Update user profile with image URL
            // In production, update the user's profile in database
            res.json({
                success: true,
                url: result.secure_url,
                publicId: result.public_id
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload image' });
        }
    }
];

// Upload medical document
exports.uploadMedicalDocument = [
    upload.single('document'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const result = await uploadToCloudinary(
                req.file.buffer,
                'genova-health/medical-records'
            );

            res.json({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }
];

// Upload lab result image
exports.uploadLabResult = [
    upload.single('labResult'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const result = await uploadToCloudinary(
                req.file.buffer,
                'genova-health/lab-results'
            );

            res.json({
                success: true,
                url: result.secure_url,
                publicId: result.public_id
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload lab result' });
        }
    }
];
