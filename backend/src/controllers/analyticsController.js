const prisma = require('../config/prisma');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_KEY || '');

// Calculate health score
exports.getHealthScore = async (req, res) => {
    const userId = req.user.id;

    try {
        // Get recent health metrics
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const metrics = await prisma.healthMetric.findMany({
            where: {
                user_id: userId,
                recorded_at: { gte: sevenDaysAgo }
            }
        });

        const goals = await prisma.fitnessGoal.findMany({
            where: { user_id: userId, status: 'active' }
        });

        // Calculate score (0-100)
        let score = 50; // Base score

        // Bonus for active metrics logging
        if (metrics.length > 0) score += 10;
        
        // Bonus for achieving goals
        const completedGoals = goals.filter(g => g.current_value >= g.target_value);
        score += completedGoals.length * 10;

        // Cap at 100
        score = Math.min(score, 100);

        res.json({
            score,
            metrics: {
                totalMetrics: metrics.length,
                activeGoals: goals.length,
                completedGoals: completedGoals.length
            }
        });
    } catch (error) {
        console.error('Health score error:', error);
        res.status(500).json({ error: 'Failed to calculate score' });
    }
};

// Get health trends
exports.getHealthTrends = async (req, res) => {
    const userId = req.user.id;
    const { metricType = 'steps', days = 30 } = req.query;

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const metrics = await prisma.healthMetric.findMany({
            where: {
                user_id: userId,
                type: metricType,
                recorded_at: { gte: startDate }
            },
            orderBy: { recorded_at: 'asc' }
        });

        // Group by day
        const dailyData = {};
        metrics.forEach(m => {
            const date = m.recorded_at.toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { total: 0, count: 0 };
            }
            dailyData[date].total += parseFloat(m.value);
            dailyData[date].count += 1;
        });

        const trend = Object.keys(dailyData).map(date => ({
            date,
            value: dailyData[date].total / dailyData[date].count
        }));

        res.json({
            metricType,
            days,
            trend
        });
    } catch (error) {
        console.error('Trends error:', error);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
};

// AI-powered predictions
exports.predictHealthRisks = async (req, res) => {
    const userId = req.user.id;

    try {
        // Get user health data
        const metrics = await prisma.healthMetric.findMany({
            where: { user_id: userId },
            take: 100,
            orderBy: { recorded_at: 'desc' }
        });

        if (metrics.length === 0) {
            return res.json({
                predictions: [],
                message: 'Insufficient data for predictions'
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Construct health summary
        const healthSummary = metrics.map(m => 
            `${m.type}: ${m.value} ${m.unit} on ${m.recorded_at.toISOString().split('T')[0]}`
        ).join('\n');

        const prompt = `Based on this health data, identify potential health risks and provide recommendations:

${healthSummary}

Provide response as JSON:
{
  "predictions": ["prediction1", "prediction2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "riskLevel": "low|medium|high"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                res.json(analysis);
            } else {
                res.json({
                    predictions: ['Analysis pending'],
                    recommendations: [text],
                    riskLevel: 'low'
                });
            }
        } catch (parseError) {
            res.json({
                predictions: ['Analysis pending'],
                recommendations: [text],
                riskLevel: 'low'
            });
        }
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Failed to generate predictions' });
    }
};

// Get personalized recommendations
exports.getRecommendations = async (req, res) => {
    const userId = req.user.id;

    try {
        const goals = await prisma.fitnessGoal.findMany({
            where: { user_id: userId, status: 'active' }
        });

        const recommendations = [];

        // Check goal progress
        goals.forEach(goal => {
            const progress = (goal.current_value / goal.target_value) * 100;
            if (progress < 50) {
                recommendations.push({
                    type: 'goal',
                    message: `You're ${Math.round(progress)}% towards "${goal.title}". Keep going!`,
                    priority: 'medium'
                });
            }
        });

        // Default recommendations
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'general',
                message: 'Drink 8 glasses of water today',
                priority: 'low'
            });
            recommendations.push({
                type: 'general',
                message: 'Aim for 7-8 hours of sleep tonight',
                priority: 'medium'
            });
        }

        res.json({ recommendations });
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
};
