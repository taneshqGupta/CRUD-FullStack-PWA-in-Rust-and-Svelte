-- Add category column to posts table
ALTER TABLE posts ADD COLUMN category VARCHAR(255) NOT NULL DEFAULT 'Other';

-- Add index for efficient category-based queries
CREATE INDEX idx_posts_category ON posts(category);
