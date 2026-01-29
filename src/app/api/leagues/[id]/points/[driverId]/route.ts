import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { dbQuery, dbGet, dbRun, initializeTables } from '@/lib/database';



const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';


// Add points to driver (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string, driverId: string }> }) {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token and admin role
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await dbGet(`SELECT role FROM users WHERE id = $1`, [decoded.userId]) as any;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { points, races } = await request.json();
    const { id, driverId } = await params;
    const leagueId = id;
    
    if (points === undefined || points === null || !races || races < 0) {
      return NextResponse.json({ success: false, error: 'Valid points and races are required' }, { status: 400 });
    }

    // Check if driver exists and is a driver
    const driver = await dbGet(`SELECT * FROM users WHERE id = $1 AND is_driver = 1`, [driverId]);
    if (!driver) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    // Get current points for history
    const currentPoints = await dbGet(`
      SELECT points, races_completed FROM driver_points 
      WHERE driver_id = $1 AND league_id = $2
    `, [driverId, leagueId]);

    if (!currentPoints) {
      // Initialize driver in league if not exists
      await dbRun(`
        INSERT INTO driver_points (driver_id, league_id, points, races_completed)
        VALUES ($1, $2, 0, 0)
      `, [driverId, leagueId]);
    }

    // Get current points before update
    const currentData = await dbGet(`
      SELECT points, races_completed 
      FROM driver_points 
      WHERE driver_id = $1 AND league_id = $2
    `, [driverId, leagueId]) || { points: 0, races_completed: 0 };

    // Record in points history
    await dbRun(`
      INSERT INTO points_history (driver_id, league_id, points_change, races_change, admin_id, reason, old_points, new_points, old_races, new_races, action_type)
      VALUES ($1, $2, $3, $4, $5, 'Manual points addition', $6, $7, $8, $9, 'MANUAL_ADD')
    `, [driverId, leagueId, points, races, decoded.userId, currentData.points, currentData.points + points, currentData.races_completed, currentData.races_completed + races]);

    // Update current points
    await dbRun(`
      UPDATE driver_points 
      SET points = points + $1, races_completed = races_completed + $2
      WHERE driver_id = $3 AND league_id = $4
    `, [points, races, driverId, leagueId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding points:', error);
    return NextResponse.json({ success: false, error: 'Failed to add points' }, { status: 500 });
  }
}

// Remove/reduce points from driver (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, driverId: string }> }) {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token and admin role
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await dbGet(`SELECT role FROM users WHERE id = $1`, [decoded.userId]) as any;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { points, races } = await request.json();
    const { id, driverId } = await params;
    const leagueId = id;
    
    if (points === undefined || points === null || races === undefined || races === null) {
      return NextResponse.json({ success: false, error: 'Points and races values are required' }, { status: 400 });
    }

    // Check if driver exists
    const driver = await dbGet(`SELECT * FROM users WHERE id = $1`, [driverId]);
    if (!driver) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    // Get current points before update
    const currentData = await dbGet(`
      SELECT points, races_completed 
      FROM driver_points 
      WHERE driver_id = $1 AND league_id = $2
    `, [driverId, leagueId]);

    if (!currentData) {
      return NextResponse.json({ success: false, error: 'Driver not found in this league' }, { status: 404 });
    }

    // Calculate new values (ensure they don't go below 0)
    const newPoints = Math.max(0, currentData.points - points);
    const newRaces = Math.max(0, currentData.races_completed - races);

    // Record in points history
    await dbRun(`
      INSERT INTO points_history (driver_id, league_id, points_change, races_change, admin_id, reason, old_points, new_points, old_races, new_races, action_type)
      VALUES ($1, $2, $3, $4, $5, 'Manual points removal', $6, $7, $8, $9, 'MANUAL_REMOVE')
    `, [driverId, leagueId, -points, -races, decoded.userId, currentData.points, newPoints, currentData.races_completed, newRaces]);

    // Update current points
    await dbRun(`
      UPDATE driver_points 
      SET points = $1, races_completed = $2
      WHERE driver_id = $3 AND league_id = $4
    `, [newPoints, newRaces, driverId, leagueId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing points:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove points' }, { status: 500 });
  }
}