import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { dbQuery, dbGet, dbRun, initializeTables } from '@/lib/database';



const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';


// Delete league (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    
    // Delete league and related data
    await dbRun(`DELETE FROM points_history WHERE league_id = $1`, [leagueId]);
    await dbRun(`DELETE FROM driver_points WHERE league_id = $1`, [leagueId]);
    await dbRun(`DELETE FROM leagues WHERE id = $1`, [leagueId]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting league:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete league' }, { status: 500 });
  }
}