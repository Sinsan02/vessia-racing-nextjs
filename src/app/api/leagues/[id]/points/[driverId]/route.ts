import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Add points to driver (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string, driverId: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { points, races } = await request.json();
    const { id, driverId } = await params;
    const leagueId = id;
    
    if (points === undefined || points === null || !races || races < 0) {
      return NextResponse.json({ success: false, error: 'Valid points and races are required' }, { status: 400 });
    }

    // Check if driver exists and is a driver
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', driverId)
      .eq('is_driver', 1)
      .single();

    if (driverError || !driver) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    // Get current points for history
    const { data: currentPoints } = await supabaseAdmin
      .from('driver_points')
      .select('points, races_completed')
      .eq('driver_id', driverId)
      .eq('league_id', leagueId)
      .single();

    if (!currentPoints) {
      // Initialize driver in league if not exists
      await supabaseAdmin
        .from('driver_points')
        .insert({
          driver_id: driverId,
          league_id: leagueId,
          points: 0,
          races_completed: 0
        });
    }

    // Get current data after potential initialization
    const { data: currentData } = await supabaseAdmin
      .from('driver_points')
      .select('points, races_completed')
      .eq('driver_id', driverId)
      .eq('league_id', leagueId)
      .single();

    const oldPoints = currentData?.points || 0;
    const oldRaces = currentData?.races_completed || 0;

    // Record in points history
    await supabaseAdmin
      .from('points_history')
      .insert({
        driver_id: driverId,
        league_id: leagueId,
        points_change: points,
        races_change: races,
        admin_id: adminCheck.user?.userId,
        reason: 'Manual points addition',
        old_points: oldPoints,
        new_points: oldPoints + points,
        old_races: oldRaces,
        new_races: oldRaces + races,
        action_type: 'MANUAL_ADD'
      });

    // Update current points
    await supabaseAdmin
      .from('driver_points')
      .update({
        points: oldPoints + points,
        races_completed: oldRaces + races
      })
      .eq('driver_id', driverId)
      .eq('league_id', leagueId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json({ success: false, error: 'Failed to add points' }, { status: 500 });
  }
}

// Remove/reduce points from driver (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, driverId: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { points, races } = await request.json();
    const { id, driverId } = await params;
    const leagueId = id;
    
    if (points === undefined || points === null || races === undefined || races === null) {
      return NextResponse.json({ success: false, error: 'Points and races values are required' }, { status: 400 });
    }

    // Check if driver exists
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    // Get current points before update
    const { data: currentData, error: currentError } = await supabaseAdmin
      .from('driver_points')
      .select('points, races_completed')
      .eq('driver_id', driverId)
      .eq('league_id', leagueId)
      .single();

    if (currentError || !currentData) {
      return NextResponse.json({ success: false, error: 'Driver not found in this league' }, { status: 404 });
    }

    // Calculate new values (ensure they don't go below 0)
    const newPoints = Math.max(0, currentData.points - points);
    const newRaces = Math.max(0, currentData.races_completed - races);

    // Record in points history
    await supabaseAdmin
      .from('points_history')
      .insert({
        driver_id: driverId,
        league_id: leagueId,
        points_change: -points,
        races_change: -races,
        admin_id: adminCheck.user?.userId,
        reason: 'Manual points removal',
        old_points: currentData.points,
        new_points: newPoints,
        old_races: currentData.races_completed,
        new_races: newRaces,
        action_type: 'MANUAL_REMOVE'
      });

    // Update current points
    await supabaseAdmin
      .from('driver_points')
      .update({
        points: newPoints,
        races_completed: newRaces
      })
      .eq('driver_id', driverId)
      .eq('league_id', leagueId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing points:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove points' }, { status: 500 });
  }
}