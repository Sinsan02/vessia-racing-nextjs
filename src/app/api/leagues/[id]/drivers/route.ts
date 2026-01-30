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
      .select('driver_id')
      .eq('league_id', leagueId);

    if (error) {
      console.error('Error fetching league drivers:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      drivers: drivers?.map((d: any) => d.driver_id) || []
    });
  } catch (error: any) {
    console.error('Error fetching league drivers:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch league drivers' 
    }, { status: 500 });
  }
}

// Add driver to league
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }
    
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);
    const { driverId } = await request.json();

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