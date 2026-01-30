import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get full user details from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, experience_level, role, is_driver, bio, profile_picture, created_at')
      .eq('id', userPayload.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.full_name,
      email: user.email,
      experience: user.experience_level,
      role: user.role,
      is_driver: user.is_driver,
      bio: user.bio,
      profile_picture: user.profile_picture,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}