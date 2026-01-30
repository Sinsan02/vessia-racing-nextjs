import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// Upload profile image
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'File must be an image' 
      }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'File size must be less than 5MB' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `profile_${user.userId}_${timestamp}.${extension}`;

    // Delete old profile picture if exists
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('profile_picture')
      .eq('id', user.userId)
      .single();

    if (currentUser?.profile_picture) {
      // Extract filename from URL to delete old file
      const oldFilename = currentUser.profile_picture.split('/').pop();
      if (oldFilename) {
        await supabaseAdmin.storage
          .from('profile-pictures')
          .remove([oldFilename]);
      }
    }

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('profile-pictures')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to upload image' 
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('profile-pictures')
      .getPublicUrl(filename);

    // Update user profile in database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ profile_picture: publicUrl })
      .eq('id', user.userId);

    if (updateError) {
      console.error('Database update error:', updateError);
      // Clean up uploaded file if database update fails
      await supabaseAdmin.storage
        .from('profile-pictures')
        .remove([filename]);
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update profile' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      message: 'Profile picture updated successfully'
    });
  } catch (error: any) {
    console.error('Profile image upload error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}