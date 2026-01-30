import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Delete league (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin access
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const leagueId = id;
    
    // Delete league and related data using Supabase
    await supabaseAdmin.from('points_history').delete().eq('league_id', leagueId);
    await supabaseAdmin.from('driver_points').delete().eq('league_id', leagueId);
    
    const { error } = await supabaseAdmin.from('leagues').delete().eq('id', leagueId);
    
    if (error) {
      console.error('Error deleting league:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete league' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting league:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete league' }, { status: 500 });
  }
}