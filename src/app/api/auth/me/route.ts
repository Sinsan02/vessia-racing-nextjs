import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { dbGet, initializeTables } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await initializeTables(); // Ensure tables exist

    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get full user details from database
    const user = await dbGet(
      'SELECT id, full_name as name, email, gamertag, experience_level as experience, role, is_driver, bio, profile_picture, created_at FROM users WHERE id = $1',
      [userPayload.userId]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}