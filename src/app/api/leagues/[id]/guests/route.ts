import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Add a guest driver (name only, no user account) to a league (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const leagueId = parseInt(id);
    const { name, divisionId } = await request.json();
    const divId = divisionId ? parseInt(divisionId) : null;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Driver name is required' }, { status: 400 });
    }

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

    const { data: guest, error } = await supabaseAdmin
      .from('driver_points')
      .insert({
        league_id: leagueId,
        driver_id: null,
        guest_name: name.trim(),
        division_id: divId,
        points: 0,
        races_completed: 0
      })
      .select('id, guest_name, division_id, points, races_completed')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'A guest driver with this name already exists in the league' }, { status: 400 });
      }
      if (error.code === '23503') {
        return NextResponse.json({ success: false, error: 'League not found' }, { status: 404 });
      }
      console.error('Error adding guest driver:', error);
      throw error;
    }

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    console.error('Error adding guest driver:', error);
    return NextResponse.json({ success: false, error: 'Failed to add guest driver' }, { status: 500 });
  }
}
