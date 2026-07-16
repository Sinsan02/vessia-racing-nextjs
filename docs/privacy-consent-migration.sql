-- Migration script for adding privacy policy consent tracking to the users table
-- Run this in Supabase SQL Editor if you already have a users table

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'privacy_accepted_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN privacy_accepted_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'privacy_accepted_at column added successfully';
  ELSE
    RAISE NOTICE 'privacy_accepted_at column already exists';
  END IF;
END $$;

-- Existing users will have privacy_accepted_at = NULL until they accept the
-- privacy policy from their profile page. New registrations set this
-- automatically at signup time (see /api/auth/register).
