ALTER TABLE posts ADD COLUMN category VARCHAR(255) NOT NULL DEFAULT 'Other';

CREATE INDEX idx_posts_category ON posts(category);
