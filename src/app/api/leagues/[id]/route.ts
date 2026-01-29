import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';
const dbPath = path.join(process.cwd(), 'vessia-racing.db');

// Delete league (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    
    // Delete league and related data
    db.prepare('DELETE FROM points_history WHERE league_id = ?').run(leagueId);
    db.prepare('DELETE FROM driver_points WHERE league_id = ?').run(leagueId);
    db.prepare('DELETE FROM leagues WHERE id = ?').run(leagueId);
    
    db.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting league:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete league' }, { status: 500 });
  }
}