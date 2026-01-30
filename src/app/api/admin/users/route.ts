import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, gamertag, experience_level, role, is_driver, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching users:', error);
      throw error;
    }

    // Transform data to match expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      gamertag: user.gamertag,
      experience: user.experience_level,
      role: user.role,
      is_driver: user.is_driver,
      created_at: user.created_at
    }));

    return NextResponse.json({ users: transformedUsers });
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