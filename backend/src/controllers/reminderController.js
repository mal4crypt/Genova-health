const prisma = require('../config/prisma');

// Create medication reminder
exports.createReminder = async (req, res) => {
    const { prescriptionId, medicationName, dosage, times, startDate, endDate } = req.body;
    const userId = req.user.id;

    try {
        // Store in a simple reminders table or extend prescriptions
        // For now, we'll use in-memory and Socket.io
        const reminder = {
            id: Date.now(),
            userId,
            prescriptionId,
            medicationName,
            dosage,
            times, // Array of times like ["08:00", "14:00", "20:00"]
            startDate,
            endDate,
            active: true
        };

        // In production, store in database
        // await prisma.medicationReminder.create({ data: reminder });

        res.status(201).json({
            success: true,
            reminder,
            message: 'Reminder created successfully'
        });
    } catch (error) {
        console.error('Create reminder error:', error);
        res.status(500).json({ error: 'Failed to create reminder' });
    }
};

// Get user reminders
exports.getReminders = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch from database in production
        // const reminders = await prisma.medicationReminder.findMany({
        //     where: { userId, active: true }
        // });

        res.json({
            reminders: [] // Return empty for now until DB schema is extended
        });
    } catch (error) {
        console.error('Get reminders error:', error);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
};

// Mark reminder as taken
exports.markTaken = async (req, res) => {
    const { reminderId } = req.params;
    const userId = req.user.id;

    try {
        // Log that medication was taken
        // await prisma.medicationLog.create({
        //     data: {
        //         userId,
        //         reminderId,
        //         takenAt: new Date()
        //     }
        // });

        res.json({
            success: true,
            message: 'Marked as taken'
        });
    } catch (error) {
        console.error('Mark taken error:', error);
        res.status(500).json({ error: 'Failed to mark as taken' });
    }
};

// Snooze reminder
exports.snoozeReminder = async (req, res) => {
    const { reminderId } = req.params;
    const { snoozeMinutes = 15 } = req.body;

    try {
        res.json({
            success: true,
            snoozedUntil: new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString()
        });
    } catch (error) {
        console.error('Snooze reminder error:', error);
        res.status(500).json({ error: 'Failed to snooze reminder' });
    }
};

// Check for due reminders (called periodically)
exports.checkDueReminders = async (req, res) => {
    try {
        // This would typically run as a cron job
        // For demo, return mock reminder
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        res.json({
            dueReminders: [],
            currentTime
        });
    } catch (error) {
        console.error('Check reminders error:', error);
        res.status(500).json({ error: 'Failed to check reminders' });
    }
};
