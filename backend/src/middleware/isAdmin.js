const jwt = require('jsonwebtoken');

const isAdmin = async (req, res, next) => {
    try {
        // Check if user role is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Access denied. Admin privileges required.'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = isAdmin;
