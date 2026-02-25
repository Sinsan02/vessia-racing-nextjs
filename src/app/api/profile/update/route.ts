import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { name, gamertag, experience, bio, email, iracing_customer_id } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and email are required' 
      }, { status: 400 });
    }

    // Check if gamertag is unique (exclude current user) - only if gamertag is provided
    if (gamertag && gamertag.trim()) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('gamertag', gamertag)
        .neq('id', user.userId)
        .single();
      
      if (existingUser) {
        return NextResponse.json({ 
          success: false, 
          error: 'Gamertag is already taken' 
        }, { status: 400 });
      }
    }

    // Check if email is unique (exclude current user)
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', user.userId)
      .single();
    
    if (existingEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is already in use' 
      }, { status: 400 });
    }

    // Update user profile
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        full_name: name,
        gamertag: gamertag || null,
        experience_level: experience,
        bio: bio,
        email: email,
        iracing_customer_id: iracing_customer_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.userId)
      .select('id, full_name, email, gamertag, experience_level, bio, role, profile_picture, created_at, iracing_customer_id')
      .single();

    if (error || !updatedUser) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update profile' 
      }, { status: 500 });
    }

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.full_name,
      email: updatedUser.email,
      gamertag: updatedUser.gamertag,
      experience: updatedUser.experience_level,
      bio: updatedUser.bio,
      role: updatedUser.role,
      profile_picture: updatedUser.profile_picture,
      createdAt: updatedUser.created_at,
      iracing_customer_id: updatedUser.iracing_customer_id
    });
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