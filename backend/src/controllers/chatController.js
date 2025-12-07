const pool = require('../config/database');

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
        const existing = await pool.query(
            `SELECT * FROM chat_rooms 
             WHERE patient_id = $1 AND provider_id = $2 AND provider_type = $3 AND status = 'active'`,
            [patientId, providerId, providerType]
        );

        if (existing.rows.length > 0) {
            return res.json({ room: existing.rows[0] });
        }

        // Create new room
        const result = await pool.query(
            `INSERT INTO chat_rooms (type, patient_id, provider_id, provider_type, status)
             VALUES ($1, $2, $3, $4, 'active')
             RETURNING *`,
            [type, patientId, providerId, providerType]
        );

        res.status(201).json({ room: result.rows[0] });
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

        let query;
        let params;

        if (userRole === 'patient') {
            // Get patient's ID
            const patientResult = await pool.query(
                'SELECT id FROM patients WHERE user_id = $1',
                [userId]
            );
            const patientId = patientResult.rows[0]?.id;

            query = `
                SELECT cr.*, p.full_name as patient_name,
                       CASE 
                           WHEN cr.provider_type = 'doctor' THEN d.full_name
                           WHEN cr.provider_type = 'nurse' THEN n.full_name
                       END as provider_name,
                       (SELECT COUNT(*) FROM chat_messages 
                        WHERE room_id = cr.id AND is_read = false AND sender_type != 'patient') as unread_count
                FROM chat_rooms cr
                LEFT JOIN patients p ON cr.patient_id = p.id
                LEFT JOIN doctors d ON cr.provider_id = d.id AND cr.provider_type = 'doctor'
                LEFT JOIN nurses n ON cr.provider_id = n.id AND cr.provider_type = 'nurse'
                WHERE cr.patient_id = $1
                ORDER BY cr.last_message_at DESC
            `;
            params = [patientId];
        } else if (userRole === 'doctor') {
            // Get doctor's ID
            const doctorResult = await pool.query(
                'SELECT id FROM doctors WHERE user_id = $1',
                [userId]
            );
            const doctorId = doctorResult.rows[0]?.id;

            query = `
                SELECT cr.*, p.full_name as patient_name, d.full_name as provider_name,
                       (SELECT COUNT(*) FROM chat_messages 
                        WHERE room_id = cr.id AND is_read = false AND sender_type = 'patient') as unread_count
                FROM chat_rooms cr
                JOIN patients p ON cr.patient_id = p.id
                JOIN doctors d ON cr.provider_id = d.id
                WHERE cr.provider_id = $1 AND cr.provider_type = 'doctor'
                ORDER BY cr.last_message_at DESC
            `;
            params = [doctorId];
        } else if (userRole === 'nurse') {
            // Get nurse's ID
            const nurseResult = await pool.query(
                'SELECT id FROM nurses WHERE user_id = $1',
                [userId]
            );
            const nurseId = nurseResult.rows[0]?.id;

            query = `
                SELECT cr.*, p.full_name as patient_name, n.full_name as provider_name,
                       (SELECT COUNT(*) FROM chat_messages 
                        WHERE room_id = cr.id AND is_read = false AND sender_type = 'patient') as unread_count
                FROM chat_rooms cr
                JOIN patients p ON cr.patient_id = p.id
                JOIN nurses n ON cr.provider_id = n.id
                WHERE cr.provider_id = $1 AND cr.provider_type = 'nurse'
                ORDER BY cr.last_message_at DESC
            `;
            params = [nurseId];
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(query, params);
        res.json({ rooms: result.rows });
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

        // Verify user has access to this room
        const room = await pool.query(
            'SELECT * FROM chat_rooms WHERE id = $1',
            [roomId]
        );

        if (room.rows.length === 0) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        // Get messages
        const messages = await pool.query(
            `SELECT cm.*, u.email as sender_email
             FROM chat_messages cm
             JOIN users u ON cm.sender_id = u.id
             WHERE cm.room_id = $1
             ORDER BY cm.created_at ASC
             LIMIT $2 OFFSET $3`,
            [roomId, limit, offset]
        );

        res.json({ messages: messages.rows });
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

        await pool.query(
            `UPDATE chat_messages 
             SET is_read = true 
             WHERE room_id = $1 AND sender_id != $2`,
            [roomId, userId]
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save a message (used by Socket.io)
exports.saveMessage = async (roomId, senderId, senderType, message) => {
    try {
        const result = await pool.query(
            `INSERT INTO chat_messages (room_id, sender_id, sender_type, message)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [roomId, senderId, senderType, message]
        );

        // Update room's last_message_at
        await pool.query(
            'UPDATE chat_rooms SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
            [roomId]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Save message error:', error);
        throw error;
    }
};
