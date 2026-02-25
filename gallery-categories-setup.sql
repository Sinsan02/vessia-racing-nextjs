-- Add categories support to gallery
-- Run this in Supabase SQL Editor

-- Add category column to gallery table
ALTER TABLE public.gallery 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Create gallery_categories table for managing sections
CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO public.gallery_categories (name, description, display_order) VALUES
  ('General', 'Diverse bilder', 1),
  ('Race Events', 'Bilder fra race-events', 2),
  ('Team', 'Team bilder', 3),
  ('Behind the Scenes', 'Bak kulissene', 4)
ON CONFLICT (name) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_gallery_category ON public.gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_order ON public.gallery_categories(display_order);

-- Enable RLS on categories table
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Everyone can view categories" ON public.gallery_categories
  FOR SELECT TO authenticated, anon USING (true);

-- Service role can manage categories
CREATE POLICY "Service role can manage categories" ON public.gallery_categories
  TO service_role USING (true) WITH CHECK (true);
