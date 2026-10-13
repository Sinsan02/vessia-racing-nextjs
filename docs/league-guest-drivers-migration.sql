-- Migration: guest drivers in leagues
-- Run this in Supabase SQL Editor before deploying the guest drivers feature.
-- A guest driver is an opponent without a user account: a driver_points row
-- with only a name (guest_name) and no driver_id. Points history for guests
-- references the driver_points row via guest_entry_id.

ALTER TABLE public.driver_points ALTER COLUMN driver_id DROP NOT NULL;
ALTER TABLE public.driver_points ADD COLUMN IF NOT EXISTS guest_name TEXT;

ALTER TABLE public.driver_points DROP CONSTRAINT IF EXISTS chk_driver_points_driver_or_guest;
ALTER TABLE public.driver_points ADD CONSTRAINT chk_driver_points_driver_or_guest
  CHECK ((driver_id IS NOT NULL AND guest_name IS NULL) OR (driver_id IS NULL AND guest_name IS NOT NULL));

CREATE UNIQUE INDEX IF NOT EXISTS uq_driver_points_league_guest_name
  ON public.driver_points(league_id, lower(guest_name))
  WHERE guest_name IS NOT NULL;

ALTER TABLE public.points_history ALTER COLUMN driver_id DROP NOT NULL;
ALTER TABLE public.points_history
  ADD COLUMN IF NOT EXISTS guest_entry_id INTEGER REFERENCES public.driver_points(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_points_history_guest_entry ON public.points_history(guest_entry_id);
