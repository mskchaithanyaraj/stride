-- Migration: Convert group_tags array to single category string
-- This migration changes the trackers table from supporting multiple group tags
-- to a single category assignment, aligning with the simplified category system

-- Step 1: Add the new category column
ALTER TABLE trackers ADD COLUMN IF NOT EXISTS category TEXT;

-- Step 2: Migrate existing data (take first group tag if multiple exist)
UPDATE trackers 
SET category = group_tags[1] 
WHERE group_tags IS NOT NULL AND array_length(group_tags, 1) > 0;

-- Step 3: Drop the old group_tags column
ALTER TABLE trackers DROP COLUMN IF EXISTS group_tags;

-- Step 4: Add index for better query performance on category filtering
CREATE INDEX IF NOT EXISTS idx_trackers_category ON trackers(category);
CREATE INDEX IF NOT EXISTS idx_trackers_user_category ON trackers(user_id, category);
