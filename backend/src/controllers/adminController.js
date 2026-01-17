const prisma = require('../config/prisma');

// Get all users by role
exports.getAllUsers = async (req, res) => {
    try {
        const { role } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const validRoles = ['patient', 'doctor', 'nurse', 'driver'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const users = await prisma.user.findMany({
            where: { role },
            include: {
                patient: role === 'patient',
                doctor: role === 'doctor',
                nurse: role === 'nurse',
                driver: role === 'driver'
            },
            orderBy: { created_at: 'desc' },
            skip,
            take
        });

        const total = await prisma.user.count({
            where: { role }
        });

        // Flatten the structure to match previous API response
        const flattenedUsers = users.map(user => {
            const profile = user[role];
            return {
                user_id: user.id,
                email: user.email,
                created_at: user.created_at,
                ...profile
            };
        });

        res.json({
            users: flattenedUsers,
            pagination: {
                page: parseInt(page),
                limit: take,
                total,
                pages: Math.ceil(total / take)
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
        const id = parseInt(userId);

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: true,
                nurse: true,
                driver: true,
                admin: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let details = {};
        if (user.role === 'patient') details = user.patient;
        else if (user.role === 'doctor') details = user.doctor;
        else if (user.role === 'nurse') details = user.nurse;
        else if (user.role === 'driver') details = user.driver;
        else if (user.role === 'admin') details = user.admin;

        // Remove profile objects from user object to keep response clean
        delete user.patient;
        delete user.doctor;
        delete user.nurse;
        delete user.driver;
        delete user.admin;

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
        const id = parseInt(providerId);

        if (providerType === 'doctor') {
            await prisma.doctor.update({
                where: { id },
                data: { is_verified: verified }
            });
        } else if (providerType === 'nurse') {
            await prisma.nurse.update({
                where: { id },
                data: { is_verified: verified }
            });
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
        const userCounts = await prisma.user.groupBy({
            by: ['role'],
            _count: {
                role: true
            },
            where: {
                role: { in: ['patient', 'doctor', 'nurse', 'driver'] }
            }
        });

        stats.users = {};
        userCounts.forEach(item => {
            stats.users[item.role] = item._count.role;
        });

        // Verified providers
        const verifiedDoctors = await prisma.doctor.count({ where: { is_verified: true } });
        const verifiedNurses = await prisma.nurse.count({ where: { is_verified: true } });

        stats.verified = {
            doctors: verifiedDoctors,
            nurses: verifiedNurses
        };

        // Active chat rooms
        stats.activeChats = await prisma.chatRoom.count({ where: { status: 'active' } });

        // Pending prescriptions
        stats.pendingPrescriptions = await prisma.prescription.count({ where: { status: 'pending' } });

        // Active deliveries
        stats.activeDeliveries = await prisma.deliveryOrder.count({
            where: {
                status: { in: ['assigned', 'picked_up', 'in_transit'] }
            }
        });

        // Online drivers
        stats.onlineDrivers = await prisma.driver.count({ where: { is_online: true } });

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
        const take = Math.floor(parseInt(limit) / 3);

        // Get recent prescriptions
        const recentPrescriptions = await prisma.prescription.findMany({
            take,
            orderBy: { created_at: 'desc' },
            include: {
                doctor: { select: { full_name: true } },
                patient: { select: { full_name: true } }
            }
        });

        // Format prescriptions
        const formattedPrescriptions = recentPrescriptions.map(p => ({
            id: p.id,
            medication: p.medication,
            status: p.status,
            created_at: p.created_at,
            doctor_name: p.doctor.full_name,
            patient_name: p.patient.full_name
        }));

        // Get recent deliveries
        const recentDeliveries = await prisma.deliveryOrder.findMany({
            take,
            orderBy: { created_at: 'desc' },
            include: {
                patient: { select: { full_name: true } },
                driver: { select: { full_name: true } }
            }
        });

        // Format deliveries
        const formattedDeliveries = recentDeliveries.map(d => ({
            id: d.id,
            status: d.status,
            created_at: d.created_at,
            patient_name: d.patient ? d.patient.full_name : 'Unknown',
            driver_name: d.driver ? d.driver.full_name : null
        }));

        // Get recent chat rooms
        const recentChats = await prisma.chatRoom.findMany({
            take,
            orderBy: { last_message_at: 'desc' },
            include: {
                patient: { select: { full_name: true } }
            }
        });

        // Format chats
        const formattedChats = recentChats.map(c => ({
            id: c.id,
            type: c.type,
            status: c.status,
            created_at: c.created_at,
            patient_name: c.patient.full_name
        }));

        res.json({
            prescriptions: formattedPrescriptions,
            deliveries: formattedDeliveries,
            chats: formattedChats
        });
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
