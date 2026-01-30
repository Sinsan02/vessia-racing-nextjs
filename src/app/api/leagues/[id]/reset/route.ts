import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Reset all points in league (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const leagueId = id;

    // Record reset in history for all drivers
    const { data: drivers, error: driversError } = await supabaseAdmin
      .from('driver_points')
      .select('driver_id, points, races_completed')
      .eq('league_id', leagueId)
      .or('points.gt.0,races_completed.gt.0');

    if (!driversError && drivers) {
      for (const driver of drivers) {
        await supabaseAdmin
          .from('points_history')
          .insert({
            driver_id: driver.driver_id,
            league_id: leagueId,
            points_change: -driver.points,
            races_change: -driver.races_completed,
            admin_id: adminCheck.user?.userId,
            reason: 'League reset'
          });
      }
    }

    // Reset all points to 0
    const { error: resetError } = await supabaseAdmin
      .from('driver_points')
      .update({ points: 0, races_completed: 0 })
      .eq('league_id', leagueId);

    if (resetError) {
      console.error('Error resetting league points:', resetError);
      throw resetError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting league points:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset points' }, { status: 500 });
  }
}