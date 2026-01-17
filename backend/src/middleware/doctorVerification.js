const prisma = require('../config/prisma');

const doctorVerification = async (req, res, next) => {
    try {
        // Only check for doctor role
        if (req.user.role !== 'doctor') {
            return next();
        }

        const doctor = await prisma.doctor.findUnique({
            where: { user_id: req.user.id },
            select: { is_verified: true }
        });

        if (!doctor || !doctor.is_verified) {
            return res.status(403).json({
                message: 'Account not verified. Please wait for admin verification.'
            });
        }

        next();
    } catch (error) {
        console.error('Doctor verification error:', error);
        res.status(500).json({ message: 'Server error during verification check' });
    }
};

module.exports = doctorVerification;
