import { NextRequest, NextResponse } from 'next/server';
import { dbRun } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

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
    const filepath = join(process.cwd(), 'public', 'uploads', filename);
    const imageUrl = `/uploads/${filename}`;

    // Ensure uploads directory exists
    const { mkdir } = require('fs/promises');
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    // Write file to disk
    await writeFile(filepath, buffer);

    // Update user profile picture in database
    await dbRun(
      'UPDATE users SET profile_picture = $1 WHERE id = $2',
      [imageUrl, user.userId]
    );

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Profile image updated successfully'
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload image' 
    }, { status: 500 });
  }
}