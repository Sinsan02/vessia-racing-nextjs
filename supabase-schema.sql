-- Vessia Racing Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security (RLS) extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  experience_level TEXT DEFAULT 'beginner',
  role TEXT DEFAULT 'user',
  is_driver INTEGER DEFAULT 0,
  bio TEXT,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create driver_points table
CREATE TABLE IF NOT EXISTS public.driver_points (
  id SERIAL PRIMARY KEY,
  league_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  races_completed INTEGER DEFAULT 0,
  race_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_driver_points_league FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE,
  CONSTRAINT fk_driver_points_user FOREIGN KEY (driver_id) REFERENCES public.users(id) ON DELETE CASCADE,
  UNIQUE(driver_id, league_id)
);

-- Create points_history table
CREATE TABLE IF NOT EXISTS public.points_history (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL,
  league_id INTEGER NOT NULL,
  points_change INTEGER DEFAULT 0,
  races_change INTEGER DEFAULT 0,
  admin_id INTEGER,
  reason TEXT,
  old_points INTEGER DEFAULT 0,
  new_points INTEGER DEFAULT 0,
  old_races INTEGER DEFAULT 0,
  new_races INTEGER DEFAULT 0,
  action_type TEXT DEFAULT 'MANUAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_points_history_driver FOREIGN KEY (driver_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_points_history_league FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE,
  CONSTRAINT fk_points_history_admin FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_driver_points_league ON public.driver_points(league_id);
CREATE INDEX IF NOT EXISTS idx_driver_points_driver ON public.driver_points(driver_id);
CREATE INDEX IF NOT EXISTS idx_points_history_driver ON public.points_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_points_history_league ON public.points_history(league_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Everyone can read leagues
CREATE POLICY "Everyone can view leagues" ON public.leagues
  FOR SELECT TO authenticated, anon USING (true);

-- Everyone can read driver points
CREATE POLICY "Everyone can view driver points" ON public.driver_points
  FOR SELECT TO authenticated, anon USING (true);

-- Everyone can read points history
CREATE POLICY "Everyone can view points history" ON public.points_history
  FOR SELECT TO authenticated, anon USING (true);

-- Admins can do everything (you might want to adjust this based on your auth setup)
CREATE POLICY "Service role can do anything" ON public.users
  TO service_role USING (true) WITH CHECK (true);
  
CREATE POLICY "Service role can do anything" ON public.leagues
  TO service_role USING (true) WITH CHECK (true);
  
CREATE POLICY "Service role can do anything" ON public.driver_points
  TO service_role USING (true) WITH CHECK (true);
  
CREATE POLICY "Service role can do anything" ON public.points_history
  TO service_role USING (true) WITH CHECK (true);

-- Insert some default data
INSERT INTO public.leagues (name, description) VALUES 
  ('Formula Vessia Championship', 'The premier racing league for Vessia Racing')
ON CONFLICT DO NOTHING;