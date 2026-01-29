import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbQuery, dbGet, dbRun, initializeTables } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';

// Get all leagues
export async function GET() {
  try {
    await initializeTables(); // Ensure tables exist

    await initializeTables(); // Ensure tables exist
    
    const leagues = await dbQuery(`
      SELECT * FROM leagues 
      WHERE is_active = 1 
      ORDER BY name
    `);
    
    return NextResponse.json({ success: true, leagues });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leagues' }, { status: 500 });
  }
}

// Create new league (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Verify token and admin role
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await dbGet('SELECT role FROM users WHERE id = $1', [decoded.userId]);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { name, description } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'League name is required' }, { status: 400 });
    }

    // Create league
    const result = await dbRun(
      'INSERT INTO leagues (name, description) VALUES ($1, $2) RETURNING id',
      [name.trim(), description || '']
    );

    const leagueId = result.rows[0].id;

    // Initialize points for all drivers in the new league
    const drivers = await dbQuery('SELECT id FROM users WHERE is_driver = 1');
    
    for (const driver of drivers) {
      await dbRun(`
        INSERT INTO driver_points (driver_id, league_id, points, races_completed)
        VALUES ($1, $2, 0, 0)
        ON CONFLICT (driver_id, league_id) DO NOTHING
      `, [driver.id, leagueId]);
    }
    
    return NextResponse.json({ 
      success: true, 
      league: { id: leagueId, name, description } 
    });
  } catch (error) {
    console.error('Error creating league:', error);
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return NextResponse.json({ success: false, error: 'League name already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create league' }, { status: 500 });
  }
}