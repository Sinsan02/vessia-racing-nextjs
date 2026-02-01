import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Update event (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const { name, description, event_date, image_url, track_name } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Event name is required' }, { status: 400 });
    }

    if (!event_date) {
      return NextResponse.json({ success: false, error: 'Event date is required' }, { status: 400 });
    }

    // Update event
    const { data: updatedEvent, error: updateError } = await supabaseAdmin
      .from('events')
      .update({
        name: name.trim(),
        description: description || '',
        event_date,
        image_url: image_url || null,
        track_name: track_name || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating event:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Event updated successfully!',
      event: updatedEvent 
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
  }
}

// Delete event (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;

    // Delete event
    const { error: deleteError } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting event:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Event deleted successfully!' 
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}