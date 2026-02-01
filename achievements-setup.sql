-- Lag achievements tabell for å vise seiere og prestasjoner

-- Drop the table if it exists first (clean slate)
DROP TABLE IF EXISTS public.achievements;

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  race_name TEXT NOT NULL,
  track_name TEXT,
  achievement_date DATE NOT NULL,
  position INTEGER DEFAULT 1, -- 1 = first place, 2 = second, etc.
  category TEXT DEFAULT 'Race Victory', -- Race Victory, Championship, Pole Position, etc.
  icon TEXT DEFAULT '🏆', -- emoji eller icon class
  image_url TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_achievements_user FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_achievements_date ON public.achievements(achievement_date);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Service role can do anything on achievements" ON public.achievements;

-- Create RLS policy so everyone can view achievements
CREATE POLICY "Everyone can view achievements" ON public.achievements
  FOR SELECT TO authenticated, anon USING (true);

-- Service role can do everything
CREATE POLICY "Service role can do anything on achievements" ON public.achievements
  TO service_role USING (true) WITH CHECK (true);

-- Insert test achievements
INSERT INTO public.achievements (title, description, race_name, track_name, achievement_date, position, category, icon, created_by) 
VALUES 
  (
    '24h Daytona Victory', 
    'First place victory at the prestigious 24 Hours of Daytona endurance race',
    '24 Hours of Daytona', 
    'Daytona International Speedway',
    '2025-01-28',
    1,
    'Endurance Victory',
    '🏆',
    1
  ),
  (
    '24h Nürburgring Champion', 
    'Conquered the Green Hell in the grueling 24-hour Nürburgring race',
    '24h Nürburgring', 
    'Nürburgring-Nordschleife',
    '2025-06-15',
    1,
    'Endurance Victory', 
    '🥇',
    1
  ),
  (
    'IMSA Championship 2024', 
    'Season championship victory in the IMSA WeatherTech SportsCar Championship',
    'IMSA Championship', 
    'Multiple Tracks',
    '2024-10-12',
    1,
    'Championship',
    '👑',
    1
  )
ON CONFLICT DO NOTHING;