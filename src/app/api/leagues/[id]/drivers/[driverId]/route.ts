import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Move driver to another division within the league (divisionId null = no division)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string, driverId: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);
    const driverId = parseInt(resolvedParams.driverId);
    const { divisionId } = await request.json();
    const divId = divisionId ? parseInt(divisionId) : null;

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

    const { data: updated, error } = await supabaseAdmin
      .from('driver_points')
      .update({ division_id: divId })
      .eq('league_id', leagueId)
      .eq('driver_id', driverId)
      .select('driver_id')
      .maybeSingle();

    if (error) {
      console.error('Error changing driver division:', error);
      throw error;
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Driver is not in this league' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error changing driver division:', error);
    return NextResponse.json({ success: false, error: 'Failed to change division' }, { status: 500 });
  }
}

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