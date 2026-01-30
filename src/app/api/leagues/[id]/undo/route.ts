import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Undo last action in league (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const leagueId = id;

    // Get the last action in this league
    const { data: lastAction, error: historyError } = await supabaseAdmin
      .from('points_history')
      .select('*')
      .eq('league_id', leagueId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (historyError || !lastAction) {
      return NextResponse.json({ success: false, error: 'No actions to undo' }, { status: 400 });
    }

    // Reverse the action
    const { error: updateError } = await supabaseAdmin
      .from('driver_points')
      .update({
        points: lastAction.old_points,
        races_completed: lastAction.old_races
      })
      .eq('driver_id', lastAction.driver_id)
      .eq('league_id', leagueId);

    if (updateError) {
      console.error('Error reversing action:', updateError);
      throw updateError;
    }

    // Remove the history entry
    const { error: deleteError } = await supabaseAdmin
      .from('points_history')
      .delete()
      .eq('id', lastAction.id);

    if (deleteError) {
      console.error('Error deleting history:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error undoing last action:', error);
    return NextResponse.json({ success: false, error: 'Failed to undo action' }, { status: 500 });
  }
}