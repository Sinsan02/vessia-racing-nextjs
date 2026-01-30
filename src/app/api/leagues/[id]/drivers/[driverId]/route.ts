import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Remove driver from league
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, driverId: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }
    
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);
    const driverId = parseInt(resolvedParams.driverId);

    // Check if driver exists in the league
    const { data: existingDriver, error: checkError } = await supabaseAdmin
      .from('driver_points')
      .select('*')
      .eq('league_id', leagueId)
      .eq('driver_id', driverId)
      .single();

    if (checkError || !existingDriver) {
      return NextResponse.json({ 
        success: false, 
        error: 'Driver is not in this league' 
      }, { status: 404 });
    }

    // Remove from points history first (foreign key constraint)
    await supabaseAdmin
      .from('points_history')
      .delete()
      .eq('league_id', leagueId)
      .eq('driver_id', driverId);

    // Remove driver from league (this will also remove their points)
    const { error: deleteError } = await supabaseAdmin
      .from('driver_points')
      .delete()
      .eq('league_id', leagueId)
      .eq('driver_id', driverId);

    if (deleteError) {
      console.error('Error removing driver from league:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Driver removed from league successfully'
    });
  } catch (error: any) {
    console.error('Error removing driver from league:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to remove driver from league' 
    }, { status: 500 });
  }
}