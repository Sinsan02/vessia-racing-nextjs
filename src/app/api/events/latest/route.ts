import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Get upcoming event (for homepage)
export async function GET() {
  try {
    const { data: event, error } = await supabaseAdmin
      .from('events')
      .select(`
        id,
        name,
        description,
        event_date,
        event_time,
        image_url,
        track_name,
        created_at,
        users!inner(
          id,
          full_name
        )
      `)
      .gte('event_date', new Date().toISOString().split('T')[0]) // Events in the future or today
      .order('event_date', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      // If no events found, return null instead of error
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: true, event: null });
      }
      console.error('Supabase error fetching upcoming event:', error);
      throw error;
    }
    
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error fetching upcoming event:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch upcoming event' }, { status: 500 });
  }
}