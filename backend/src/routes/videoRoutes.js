// WebRTC Signaling Server for Video Consultations
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Store active calls in memory (use Redis in production)
const activeCalls = new Map();

// Create or join a consultation room
router.post('/consultation/:appointmentId/join', authMiddleware, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id;
        const { offer, answer, candidate } = req.body;

        let callData = activeCalls.get(appointmentId) || {
            participants: [],
            offers: {},
            answers: {},
            candidates: []
        };

        // Add participant
        if (!callData.participants.includes(userId)) {
            callData.participants.push(userId);
        }

        // Store signaling data
        if (offer) {
            callData.offers[userId] = offer;
        }
        if (answer) {
            callData.answers[userId] = answer;
        }
        if (candidate) {
            callData.candidates.push({ userId, candidate });
        }

        activeCalls.set(appointmentId, callData);

        // Emit via Socket.io (if connected)
        const io = req.app.get('io');
        if (io) {
            io.to(`consultation-${appointmentId}`).emit('participant-joined', {
                userId,
                participants: callData.participants
            });

            if (offer) {
                io.to(`consultation-${appointmentId}`).emit('offer', { userId, offer });
            }
            if (answer) {
                io.to(`consultation-${appointmentId}`).emit('answer', { userId, answer });
            }
            if (candidate) {
                io.to(`consultation-${appointmentId}`).emit('candidate', { userId, candidate });
            }
        }

        res.json({
            success: true,
            callData: {
                participants: callData.participants,
                offers: callData.offers,
                answers: callData.answers,
                candidates: callData.candidates.filter(c => c.userId !== userId)
            }
        });
    } catch (error) {
        console.error('Join consultation error:', error);
        res.status(500).json({ error: 'Failed to join consultation' });
    }
});

// Leave consultation
router.post('/consultation/:appointmentId/leave', authMiddleware, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id;

        const callData = activeCalls.get(appointmentId);
        if (callData) {
            callData.participants = callData.participants.filter(p => p !== userId);

            const io = req.app.get('io');
            if (io) {
                io.to(`consultation-${appointmentId}`).emit('participant-left', { userId });
            }

            if (callData.participants.length === 0) {
                activeCalls.delete(appointmentId);
            } else {
                activeCalls.set(appointmentId, callData);
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Leave consultation error:', error);
        res.status(500).json({ error: 'Failed to leave consultation' });
    }
});

// Get consultation status
router.get('/consultation/:appointmentId/status', authMiddleware, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const callData = activeCalls.get(appointmentId);

        res.json({
            active: !!callData,
            participants: callData?.participants || [],
            participantCount: callData?.participants.length || 0
        });
    } catch (error) {
        console.error('Consultation status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

module.exports = router;
