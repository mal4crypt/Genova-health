const prisma = require('../config/prisma');

// Create a new chat room
exports.createChatRoom = async (req, res) => {
    try {
        const { type, patientId, providerId, providerType } = req.body;

        // Validate input
        if (!['doctor-patient', 'nurse-patient'].includes(type)) {
            return res.status(400).json({ message: 'Invalid chat room type' });
        }

        if (!['doctor', 'nurse'].includes(providerType)) {
            return res.status(400).json({ message: 'Invalid provider type' });
        }

        // Check if room already exists
        const existing = await prisma.chatRoom.findFirst({
            where: {
                patient_id: parseInt(patientId),
                provider_id: parseInt(providerId),
                provider_type: providerType,
                status: 'active'
            }
        });

        if (existing) {
            return res.json({ room: existing });
        }

        // Create new room
        const room = await prisma.chatRoom.create({
            data: {
                type,
                patient_id: parseInt(patientId),
                provider_id: parseInt(providerId),
                provider_type: providerType,
                status: 'active'
            }
        });

        res.status(201).json({ room });
    } catch (error) {
        console.error('Create chat room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get chat rooms for a user
exports.getChatRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let whereClause = {};

        if (userRole === 'patient') {
            const patient = await prisma.patient.findUnique({ where: { user_id: userId } });
            if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
            whereClause = { patient_id: patient.id };
        } else if (userRole === 'doctor') {
            const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });
            if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
            whereClause = { provider_id: doctor.id, provider_type: 'doctor' };
        } else if (userRole === 'nurse') {
            const nurse = await prisma.nurse.findUnique({ where: { user_id: userId } });
            if (!nurse) return res.status(404).json({ message: 'Nurse profile not found' });
            whereClause = { provider_id: nurse.id, provider_type: 'nurse' };
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const rooms = await prisma.chatRoom.findMany({
            where: whereClause,
            orderBy: { last_message_at: 'desc' },
            include: {
                patient: { select: { full_name: true } },
                messages: {
                    where: {
                        is_read: false,
                        sender_type: userRole === 'patient' ? { not: 'patient' } : 'patient'
                    }
                }
            }
        });

        // Enhance rooms with provider names and unread counts
        const enhancedRooms = await Promise.all(rooms.map(async (room) => {
            let providerName = '';
            if (room.provider_type === 'doctor') {
                const doc = await prisma.doctor.findUnique({ where: { id: room.provider_id } });
                providerName = doc ? doc.full_name : 'Unknown Doctor';
            } else if (room.provider_type === 'nurse') {
                const nurse = await prisma.nurse.findUnique({ where: { id: room.provider_id } });
                providerName = nurse ? nurse.full_name : 'Unknown Nurse';
            }

            return {
                ...room,
                patient_name: room.patient.full_name,
                provider_name: providerName,
                unread_count: room.messages.length
            };
        }));

        res.json({ rooms: enhancedRooms });
    } catch (error) {
        console.error('Get chat rooms error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get chat history for a room
exports.getChatHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        const id = parseInt(roomId);

        // Verify user has access to this room (simplified check)
        const room = await prisma.chatRoom.findUnique({ where: { id } });

        if (!room) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Get messages
        const messages = await prisma.chatMessage.findMany({
            where: { room_id: id },
            orderBy: { created_at: 'asc' },
            take: parseInt(limit),
            skip: parseInt(offset),
            include: {
                sender: { select: { email: true } }
            }
        });

        const formattedMessages = messages.map(msg => ({
            ...msg,
            sender_email: msg.sender.email
        }));

        res.json({ messages: formattedMessages });
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;
        const id = parseInt(roomId);

        await prisma.chatMessage.updateMany({
            where: {
                room_id: id,
                sender_id: { not: userId }
            },
            data: { is_read: true }
        });

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save a message (used by Socket.io)
exports.saveMessage = async (roomId, senderId, senderType, message) => {
    try {
        const savedMessage = await prisma.chatMessage.create({
            data: {
                room_id: parseInt(roomId),
                sender_id: parseInt(senderId),
                sender_type: senderType,
                message
            }
        });

        // Update room's last_message_at
        await prisma.chatRoom.update({
            where: { id: parseInt(roomId) },
            data: { last_message_at: new Date() }
        });

        return savedMessage;
    } catch (error) {
        console.error('Save message error:', error);
        throw error;
    }
};
