import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'vessia-racing-secret-key';
const dbPath = path.join(process.cwd(), 'vessia-racing.db');

// Get all leagues
export async function GET() {
  try {
    const db = new Database(dbPath);
    
    const leagues = db.prepare(`
      SELECT * FROM leagues 
      WHERE is_active = 1 
      ORDER BY name
    `).all();
    
    db.close();
    
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
    const db = new Database(dbPath);
    
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.userId) as any;
    if (!user || user.role !== 'admin') {
      db.close();
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { name, description } = await request.json();
    
    if (!name || !name.trim()) {
      db.close();
      return NextResponse.json({ success: false, error: 'League name is required' }, { status: 400 });
    }

    // Create league
    const result = db.prepare(`
      INSERT INTO leagues (name, description) VALUES (?, ?)
    `).run(name.trim(), description || '');

    // Initialize points for all drivers in the new league
    const drivers = db.prepare('SELECT id FROM users WHERE is_driver = 1').all();
    
    const insertPoints = db.prepare(`
      INSERT INTO driver_points (driver_id, league_id, points, races_completed)
      SELECT ?, ?, 0, 0
      WHERE NOT EXISTS (
        SELECT 1 FROM driver_points WHERE driver_id = ? AND league_id = ?
      )
    `);

    for (const driver of drivers) {
      insertPoints.run((driver as any).id, result.lastInsertRowid, (driver as any).id, result.lastInsertRowid);
    }

    db.close();
    
    return NextResponse.json({ 
      success: true, 
      league: { id: result.lastInsertRowid, name, description } 
    });
  } catch (error) {
    console.error('Error creating league:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ success: false, error: 'League name already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create league' }, { status: 500 });
  }
}