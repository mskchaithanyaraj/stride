-- Migration: Add is_daily column to trackers table
-- This allows tasks to automatically reset to incomplete at the start of each new day

-- Add the is_daily column with default false
ALTER TABLE trackers ADD COLUMN IF NOT EXISTS is_daily BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for better query performance when filtering daily todos
CREATE INDEX IF NOT EXISTS idx_trackers_is_daily ON trackers(is_daily) WHERE is_daily = TRUE;
