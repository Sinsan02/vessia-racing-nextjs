import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          full_name: string
          email: string
          password_hash: string
          gamertag: string | null
          experience_level: string
          role: string
          is_driver: number
          bio: string | null
          profile_picture: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          full_name: string
          email: string
          password_hash: string
          gamertag?: string | null
          experience_level?: string
          role?: string
          is_driver?: number
          bio?: string | null
          profile_picture?: string | null
        }
        Update: {
          full_name?: string
          email?: string
          password_hash?: string
          gamertag?: string | null
          experience_level?: string
          role?: string
          is_driver?: number
          bio?: string | null
          profile_picture?: string | null
          updated_at?: string
        }
      }
      leagues: {
        Row: {
          id: number
          name: string
          description: string | null
          is_active: number
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          is_active?: number
        }
        Update: {
          name?: string
          description?: string | null
          is_active?: number
          updated_at?: string
        }
      }
      driver_points: {
        Row: {
          id: number
          league_id: number
          driver_id: number
          points: number
          races_completed: number
          race_position: number | null
          created_at: string
        }
        Insert: {
          league_id: number
          driver_id: number
          points?: number
          races_completed?: number
          race_position?: number | null
        }
        Update: {
          league_id?: number
          driver_id?: number
          points?: number
          races_completed?: number
          race_position?: number | null
        }
      }
      league_drivers: {
        Row: {
          id: number
          league_id: number
          driver_id: number
          joined_at: string
        }
        Insert: {
          league_id: number
          driver_id: number
        }
        Update: {
          league_id?: number
          driver_id?: number
        }
      }
      points_history: {
        Row: {
          id: number
          driver_id: number
          league_id: number
          points_change: number
          races_change: number
          admin_id: number | null
          reason: string | null
          old_points: number
          new_points: number
          old_races: number
          new_races: number
          action_type: string
          created_at: string
        }
        Insert: {
          driver_id: number
          league_id: number
          points_change?: number
          races_change?: number
          admin_id?: number | null
          reason?: string | null
          old_points?: number
          new_points?: number
          old_races?: number
          new_races?: number
          action_type?: string
        }
        Update: {
          driver_id?: number
          league_id?: number
          points_change?: number
          races_change?: number
          admin_id?: number | null
          reason?: string | null
          old_points?: number
          new_points?: number
          old_races?: number
          new_races?: number
          action_type?: string
        }
      }
    }
  }
}