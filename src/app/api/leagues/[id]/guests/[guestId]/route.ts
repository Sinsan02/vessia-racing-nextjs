import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Rename a guest driver and/or move them to another division (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string, guestId: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id, guestId } = await params;
    const leagueId = parseInt(id);
    const body = await request.json();
    const update: { guest_name?: string; division_id?: number | null } = {};

    if (body.name !== undefined) {
      if (!body.name || !body.name.trim()) {
        return NextResponse.json({ success: false, error: 'Driver name is required' }, { status: 400 });
      }
      update.guest_name = body.name.trim();
    }

    if (body.divisionId !== undefined) {
      const divId = body.divisionId ? parseInt(body.divisionId) : null;
      if (divId) {
        const { data: division } = await supabaseAdmin
          .from('league_divisions')
          .select('id')
          .eq('id', divId)
          .eq('league_id', leagueId)
          .maybeSingle();

        if (!division) {
          return NextResponse.json({ success: false, error: 'Division does not belong to this league' }, { status: 400 });
        }
      }
      update.division_id = divId;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 });
    }

    const { data: guest, error } = await supabaseAdmin
      .from('driver_points')
      .update(update)
      .eq('id', parseInt(guestId))
      .eq('league_id', leagueId)
      .is('driver_id', null)
      .select('id')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'A guest driver with this name already exists in the league' }, { status: 400 });
      }
      console.error('Error updating guest driver:', error);
      throw error;
    }

    if (!guest) {
      return NextResponse.json({ success: false, error: 'Guest driver not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating guest driver:', error);
    return NextResponse.json({ success: false, error: 'Failed to update guest driver' }, { status: 500 });
  }
}

// Remove a guest driver and their points history from the league (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, guestId: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id, guestId } = await params;
    const leagueId = parseInt(id);
    const entryId = parseInt(guestId);

    await supabaseAdmin
      .from('points_history')
      .delete()
      .eq('league_id', leagueId)
      .eq('guest_entry_id', entryId);

    const { data: deleted, error } = await supabaseAdmin
      .from('driver_points')
      .delete()
      .eq('id', entryId)
      .eq('league_id', leagueId)
      .is('driver_id', null)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Error removing guest driver:', error);
      throw error;
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Guest driver not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing guest driver:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove guest driver' }, { status: 500 });
  }
}
