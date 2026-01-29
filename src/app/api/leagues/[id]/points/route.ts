import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { dbQuery, dbGet, dbRun, initializeTables } from '@/lib/database';



const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';


// Get league points standings
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const points = await dbQuery(`
      SELECT 
        dp.driver_id as id,
        u.full_name,
        u.profile_picture,
        dp.points,
        dp.races_completed
      FROM driver_points dp
      JOIN users u ON dp.driver_id = u.id
      WHERE dp.league_id = $1 AND u.is_driver = 1
      ORDER BY dp.points DESC, dp.races_completed ASC, u.full_name ASC
    `, [id]);
    
    return NextResponse.json({ success: true, points });
  } catch (error) {
    console.error('Error fetching league points:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch points' }, { status: 500 });
  }
}