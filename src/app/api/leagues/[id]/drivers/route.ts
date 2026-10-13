import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Get all drivers in a specific league
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }
    
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);

    // Get all drivers in the league
    const { data: drivers, error } = await supabaseAdmin
      .from('driver_points')
      .select('driver_id, division_id')
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error fetching league drivers:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      drivers: drivers?.map((d: any) => d.driver_id) || [],
      assignments: drivers?.map((d: any) => ({ driver_id: d.driver_id, division_id: d.division_id ?? null })) || []
    });
  } catch (error: any) {
    console.error('Error fetching league drivers:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch league drivers' 
    }, { status: 500 });
  }
}

// Add driver to league (optionally directly into a division)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }
    
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);
    const { driverId, divisionId } = await request.json();
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

    // Check if driver is already in the league
    const { data: existingDriver } = await supabaseAdmin
      .from('driver_points')
      .select('*')
      .eq('league_id', leagueId)
      .eq('driver_id', driverId)
      .single();

    if (existingDriver) {
      return NextResponse.json({ 
        success: false, 
        error: 'Driver is already in this league' 
      }, { status: 400 });
    }

    // Add driver to league with 0 points and 0 races
    const { error } = await supabaseAdmin
      .from('driver_points')
      .insert({
        league_id: leagueId,
        driver_id: driverId,
        division_id: divId,
        points: 0,
        races_completed: 0
      });

    if (error) {
      console.error('Error adding driver to league:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Driver added to league successfully'
    });
  } catch (error: any) {
    console.error('Error adding driver to league:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add driver to league' 
    }, { status: 500 });
  }
}
