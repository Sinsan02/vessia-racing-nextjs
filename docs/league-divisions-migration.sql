-- Migration: divisions within a league
-- Run this in Supabase SQL Editor before deploying the divisions feature.
-- A league can have zero or more divisions. Each driver in a league
-- (driver_points row) can be placed in one division of that league.

CREATE TABLE IF NOT EXISTS public.league_divisions (
  id SERIAL PRIMARY KEY,
  league_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_league_divisions_league FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE,
  UNIQUE(league_id, name)
);

CREATE INDEX IF NOT EXISTS idx_league_divisions_league ON public.league_divisions(league_id);

ALTER TABLE public.driver_points
  ADD COLUMN IF NOT EXISTS division_id INTEGER REFERENCES public.league_divisions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_driver_points_division ON public.driver_points(division_id);

ALTER TABLE public.league_divisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view league divisions" ON public.league_divisions;
CREATE POLICY "Everyone can view league divisions" ON public.league_divisions
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Service role can do anything" ON public.league_divisions;
CREATE POLICY "Service role can do anything" ON public.league_divisions
  TO service_role USING (true) WITH CHECK (true);
