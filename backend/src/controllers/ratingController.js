const prisma = require('../config/prisma');

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
        const existing = await prisma.rating.findUnique({
            where: {
                rating_type_rated_entity_id_rater_user_id: {
                    rating_type: ratingType,
                    rated_entity_id: parseInt(entityId),
                    rater_user_id: userId
                }
            }
        });

        let result;
        if (existing) {
            // Update existing rating
            result = await prisma.rating.update({
                where: { id: existing.id },
                data: {
                    rating,
                    review_text: reviewText
                }
            });
        } else {
            // Insert new rating
            result = await prisma.rating.create({
                data: {
                    rating_type: ratingType,
                    rated_entity_id: parseInt(entityId),
                    rater_user_id: userId,
                    rating,
                    review_text: reviewText
                }
            });
        }

        res.json({
            success: true,
            rating: result
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
        const skip = (page - 1) * limit;
        const eId = parseInt(entityId);

        // Get aggregate
        const aggregate = await prisma.ratingAggregate.findUnique({
            where: {
                rating_type_entity_id: {
                    rating_type: ratingType,
                    entity_id: eId
                }
            }
        });

        // Get individual ratings
        const ratings = await prisma.rating.findMany({
            where: {
                rating_type: ratingType,
                rated_entity_id: eId,
                flagged: false
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: skip,
            include: {
                rater: {
                    select: {
                        // Assuming User model doesn't have first_name/last_name directly but through profiles
                        // However, the original SQL joined users and selected first_name, last_name which implies users table had them
                        // But looking at schema, User table only has email. Profiles have full_name.
                        // I will try to fetch email for now, or join with profiles if possible.
                        // The schema shows User has relations to Patient, Doctor, etc.
                        // Let's just return email or try to get full_name from related profile if possible.
                        // Since rater can be any user role, it's hard to know which profile to join without dynamic logic.
                        // For now, I'll return email and maybe id.
                        email: true
                    }
                }
            }
        });

        // Get total count
        const total = await prisma.rating.count({
            where: {
                rating_type: ratingType,
                rated_entity_id: eId,
                flagged: false
            }
        });

        res.json({
            aggregate: aggregate || {
                average_rating: 0,
                total_ratings: 0,
                rating_5_count: 0,
                rating_4_count: 0,
                rating_3_count: 0,
                rating_2_count: 0,
                rating_1_count: 0
            },
            ratings: ratings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
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
        const id = parseInt(ratingId);

        await prisma.rating.update({
            where: { id },
            data: {
                helpful_count: { increment: 1 }
            }
        });

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
        const id = parseInt(ratingId);

        await prisma.ratingReport.create({
            data: {
                rating_id: id,
                reporter_user_id: userId,
                reason
            }
        });

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

        const ratings = await prisma.rating.findMany({
            where: { rater_user_id: userId },
            orderBy: { created_at: 'desc' }
        });

        // Enhance with entity names
        const enhancedRatings = await Promise.all(ratings.map(async (r) => {
            let entityName = 'Unknown';
            if (r.rating_type === 'doctor') {
                const doc = await prisma.doctor.findUnique({ where: { id: r.rated_entity_id } });
                if (doc) entityName = doc.full_name;
            } else if (r.rating_type === 'driver') {
                const driver = await prisma.driver.findUnique({ where: { id: r.rated_entity_id } });
                if (driver) entityName = driver.full_name;
            } else if (r.rating_type === 'pharmacy') {
                const pharmacy = await prisma.pharmacy.findUnique({ where: { id: r.rated_entity_id } });
                if (pharmacy) entityName = pharmacy.name;
            }

            return {
                ...r,
                entity_name: entityName
            };
        }));

        res.json({ ratings: enhancedRatings });
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
