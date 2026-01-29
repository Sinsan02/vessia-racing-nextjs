import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';
const dbPath = path.join(process.cwd(), 'vessia-racing.db');

// Undo last action in league (admin only)
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

    // Get the last action in this league
    const lastAction = db.prepare(`
      SELECT * FROM points_history 
      WHERE league_id = ? 
      ORDER BY created_at DESC, id DESC 
      LIMIT 1
    `).get(leagueId);

    if (!lastAction) {
      db.close();
      return NextResponse.json({ success: false, error: 'No actions to undo' }, { status: 400 });
    }

    // Reverse the action
    db.prepare(`
      UPDATE driver_points 
      SET points = points - ?, races_completed = races_completed - ?
      WHERE driver_id = ? AND league_id = ?
    `).run((lastAction as any).points_change, (lastAction as any).races_change, (lastAction as any).driver_id, leagueId);

    // Remove the history entry
    db.prepare('DELETE FROM points_history WHERE id = ?').run((lastAction as any).id);

    db.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error undoing last action:', error);
    return NextResponse.json({ success: false, error: 'Failed to undo action' }, { status: 500 });
  }
}