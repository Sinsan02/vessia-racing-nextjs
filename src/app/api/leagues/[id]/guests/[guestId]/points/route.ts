import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

async function changeGuestPoints(request: NextRequest, params: Promise<{ id: string, guestId: string }>, direction: 1 | -1) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.success) {
    return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
  }

  const { points, races } = await request.json();
  const { id, guestId } = await params;
  const leagueId = parseInt(id);
  const entryId = parseInt(guestId);

  if (points === undefined || points === null || races === undefined || races === null || races < 0) {
    return NextResponse.json({ success: false, error: 'Valid points and races are required' }, { status: 400 });
  }

  const { data: current } = await supabaseAdmin
    .from('driver_points')
    .select('points, races_completed')
    .eq('id', entryId)
    .eq('league_id', leagueId)
    .is('driver_id', null)
    .maybeSingle();

  if (!current) {
    return NextResponse.json({ success: false, error: 'Guest driver not found in this league' }, { status: 404 });
  }

  const oldPoints = current.points || 0;
  const oldRaces = current.races_completed || 0;
  // Removing never takes a driver below 0, same as for registered drivers
  const newPoints = direction === 1 ? oldPoints + points : Math.max(0, oldPoints - points);
  const newRaces = direction === 1 ? oldRaces + races : Math.max(0, oldRaces - races);

  await supabaseAdmin
    .from('points_history')
    .insert({
      driver_id: null,
      guest_entry_id: entryId,
      league_id: leagueId,
      points_change: direction * points,
      races_change: direction * races,
      admin_id: adminCheck.user?.userId,
      reason: direction === 1 ? 'Manual points addition' : 'Manual points removal',
      old_points: oldPoints,
      new_points: newPoints,
      old_races: oldRaces,
      new_races: newRaces,
      action_type: direction === 1 ? 'MANUAL_ADD' : 'MANUAL_REMOVE'
    });

  await supabaseAdmin
    .from('driver_points')
    .update({ points: newPoints, races_completed: newRaces })
    .eq('id', entryId);

  return NextResponse.json({ success: true });
}

// Add points to guest driver (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string, guestId: string }> }) {
  try {
    return await changeGuestPoints(request, params, 1);
  } catch (error) {
    console.error('Error adding guest points:', error);
    return NextResponse.json({ success: false, error: 'Failed to add points' }, { status: 500 });
  }
}

// Remove/reduce points from guest driver (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, guestId: string }> }) {
  try {
    return await changeGuestPoints(request, params, -1);
  } catch (error) {
    console.error('Error removing guest points:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove points' }, { status: 500 });
  }
}
