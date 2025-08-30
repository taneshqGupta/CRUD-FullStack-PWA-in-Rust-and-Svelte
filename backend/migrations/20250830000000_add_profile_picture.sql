-- Add profile_picture column to users table
-- This will store the profile picture path or base64 data

ALTER TABLE users ADD COLUMN profile_picture TEXT;
