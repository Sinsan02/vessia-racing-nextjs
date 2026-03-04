-- Migration script for adding event_time column to existing events table
-- Run this in Supabase SQL Editor if you already have an events table

-- Add event_time column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'event_time'
  ) THEN
    ALTER TABLE public.events ADD COLUMN event_time TIME;
    RAISE NOTICE 'event_time column added successfully';
  ELSE
    RAISE NOTICE 'event_time column already exists';
  END IF;
END $$;
