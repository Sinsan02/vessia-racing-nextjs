-- VIKTIG: Kjør dette i Supabase SQL Editor FØRST
-- Dette oppretter events tabellen som trengs for å se bilder

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  image_url TEXT,
  track_name TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_user FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Create RLS policy so everyone can view events
CREATE POLICY "Everyone can view events" ON public.events
  FOR SELECT TO authenticated, anon USING (true);

-- Service role can do everything
CREATE POLICY "Service role can do anything" ON public.events
  TO service_role USING (true) WITH CHECK (true);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Insert test event med bilde for testing
INSERT INTO public.events (name, description, event_date, image_url, track_name, created_by) 
VALUES (
  'Test Racing Event', 
  'Dette er et test event med bilde for å sjekke at bildene vises riktig på events siden.', 
  '2026-03-15', 
  'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=400&fit=crop',
  'Vessia Speedway',
  1
) ON CONFLICT DO NOTHING;