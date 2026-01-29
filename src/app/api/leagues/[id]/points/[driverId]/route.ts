import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';
const dbPath = path.join(process.cwd(), 'vessia-racing.db');

// Add points to driver (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string, driverId: string }> }) {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token and admin role
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const db = new Database(dbPath);
    
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.userId) as any;
    if (!user || user.role !== 'admin') {
      db.close();
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { points, races } = await request.json();
    const { id, driverId } = await params;
    const leagueId = id;
    
    if (points === undefined || points === null || !races || races < 0) {
      db.close();
      return NextResponse.json({ success: false, error: 'Valid points and races are required' }, { status: 400 });
    }

    // Check if driver exists and is a driver
    const driver = db.prepare('SELECT * FROM users WHERE id = ? AND is_driver = 1').get(driverId);
    if (!driver) {
      db.close();
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    // Get current points for history
    const currentPoints = db.prepare(`
      SELECT points, races_completed FROM driver_points 
      WHERE driver_id = ? AND league_id = ?
    `).get(driverId, leagueId);

    if (!currentPoints) {
      // Initialize driver in league if not exists
      db.prepare(`
        INSERT INTO driver_points (driver_id, league_id, points, races_completed)
        VALUES (?, ?, 0, 0)
      `).run(driverId, leagueId);
    }

    // Get current points before update
    const currentData = db.prepare(`
      SELECT points, races_completed 
      FROM driver_points 
      WHERE driver_id = ? AND league_id = ?
    `).get(driverId, leagueId) as any || { points: 0, races_completed: 0 };

    // Record in points history
    db.prepare(`
      INSERT INTO points_history (driver_id, league_id, points_change, races_change, admin_id, reason, old_points, new_points, old_races, new_races, action_type)
      VALUES (?, ?, ?, ?, ?, 'Manual points addition', ?, ?, ?, ?, 'MANUAL_ADD')
    `).run(driverId, leagueId, points, races, decoded.userId, currentData.points, currentData.points + points, currentData.races_completed, currentData.races_completed + races);

    // Update current points
    db.prepare(`
      UPDATE driver_points 
      SET points = points + ?, races_completed = races_completed + ?
      WHERE driver_id = ? AND league_id = ?
    `).run(points, races, driverId, leagueId);

    db.close();
    
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
    const db = new Database(dbPath);
    
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.userId) as any;
    if (!user || user.role !== 'admin') {
      db.close();
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { points, races } = await request.json();
    const { id, driverId } = await params;
    const leagueId = id;
    
    if (points === undefined || points === null || races === undefined || races === null) {
      db.close();
      return NextResponse.json({ success: false, error: 'Points and races values are required' }, { status: 400 });
    }

    // Check if driver exists
    const driver = db.prepare('SELECT * FROM users WHERE id = ?').get(driverId);
    if (!driver) {
      db.close();
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    // Get current points before update
    const currentData = db.prepare(`
      SELECT points, races_completed 
      FROM driver_points 
      WHERE driver_id = ? AND league_id = ?
    `).get(driverId, leagueId) as any;

    if (!currentData) {
      db.close();
      return NextResponse.json({ success: false, error: 'Driver not found in this league' }, { status: 404 });
    }

    // Calculate new values (ensure they don't go below 0)
    const newPoints = Math.max(0, currentData.points - points);
    const newRaces = Math.max(0, currentData.races_completed - races);

    // Record in points history
    db.prepare(`
      INSERT INTO points_history (driver_id, league_id, points_change, races_change, admin_id, reason, old_points, new_points, old_races, new_races, action_type)
      VALUES (?, ?, ?, ?, ?, 'Manual points removal', ?, ?, ?, ?, 'MANUAL_REMOVE')
    `).run(driverId, leagueId, -points, -races, decoded.userId, currentData.points, newPoints, currentData.races_completed, newRaces);

    // Update current points
    db.prepare(`
      UPDATE driver_points 
      SET points = ?, races_completed = ?
      WHERE driver_id = ? AND league_id = ?
    `).run(newPoints, newRaces, driverId, leagueId);

    db.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing points:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove points' }, { status: 500 });
  }
}