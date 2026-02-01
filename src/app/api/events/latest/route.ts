import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Get latest event (for homepage)
export async function GET() {
  try {
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select(`
        id,
        name,
        description,
        event_date,
        image_url,
        track_name,
        created_at,
        users!inner(
          id,
          full_name
        )
      `)
      .lte('event_date', new Date().toISOString().split('T')[0]) // Events that have already happened
      .order('event_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no events found, return null instead of error
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: true, event: null });
      }
      console.error('Supabase error fetching latest event:', error);
      throw error;
    }
    
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error fetching latest event:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch latest event' }, { status: 500 });
  }
}