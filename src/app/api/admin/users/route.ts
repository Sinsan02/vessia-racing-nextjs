import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const users = await dbQuery(`
      SELECT id, full_name as name, email, gamertag, experience_level as experience, role, is_driver, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Users fetch error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}