import React, { useState } from 'react';
import { Star, ThumbsUp, Flag } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';

const RatingStars = ({ rating, onChange, readonly = false }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                    <Star
                        className={`w-6 h-6 ${star <= (hover || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

const RatingBar = ({ star, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{star} star</span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">{count}</span>
        </div>
    );
};

const RatingsReviews = ({ entityType, entityId, entityName }) => {
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratings, setRatings] = useState([]);
    const [aggregate, setAggregate] = useState(null);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const toast = useToast();

    React.useEffect(() => {
        fetchRatings();
    }, [entityType, entityId]);

    const fetchRatings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ratings/${entityType}/${entityId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = await response.json();
            setRatings(data.ratings || []);
            setAggregate(data.aggregate);
        } catch (error) {
            console.error('Failed to fetch ratings:', error);
        }
    };

    const submitRating = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ratings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ratingType: entityType,
                    entityId,
                    rating: userRating,
                    reviewText: userReview
                })
            });

            if (response.ok) {
                toast?.success('Rating submitted successfully');
                setShowRatingModal(false);
                setUserRating(0);
                setUserReview('');
                fetchRatings();
            } else {
                toast?.error('Failed to submit rating');
            }
        } catch (error) {
            toast?.error('An error occurred');
        }
    };

    const markHelpful = async (ratingId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ratings/${ratingId}/helpful`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast?.success('Marked as helpful');
            fetchRatings();
        } catch (error) {
            toast?.error('Failed to mark as helpful');
        }
    };

    const reportReview = async (ratingId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ratings/${ratingId}/report`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: 'Inappropriate content' })
            });
            toast?.success('Review reported');
        } catch (error) {
            toast?.error('Failed to report review');
        }
    };

    return (
        <div className="space-y-6">
            {/* Rating Summary */}
            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Average Rating */}
                    <div className="text-center md:border-r md:border-gray-200 dark:md:border-gray-700 md:pr-6">
                        <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {aggregate?.average_rating || '0.0'}
                        </div>
                        <RatingStars rating={Math.round(aggregate?.average_rating || 0)} readonly />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {aggregate?.total_ratings || 0} reviews
                        </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <RatingBar
                                key={star}
                                star={star}
                                count={aggregate?.[`rating_${star}_count`] || 0}
                                total={aggregate?.total_ratings || 0}
                            />
                        ))}
                    </div>

                    {/* Write Review Button */}
                    <div className="flex items-center">
                        <Button onClick={() => setShowRatingModal(true)} className="w-full md:w-auto">
                            <Star className="w-4 h-4 mr-2" />
                            Write a Review
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Customer Reviews
                </h3>

                {ratings.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            No reviews yet. Be the first to review!
                        </p>
                    </Card>
                ) : (
                    ratings.map((review) => (
                        <Card key={review.id} className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-semibold text-primary">
                                            {review.first_name?.charAt(0)}{review.last_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {review.first_name} {review.last_name}
                                            </p>
                                            <RatingStars rating={review.rating} readonly />
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {review.review_text && (
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    {review.review_text}
                                </p>
                            )}

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => markHelpful(review.id)}
                                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                    Helpful ({review.helpful_count || 0})
                                </button>
                                <button
                                    onClick={() => reportReview(review.id)}
                                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <Flag className="w-4 h-4" />
                                    Report
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Write Review Modal */}
            <Modal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                title={`Rate ${entityName}`}
                size="md"
            >
                <form onSubmit={submitRating} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Rating
                        </label>
                        <div className="flex justify-center py-4">
                            <RatingStars rating={userRating} onChange={setUserRating} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Review (Optional)
                        </label>
                        <textarea
                            value={userReview}
                            onChange={(e) => setUserReview(e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            onClick={() => setShowRatingModal(false)}
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={userRating === 0}>
                            Submit Review
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RatingsReviews;
export { RatingStars };
