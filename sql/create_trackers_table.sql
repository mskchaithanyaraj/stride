-- Create trackers table for Supabase
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.trackers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    time_estimate INTEGER NOT NULL DEFAULT 0,
    deadline TIMESTAMPTZ,
    subtasks JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    celebrated BOOLEAN NOT NULL DEFAULT FALSE,
    group_tags TEXT[],
    in_progress BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trackers_user_id ON public.trackers(user_id);
CREATE INDEX IF NOT EXISTS idx_trackers_created_at ON public.trackers(created_at);
CREATE INDEX IF NOT EXISTS idx_trackers_deadline ON public.trackers(deadline);
CREATE INDEX IF NOT EXISTS idx_trackers_completed ON public.trackers(completed);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trackers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own trackers" ON public.trackers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trackers" ON public.trackers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trackers" ON public.trackers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trackers" ON public.trackers
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_trackers_updated_at
    BEFORE UPDATE ON public.trackers
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
