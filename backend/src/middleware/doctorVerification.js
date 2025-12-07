const pool = require('../config/database');

const doctorVerification = async (req, res, next) => {
    try {
        // Only check for doctor role
        if (req.user.role !== 'doctor') {
            return next();
        }

        const result = await pool.query(
            'SELECT is_verified FROM doctors WHERE user_id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0 || !result.rows[0].is_verified) {
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
