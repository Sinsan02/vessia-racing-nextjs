import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Get all events
export async function GET() {
  try {
    const { data: events, error } = await supabaseAdmin
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
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Supabase error fetching events:', error);
      throw error;
    }
    
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
  }
}

// Create new event (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { name, description, event_date, image_url, track_name } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Event name is required' }, { status: 400 });
    }

    if (!event_date) {
      return NextResponse.json({ success: false, error: 'Event date is required' }, { status: 400 });
    }

    // Create event
    const { data: newEvent, error: createError } = await supabaseAdmin
      .from('events')
      .insert({
        name: name.trim(),
        description: description || '',
        event_date,
        image_url: image_url || null,
        track_name: track_name || '',
        created_by: adminCheck.user.userId
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating event:', createError);
      return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Event created successfully!',
      event: newEvent 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
  }
}