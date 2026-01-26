const prisma = require('../config/prisma');

// Log a health metric (steps, sleep, etc.)
exports.logMetric = async (req, res) => {
    const { type, value, unit, recorded_at, source } = req.body;
    const userId = req.user.id;

    try {
        const metric = await prisma.healthMetric.create({
            data: {
                user_id: userId,
                type,
                value,
                unit,
                recorded_at: recorded_at ? new Date(recorded_at) : new Date(),
                source
            }
        });

        // After logging, check if any goals are affected
        await checkGoalProgress(userId, type);

        res.status(201).json(metric);
    } catch (error) {
        console.error('Error logging metric:', error);
        res.status(500).json({ error: 'Failed to log metric' });
    }
};

// Get metrics for a user
exports.getMetrics = async (req, res) => {
    const userId = req.user.id;
    const { type, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    try {
        const metrics = await prisma.healthMetric.findMany({
            where: {
                user_id: userId,
                type,
                recorded_at: {
                    gte: startDate
                }
            },
            orderBy: {
                recorded_at: 'asc'
            }
        });

        res.json(metrics);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
};

// Get fitness goals
exports.getGoals = async (req, res) => {
    const userId = req.user.id;

    try {
        const goals = await prisma.fitnessGoal.findMany({
            where: { user_id: userId },
            orderBy: { start_date: 'desc' }
        });
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
};

// Create a fitness goal
exports.createGoal = async (req, res) => {
    const { title, target_value, unit, end_date, category } = req.body;
    const userId = req.user.id;

    try {
        const goal = await prisma.fitnessGoal.create({
            data: {
                user_id: userId,
                title,
                target_value,
                unit,
                end_date: end_date ? new Date(end_date) : null,
                category
            }
        });
        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
};

// Get achievements
exports.getAchievements = async (req, res) => {
    const userId = req.user.id;

    try {
        const achievements = await prisma.achievement.findMany({
            where: { user_id: userId },
            orderBy: { earned_at: 'desc' }
        });
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
};

// Helper to check and update goal progress
async function checkGoalProgress(userId, metricType) {
    // Basic logic to update goals based on new metrics
    // For simplicity, we sum metrics for the current day/week
    const goals = await prisma.fitnessGoal.findMany({
        where: {
            user_id: userId,
            status: 'active',
            category: metricType === 'steps' ? 'activity' : metricType === 'sleep_minutes' ? 'sleep' : null
        }
    });

    for (const goal of goals) {
        const aggregate = await prisma.healthMetric.aggregate({
            _sum: { value: true },
            where: {
                user_id: userId,
                type: metricType,
                recorded_at: { gte: goal.start_date }
            }
        });

        const currentValue = aggregate._sum.value || 0;

        await prisma.fitnessGoal.update({
            where: { id: goal.id },
            data: {
                current_value: currentValue,
                status: currentValue >= goal.target_value ? 'completed' : 'active'
            }
        });

        // Trigger achievement if completed
        if (currentValue >= goal.target_value) {
            await triggerAchievement(userId, goal.title);
        }
    }
}

async function triggerAchievement(userId, goalTitle) {
    const title = `Winner: ${goalTitle}`;
    // Check if already earned
    const existing = await prisma.achievement.findFirst({
        where: { user_id: userId, title }
    });

    if (!existing) {
        await prisma.achievement.create({
            data: {
                user_id: userId,
                title,
                description: `You reached your goal: ${goalTitle}!`,
                points: 100,
                level: 1
            }
        });
    }
}
