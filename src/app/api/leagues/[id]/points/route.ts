import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';
const dbPath = path.join(process.cwd(), 'vessia-racing.db');

// Get league points standings
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = new Database(dbPath);
    
    const points = db.prepare(`
      SELECT 
        dp.driver_id as id,
        u.gamertag,
        u.full_name,
        u.profile_picture,
        dp.points,
        dp.races_completed
      FROM driver_points dp
      JOIN users u ON dp.driver_id = u.id
      WHERE dp.league_id = ? AND u.is_driver = 1
      ORDER BY dp.points DESC, dp.races_completed ASC, u.gamertag ASC
    `).all(id);
    
    db.close();
    
    return NextResponse.json({ success: true, points });
  } catch (error) {
    console.error('Error fetching league points:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch points' }, { status: 500 });
  }
}