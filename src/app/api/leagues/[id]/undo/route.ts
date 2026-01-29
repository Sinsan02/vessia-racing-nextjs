import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { dbQuery, dbGet, dbRun, initializeTables } from '@/lib/database';



const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';


// Undo last action in league (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const leagueId = id;

    // Get the last action in this league
    const lastAction = await dbGet(`
      SELECT * FROM points_history 
      WHERE league_id = $1 
      ORDER BY created_at DESC, id DESC 
      LIMIT 1
    `, [leagueId]);

    if (!lastAction) {
      return NextResponse.json({ success: false, error: 'No actions to undo' }, { status: 400 });
    }

    // Reverse the action
    await dbRun(`
      UPDATE driver_points 
      SET points = points - $1, races_completed = races_completed - $2
      WHERE driver_id = $3 AND league_id = $4
    `, [(lastAction as any).points_change, (lastAction as any).races_change, (lastAction as any).driver_id, leagueId]);

    // Remove the history entry
    await dbRun(`DELETE FROM points_history WHERE id = $1`, [(lastAction as any).id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error undoing last action:', error);
    return NextResponse.json({ success: false, error: 'Failed to undo action' }, { status: 500 });
  }
}