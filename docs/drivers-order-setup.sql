-- Add display_order to users table for driver ordering
-- Run this in Supabase SQL Editor

-- Add display_order column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999;

-- Set initial order based on id (existing users)
UPDATE public.users 
SET display_order = id 
WHERE display_order = 999;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_display_order ON public.users(display_order);
