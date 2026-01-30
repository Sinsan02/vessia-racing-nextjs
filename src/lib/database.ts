import { supabase, supabaseAdmin } from './supabase';

// Use Supabase instead of direct PostgreSQL connection
export async function getDatabase() {
  return supabaseAdmin;
}

// Initialize database tables using Supabase
export async function initializeTables() {
  console.log('🔧 Database tables should be created in Supabase dashboard');
  console.log('Run the SQL from supabase-schema.sql in your Supabase SQL Editor');
  console.log('✅ Using Supabase - no local table initialization needed');
}

// Database query functions using Supabase
export const dbQuery = async (sql: string, params: any[] = []): Promise<any> => {
  console.warn('dbQuery with raw SQL not supported with Supabase. Use supabase client methods instead.');
  return [];
};

export const dbRun = async (sql: string, params: any[] = []): Promise<any> => {
  console.warn('dbRun with raw SQL not supported with Supabase. Use supabase client methods instead.');
  return { lastID: null, changes: 0, rows: [] };
};

export const dbGet = async (sql: string, params: any[] = []): Promise<any> => {
  console.warn('dbGet with raw SQL not supported with Supabase. Use supabase client methods instead.');
  return null;

  // For Supabase operations, use these instead:
  // const { data, error } = await supabaseAdmin.from('table_name').select('*');
  // const { data, error } = await supabaseAdmin.from('table_name').insert({...});
  // const { data, error } = await supabaseAdmin.from('table_name').update({...}).eq('id', id);
};