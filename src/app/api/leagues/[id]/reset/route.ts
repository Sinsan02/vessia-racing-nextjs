import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';
const dbPath = path.join(process.cwd(), 'vessia-racing.db');

// Reset all points in league (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const leagueId = id;

    // Record reset in history for all drivers
    const drivers = db.prepare(`
      SELECT driver_id, points, races_completed 
      FROM driver_points 
      WHERE league_id = ? AND (points > 0 OR races_completed > 0)
    `).all(leagueId);

    for (const driver of drivers) {
      db.prepare(`
        INSERT INTO points_history (driver_id, league_id, points_change, races_change, admin_id, reason)
        VALUES (?, ?, ?, ?, ?, 'League reset')
      `).run((driver as any).driver_id, leagueId, -(driver as any).points, -(driver as any).races_completed, decoded.userId);
    }

    // Reset all points to 0
    db.prepare(`
      UPDATE driver_points 
      SET points = 0, races_completed = 0
      WHERE league_id = ?
    `).run(leagueId);

    db.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting league points:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset points' }, { status: 500 });
  }
}