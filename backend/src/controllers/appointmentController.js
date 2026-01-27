const prisma = require('../config/prisma');
const { sendAppointmentConfirmation } = require('../services/notificationService');

// Book appointment
exports.bookAppointment = async (req, res) => {
    const { doctorId, scheduledAt, reason, durationMins = 30 } = req.body;
    const patientId = req.user.patient?.id;

    if (!patientId) {
        return res.status(403).json({ error: 'Only patients can book appointments' });
    }

    try {
        const appointment = await prisma.appointment.create({
            data: {
                patient_id: patientId,
                doctor_id: doctorId,
                scheduled_at: new Date(scheduledAt),
                duration_mins: durationMins,
                reason,
                status: 'scheduled'
            },
            include: {
                doctor: {
                    select: {
                        full_name: true,
                        specialty: true,
                        hospital: true
                    }
                }
            }
        });

        // Send confirmation email
        if (req.user.email) {
            await sendAppointmentConfirmation(appointment, req.user.email);
        }

        res.status(201).json({
            success: true,
            appointment,
            message: 'Appointment booked successfully. Confirmation email sent.'
        });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
};

// Get user appointments
exports.getAppointments = async (req, res) => {
    const userId = req.user.id;
    const { status, upcoming } = req.query;

    try {
        const where = {};

        // Filter by role
        if (req.user.role === 'patient') {
            where.patient = { user_id: userId };
        } else if (req.user.role === 'doctor') {
            where.doctor = { user_id: userId };
        }

        // Filter by status
        if (status) {
            where.status = status;
        }

        // Filter upcoming only
        if (upcoming === 'true') {
            where.scheduled_at = {
                gte: new Date()
            };
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                patient: {
                    select: {
                        full_name: true,
                        phone: true
                    }
                },
                doctor: {
                    select: {
                        full_name: true,
                        specialty: true,
                        hospital: true
                    }
                }
            },
            orderBy: {
                scheduled_at: 'asc'
            }
        });

        res.json(appointments);
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
    const { id } = req.params;
    const { newScheduledAt } = req.body;

    try {
        const appointment = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: {
                scheduled_at: new Date(newScheduledAt),
                reminder_sent: false,
                updated_at: new Date()
            }
        });

        res.json({
            success: true,
            appointment,
            message: 'Appointment rescheduled'
        });
    } catch (error) {
        console.error('Reschedule error:', error);
        res.status(500).json({ error: 'Failed to reschedule' });
    }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const appointment = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: {
                status: 'cancelled',
                notes: reason || 'Cancelled by user'
            }
        });

        res.json({
            success: true,
            message: 'Appointment cancelled'
        });
    } catch (error) {
        console.error('Cancel error:', error);
        res.status(500).json({ error: 'Failed to cancel' });
    }
};

// Get available slots
exports.getAvailableSlots = async (req, res) => {
    const { doctorId, date } = req.query;

    try {
        // Mock implementation - return available slots
        const slots = [];
        const startHour = 9;
        const endHour = 17;

        for (let hour = startHour; hour < endHour; hour++) {
            slots.push({
                time: `${hour.toString().padStart(2, '0')}:00`,
                available: Math.random() > 0.3 // Mock availability
            });
            slots.push({
                time: `${hour.toString().padStart(2, '0')}:30`,
                available: Math.random() > 0.3
            });
        }

        res.json({ slots, date });
    } catch (error) {
        console.error('Get slots error:', error);
        res.status(500).json({ error: 'Failed to fetch slots' });
    }
};
