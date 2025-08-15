-- SQL Script to set up Supabase tables for Stride app
-- Run this in your Supabase SQL editor

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unique_code VARCHAR(6) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trackers table
CREATE TABLE IF NOT EXISTS trackers (
    id UUID PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    time_estimate INTEGER NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    subtasks JSONB DEFAULT '[]'::jsonb,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    celebrated BOOLEAN DEFAULT false,
    "group" VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_unique_code ON workspaces(unique_code);
CREATE INDEX IF NOT EXISTS idx_trackers_workspace_id ON trackers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_trackers_deadline ON trackers(deadline);
CREATE INDEX IF NOT EXISTS idx_trackers_completed ON trackers(completed);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trackers_updated_at ON trackers;
CREATE TRIGGER update_trackers_updated_at
    BEFORE UPDATE ON trackers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE trackers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can read workspaces by unique_code (for joining)
DROP POLICY IF EXISTS "Workspaces are readable by unique_code" ON workspaces;
CREATE POLICY "Workspaces are readable by unique_code" ON workspaces
    FOR SELECT USING (true);

-- Anyone can create workspaces
DROP POLICY IF EXISTS "Anyone can create workspaces" ON workspaces;
CREATE POLICY "Anyone can create workspaces" ON workspaces
    FOR INSERT WITH CHECK (true);

-- Anyone can read trackers (they need workspace_id to access)
DROP POLICY IF EXISTS "Trackers are readable by anyone" ON trackers;
CREATE POLICY "Trackers are readable by anyone" ON trackers
    FOR SELECT USING (true);

-- Anyone can insert trackers
DROP POLICY IF EXISTS "Anyone can insert trackers" ON trackers;
CREATE POLICY "Anyone can insert trackers" ON trackers
    FOR INSERT WITH CHECK (true);

-- Anyone can update trackers
DROP POLICY IF EXISTS "Anyone can update trackers" ON trackers;
CREATE POLICY "Anyone can update trackers" ON trackers
    FOR UPDATE USING (true);

-- Anyone can delete trackers
DROP POLICY IF EXISTS "Anyone can delete trackers" ON trackers;
CREATE POLICY "Anyone can delete trackers" ON trackers
    FOR DELETE USING (true);

-- Add some sample data (optional)
-- INSERT INTO workspaces (unique_code, name) VALUES ('DEMO01', 'Demo Workspace');
