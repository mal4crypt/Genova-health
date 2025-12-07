const pool = require('../config/database');

// Get all users by role
exports.getAllUsers = async (req, res) => {
    try {
        const { role } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const validRoles = ['patient', 'doctor', 'nurse', 'driver'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        let query, countQuery;

        if (role === 'patient') {
            query = `
                SELECT u.id as user_id, u.email, u.created_at, p.* 
                FROM users u 
                JOIN patients p ON u.id = p.user_id 
                WHERE u.role = 'patient'
                ORDER BY u.created_at DESC
                LIMIT $1 OFFSET $2
            `;
            countQuery = `SELECT COUNT(*) FROM users WHERE role = 'patient'`;
        } else if (role === 'doctor') {
            query = `
                SELECT u.id as user_id, u.email, u.created_at, d.* 
                FROM users u 
                JOIN doctors d ON u.id = d.user_id 
                WHERE u.role = 'doctor'
                ORDER BY u.created_at DESC
                LIMIT $1 OFFSET $2
            `;
            countQuery = `SELECT COUNT(*) FROM users WHERE role = 'doctor'`;
        } else if (role === 'nurse') {
            query = `
                SELECT u.id as user_id, u.email, u.created_at, n.* 
                FROM users u 
                JOIN nurses n ON u.id = n.user_id 
                WHERE u.role = 'nurse'
                ORDER BY u.created_at DESC
                LIMIT $1 OFFSET $2
            `;
            countQuery = `SELECT COUNT(*) FROM users WHERE role = 'nurse'`;
        } else if (role === 'driver') {
            query = `
                SELECT u.id as user_id, u.email, u.created_at, d.* 
                FROM users u 
                JOIN drivers d ON u.id = d.user_id 
                WHERE u.role = 'driver'
                ORDER BY u.created_at DESC
                LIMIT $1 OFFSET $2
            `;
            countQuery = `SELECT COUNT(*) FROM users WHERE role = 'driver'`;
        }

        const result = await pool.query(query, [limit, offset]);
        const countResult = await pool.query(countQuery);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            users: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user details
exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const userResult = await pool.query(
            'SELECT id, email, role, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        let details = {};

        // Get role-specific details
        if (user.role === 'patient') {
            const patientResult = await pool.query(
                'SELECT * FROM patients WHERE user_id = $1',
                [userId]
            );
            details = patientResult.rows[0];
        } else if (user.role === 'doctor') {
            const doctorResult = await pool.query(
                'SELECT * FROM doctors WHERE user_id = $1',
                [userId]
            );
            details = doctorResult.rows[0];
        } else if (user.role === 'nurse') {
            const nurseResult = await pool.query(
                'SELECT * FROM nurses WHERE user_id = $1',
                [userId]
            );
            details = nurseResult.rows[0];
        } else if (user.role === 'driver') {
            const driverResult = await pool.query(
                'SELECT * FROM drivers WHERE user_id = $1',
                [userId]
            );
            details = driverResult.rows[0];
        }

        res.json({
            user,
            details
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify healthcare provider
exports.verifyProvider = async (req, res) => {
    try {
        const { providerId, providerType } = req.params;
        const { verified } = req.body;

        if (providerType === 'doctor') {
            await pool.query(
                'UPDATE doctors SET is_verified = $1 WHERE id = $2',
                [verified, providerId]
            );
        } else if (providerType === 'nurse') {
            await pool.query(
                'UPDATE nurses SET is_verified = $1 WHERE id = $2',
                [verified, providerId]
            );
        } else {
            return res.status(400).json({ message: 'Invalid provider type' });
        }

        res.json({
            message: `Provider ${verified ? 'verified' : 'unverified'} successfully`
        });
    } catch (error) {
        console.error('Verify provider error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get system statistics
exports.getSystemStats = async (req, res) => {
    try {
        const stats = {};

        // Count users by role
        const userCounts = await pool.query(`
            SELECT role, COUNT(*) as count 
            FROM users 
            WHERE role IN ('patient', 'doctor', 'nurse', 'driver')
            GROUP BY role
        `);

        stats.users = {};
        userCounts.rows.forEach(row => {
            stats.users[row.role] = parseInt(row.count);
        });

        // Verified providers
        const verifiedDoctors = await pool.query(
            'SELECT COUNT(*) FROM doctors WHERE is_verified = true'
        );
        const verifiedNurses = await pool.query(
            'SELECT COUNT(*) FROM nurses WHERE is_verified = true'
        );

        stats.verified = {
            doctors: parseInt(verifiedDoctors.rows[0].count),
            nurses: parseInt(verifiedNurses.rows[0].count)
        };

        // Active chat rooms
        const activeChats = await pool.query(
            "SELECT COUNT(*) FROM chat_rooms WHERE status = 'active'"
        );
        stats.activeChats = parseInt(activeChats.rows[0].count);

        // Pending prescriptions
        const pendingPrescriptions = await pool.query(
            "SELECT COUNT(*) FROM prescriptions WHERE status = 'pending'"
        );
        stats.pendingPrescriptions = parseInt(pendingPrescriptions.rows[0].count);

        // Active deliveries
        const activeDeliveries = await pool.query(
            "SELECT COUNT(*) FROM delivery_orders WHERE status IN ('assigned', 'picked_up', 'in_transit')"
        );
        stats.activeDeliveries = parseInt(activeDeliveries.rows[0].count);

        // Online drivers
        const onlineDrivers = await pool.query(
            'SELECT COUNT(*) FROM drivers WHERE is_online = true'
        );
        stats.onlineDrivers = parseInt(onlineDrivers.rows[0].count);

        res.json(stats);
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        // Get recent prescriptions
        const recentPrescriptions = await pool.query(
            `SELECT p.id, p.medication, p.status, p.created_at,
                    d.full_name as doctor_name,
                    pt.full_name as patient_name
             FROM prescriptions p
             JOIN doctors d ON p.doctor_id = d.id
             JOIN patients pt ON p.patient_id = pt.id
             ORDER BY p.created_at DESC
             LIMIT $1`,
            [Math.floor(limit / 3)]
        );

        // Get recent deliveries
        const recentDeliveries = await pool.query(
            `SELECT do.id, do.status, do.created_at,
                    p.full_name as patient_name,
                    d.full_name as driver_name
             FROM delivery_orders do
             JOIN patients p ON do.patient_id = p.id
             LEFT JOIN drivers d ON do.driver_id = d.id
             ORDER BY do.created_at DESC
             LIMIT $1`,
            [Math.floor(limit / 3)]
        );

        // Get recent chat rooms
        const recentChats = await pool.query(
            `SELECT cr.id, cr.type, cr.status, cr.created_at,
                    p.full_name as patient_name
             FROM chat_rooms cr
             JOIN patients p ON cr.patient_id = p.id
             ORDER BY cr.last_message_at DESC
             LIMIT $1`,
            [Math.floor(limit / 3)]
        );

        res.json({
            prescriptions: recentPrescriptions.rows,
            deliveries: recentDeliveries.rows,
            chats: recentChats.rows
        });
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
