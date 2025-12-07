-- Ratings and Reviews Schema
-- Database migration for ratings system

CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    rating_type VARCHAR(50) NOT NULL, -- 'doctor', 'driver', 'pharmacy'
    rated_entity_id INTEGER NOT NULL, -- ID of doctor/driver/pharmacy
    rater_user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0,
    flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rating_type, rated_entity_id, rater_user_id) -- One rating per user per entity
);

CREATE INDEX idx_ratings_entity ON ratings(rating_type, rated_entity_id);
CREATE INDEX idx_ratings_user ON ratings(rater_user_id);
CREATE INDEX idx_ratings_created ON ratings(created_at DESC);

-- Rating aggregates table (for performance)
CREATE TABLE IF NOT EXISTS rating_aggregates (
    id SERIAL PRIMARY KEY,
    rating_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    average_rating DECIMAL(3,2),
    total_ratings INTEGER DEFAULT 0,
    rating_5_count INTEGER DEFAULT 0,
    rating_4_count INTEGER DEFAULT 0,
    rating_3_count INTEGER DEFAULT 0,
    rating_2_count INTEGER DEFAULT 0,
    rating_1_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rating_type, entity_id)
);

CREATE INDEX idx_aggregates_entity ON rating_aggregates(rating_type, entity_id);

-- Reported reviews
CREATE TABLE IF NOT EXISTS rating_reports (
    id SERIAL PRIMARY KEY,
    rating_id INTEGER REFERENCES ratings(id),
    reporter_user_id INTEGER REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to update aggregates
CREATE OR REPLACE FUNCTION update_rating_aggregate()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO rating_aggregates (rating_type, entity_id, average_rating, total_ratings,
        rating_5_count, rating_4_count, rating_3_count, rating_2_count, rating_1_count)
    SELECT 
        NEW.rating_type,
        NEW.rated_entity_id,
        ROUND(AVG(rating)::numeric, 2),
        COUNT(*),
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END),
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END),
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END),
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END),
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)
    FROM ratings
    WHERE rating_type = NEW.rating_type AND rated_entity_id = NEW.rated_entity_id
    ON CONFLICT (rating_type, entity_id)
    DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_ratings = EXCLUDED.total_ratings,
        rating_5_count = EXCLUDED.rating_5_count,
        rating_4_count = EXCLUDED.rating_4_count,
        rating_3_count = EXCLUDED.rating_3_count,
        rating_2_count = EXCLUDED.rating_2_count,
        rating_1_count = EXCLUDED.rating_1_count,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rating_aggregate_trigger
    AFTER INSERT OR UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_rating_aggregate();
