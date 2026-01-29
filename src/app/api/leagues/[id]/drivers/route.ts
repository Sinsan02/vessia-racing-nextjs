import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbQuery } from '@/lib/database';
import { requireAdmin } from '@/lib/auth';

// Get all drivers in a specific league
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin(request);
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);

    // Get all drivers in the league
    const drivers = await dbQuery(
      'SELECT driver_id FROM driver_points WHERE league_id = $1',
      [leagueId]
    );

    return NextResponse.json({
      success: true,
      drivers: drivers.map((d: any) => d.driver_id)
    });
  } catch (error: any) {
    console.error('Error fetching league drivers:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch league drivers' 
    }, { status: 500 });
  }
}

// Add driver to league
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdmin(request);
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);
    const { driverId } = await request.json();

    // Check if driver is already in the league
    const existingDriver = await dbQuery(
      'SELECT * FROM driver_points WHERE league_id = $1 AND driver_id = $2',
      [leagueId, driverId]
    );

    if (existingDriver && existingDriver.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Driver is already in this league' 
      }, { status: 400 });
    }

    // Add driver to league with 0 points and 0 races
    await dbRun(
      'INSERT INTO driver_points (league_id, driver_id, points, races_completed) VALUES ($1, $2, 0, 0)',
      [leagueId, driverId]
    );

    return NextResponse.json({
      success: true,
      message: 'Driver added to league successfully'
    });
  } catch (error: any) {
    console.error('Error adding driver to league:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add driver to league' 
    }, { status: 500 });
  }
}