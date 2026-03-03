-- Gallery table setup for Vessia Racing
-- Run this in Supabase SQL Editor

-- Create gallery table
CREATE TABLE IF NOT EXISTS public.gallery (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  uploaded_by INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gallery_user FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_uploaded_by ON public.gallery(uploaded_by);

-- Enable RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view gallery" ON public.gallery;
DROP POLICY IF EXISTS "Service role can do anything" ON public.gallery;

-- Create RLS policy so everyone can view gallery
CREATE POLICY "Everyone can view gallery" ON public.gallery
  FOR SELECT TO authenticated, anon USING (true);

-- Service role can do everything (admins via API)
CREATE POLICY "Service role can do anything" ON public.gallery
  TO service_role USING (true) WITH CHECK (true);
