import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, initializeTables } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await initializeTables(); // Ensure tables exist

    const drivers = await dbQuery(`
      SELECT id, full_name as name, gamertag, experience_level as experience, created_at, bio, profile_picture
      FROM users 
      WHERE is_driver = 1 
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      drivers: drivers || []
    });
  } catch (error) {
    console.error('Drivers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}