-- Add iRacing integration fields to users table
-- Run this in Supabase SQL Editor

-- Add iRacing customer ID field
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS iracing_customer_id TEXT;

-- Add fields to cache iRacing data (to reduce API calls)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS iracing_data JSONB;

-- Add last updated timestamp for cache invalidation
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS iracing_data_updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_iracing_customer_id ON public.users(iracing_customer_id);

-- Comment on columns
COMMENT ON COLUMN public.users.iracing_customer_id IS 'iRacing customer ID for API integration';
COMMENT ON COLUMN public.users.iracing_data IS 'Cached iRacing statistics (iRating, safety rating, etc.)';
COMMENT ON COLUMN public.users.iracing_data_updated_at IS 'Last time iRacing data was fetched';
