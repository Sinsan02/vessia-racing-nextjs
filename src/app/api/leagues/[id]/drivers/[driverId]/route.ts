import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbQuery } from '@/lib/database';
import { requireAdmin } from '@/lib/auth';

// Remove driver from league
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, driverId: string }> }) {
  try {
    const user = requireAdmin(request);
    const resolvedParams = await params;
    const leagueId = parseInt(resolvedParams.id);
    const driverId = parseInt(resolvedParams.driverId);

    // Check if driver exists in the league
    const existingDriver = await dbQuery(
      'SELECT * FROM driver_points WHERE league_id = ? AND driver_id = ?',
      [leagueId, driverId]
    );

    if (!existingDriver || existingDriver.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Driver is not in this league' 
      }, { status: 404 });
    }

    // Remove driver from league (this will also remove their points)
    await dbRun(
      'DELETE FROM driver_points WHERE league_id = ? AND driver_id = ?',
      [leagueId, driverId]
    );

    // Also remove from points history
    await dbRun(
      'DELETE FROM points_history WHERE league_id = ? AND driver_id = ?',
      [leagueId, driverId]
    );

    return NextResponse.json({
      success: true,
      message: 'Driver removed from league successfully'
    });
  } catch (error: any) {
    console.error('Error removing driver from league:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to remove driver from league' 
    }, { status: 500 });
  }
}