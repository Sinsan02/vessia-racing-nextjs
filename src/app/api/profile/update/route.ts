import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbQuery } from '@/lib/database';
import { getUserFromRequest } from '@/lib/auth';

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { name, gamertag, experience, bio, email } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and email are required' 
      }, { status: 400 });
    }

    // Check if gamertag is unique (exclude current user) - only if gamertag is provided
    if (gamertag && gamertag.trim()) {
      const existingUser = await dbQuery(
        'SELECT id FROM users WHERE gamertag = $1 AND id != $2', 
        [gamertag, user.userId]
      );
      
      if (existingUser && existingUser.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Gamertag is already taken' 
        }, { status: 400 });
      }
    }

    // Check if email is unique (exclude current user)
    const existingEmail = await dbQuery(
      'SELECT id FROM users WHERE email = $1 AND id != $2', 
      [email, user.userId]
    );
    
    if (existingEmail && existingEmail.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is already in use' 
      }, { status: 400 });
    }

    // Update user profile
    await dbRun(
      'UPDATE users SET full_name = $1, gamertag = $2, experience_level = $3, bio = $4, email = $5 WHERE id = $6',
      [name, gamertag || null, experience, bio, email, user.userId]
    );

    // Fetch updated user data
    const updatedUser = await dbQuery(
      'SELECT id, full_name as name, email, gamertag, experience_level as experience, bio, role, profile_picture, created_at as createdAt FROM users WHERE id = $1',
      [user.userId]
    );

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch updated user data' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedUser[0]);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update profile' 
    }, { status: 500 });
  }
}