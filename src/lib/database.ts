import { supabaseAdmin } from './supabase';

export async function getDatabase() {
  return supabaseAdmin;
}