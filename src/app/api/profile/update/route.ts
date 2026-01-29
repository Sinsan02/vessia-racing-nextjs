import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbQuery } from '@/lib/database';
import { requireAuth } from '@/lib/auth';

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { name, gamertag, experience, bio, email } = await request.json();

    // Validate required fields
    if (!name || !email || !gamertag) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, email, and gamertag are required' 
      }, { status: 400 });
    }

    // Check if gamertag is unique (exclude current user)
    const existingUser = await dbQuery(
      'SELECT id FROM users WHERE gamertag = ? AND id != ?', 
      [gamertag, user.userId]
    );
    
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Gamertag is already taken' 
      }, { status: 400 });
    }

    // Check if email is unique (exclude current user)
    const existingEmail = await dbQuery(
      'SELECT id FROM users WHERE email = ? AND id != ?', 
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
      'UPDATE users SET full_name = ?, gamertag = ?, experience_level = ?, bio = ?, email = ? WHERE id = ?',
      [name, gamertag, experience, bio, email, user.userId]
    );

    // Fetch updated user data
    const updatedUser = await dbQuery(
      'SELECT id, full_name as name, email, gamertag, experience_level as experience, bio, role, profile_picture, created_at as createdAt FROM users WHERE id = ?',
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