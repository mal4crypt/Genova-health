const pool = require('../config/database');

// Submit a rating
exports.submitRating = async (req, res) => {
    try {
        const { ratingType, entityId, rating, reviewText } = req.body;
        const userId = req.user.id;

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if user already rated this entity
        const existing = await pool.query(
            'SELECT id FROM ratings WHERE rating_type = $1 AND rated_entity_id = $2 AND rater_user_id = $3',
            [ratingType, entityId, userId]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing rating
            result = await pool.query(
                `UPDATE ratings SET rating = $1, review_text = $2, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $3 RETURNING *`,
                [rating, reviewText, existing.rows[0].id]
            );
        } else {
            // Insert new rating
            result = await pool.query(
                `INSERT INTO ratings (rating_type, rated_entity_id, rater_user_id, rating, review_text)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [ratingType, entityId, userId, rating, reviewText]
            );
        }

        res.json({
            success: true,
            rating: result.rows[0]
        });
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
};

// Get ratings for an entity
exports.getRatings = async (req, res) => {
    try {
        const { ratingType, entityId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get aggregate
        const aggregate = await pool.query(
            'SELECT * FROM rating_aggregates WHERE rating_type = $1 AND entity_id = $2',
            [ratingType, entityId]
        );

        // Get individual ratings
        const ratings = await pool.query(
            `SELECT r.*, u.first_name, u.last_name 
             FROM ratings r
             JOIN users u ON r.rater_user_id = u.id
             WHERE r.rating_type = $1 AND r.rated_entity_id = $2 AND r.flagged = false
             ORDER BY r.created_at DESC
             LIMIT $3 OFFSET $4`,
            [ratingType, entityId, limit, offset]
        );

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM ratings WHERE rating_type = $1 AND rated_entity_id = $2 AND flagged = false',
            [ratingType, entityId]
        );

        res.json({
            aggregate: aggregate.rows[0] || {
                average_rating: 0,
                total_ratings: 0,
                rating_5_count: 0,
                rating_4_count: 0,
                rating_3_count: 0,
                rating_2_count: 0,
                rating_1_count: 0
            },
            ratings: ratings.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });
    } catch (error) {
        console.error('Get ratings error:', error);
        res.status(500).json({ error: 'Failed to get ratings' });
    }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
    try {
        const { ratingId } = req.params;

        await pool.query(
            'UPDATE ratings SET helpful_count = helpful_count + 1 WHERE id = $1',
            [ratingId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark helpful error:', error);
        res.status(500).json({ error: 'Failed to mark as helpful' });
    }
};

// Report a review
exports.reportReview = async (req, res) => {
    try {
        const { ratingId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        await pool.query(
            'INSERT INTO rating_reports (rating_id, reporter_user_id, reason) VALUES ($1, $2, $3)',
            [ratingId, userId, reason]
        );

        res.json({ success: true, message: 'Review reported successfully' });
    } catch (error) {
        console.error('Report review error:', error);
        res.status(500).json({ error: 'Failed to report review' });
    }
};

// Get user's own ratings
exports.getUserRatings = async (req, res) => {
    try {
        const userId = req.user.id;

        const ratings = await pool.query(
            `SELECT r.*, 
                    CASE 
                        WHEN r.rating_type = 'doctor' THEN d.first_name || ' ' || d.last_name
                        WHEN r.rating_type = 'driver' THEN dr.first_name || ' ' || dr.last_name
                        WHEN r.rating_type = 'pharmacy' THEN p.name
                    END as entity_name
             FROM ratings r
             LEFT JOIN doctors d ON r.rating_type = 'doctor' AND r.rated_entity_id = d.id
             LEFT JOIN drivers dr ON r.rating_type = 'driver' AND r.rated_entity_id = dr.id
             LEFT JOIN pharmacies p ON r.rating_type = 'pharmacy' AND r.rated_entity_id = p.id
             WHERE r.rater_user_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );

        res.json({ ratings: ratings.rows });
    } catch (error) {
        console.error('Get user ratings error:', error);
        res.status(500).json({ error: 'Failed to get user ratings' });
    }
};

module.exports = {
    submitRating,
    getRatings,
    markHelpful,
    reportReview,
    getUserRatings
};
