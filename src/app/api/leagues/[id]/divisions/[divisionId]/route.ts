import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Rename a division (admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string, divisionId: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id, divisionId } = await params;
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Division name is required' }, { status: 400 });
    }

    const { data: division, error } = await supabaseAdmin
      .from('league_divisions')
      .update({ name: name.trim() })
      .eq('id', parseInt(divisionId))
      .eq('league_id', parseInt(id))
      .select('id, league_id, name, sort_order')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'A division with this name already exists in the league' }, { status: 400 });
      }
      console.error('Error renaming division:', error);
      throw error;
    }

    if (!division) {
      return NextResponse.json({ success: false, error: 'Division not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, division });
  } catch (error) {
    console.error('Error renaming division:', error);
    return NextResponse.json({ success: false, error: 'Failed to rename division' }, { status: 500 });
  }
}

// Delete a division (admin only). Drivers in it stay in the league without a division.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, divisionId: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id, divisionId } = await params;
    const leagueId = parseInt(id);
    const divId = parseInt(divisionId);

    const { error: unassignError } = await supabaseAdmin
      .from('driver_points')
      .update({ division_id: null })
      .eq('league_id', leagueId)
      .eq('division_id', divId);

    if (unassignError) {
      console.error('Error unassigning drivers from division:', unassignError);
      throw unassignError;
    }

    const { error } = await supabaseAdmin
      .from('league_divisions')
      .delete()
      .eq('id', divId)
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error deleting division:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting division:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete division' }, { status: 500 });
  }
}
