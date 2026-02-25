import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const data = await request.formData();
    const file: File | null = data.get('image') as unknown as File;
    const title = data.get('title') as string || '';
    const description = data.get('description') as string || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' 
      }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB for gallery
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 10MB' 
      }, { status: 400 });
    }

    let imageUrl: string;

    // Try Vercel Blob first
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error('Blob storage not configured');
      }

      const { put } = await import('@vercel/blob');
      
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `gallery/${timestamp}_${cleanName}`;

      const blob = await put(filename, file, {
        access: 'public',
      });

      imageUrl = blob.url;
    } catch (blobError) {
      // Fallback to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      imageUrl = `data:${file.type};base64,${base64}`;
    }

    // Save to database
    const { data: newImage, error: dbError } = await supabaseAdmin
      .from('gallery')
      .insert({
        image_url: imageUrl,
        title: title || null,
        description: description || null,
        uploaded_by: adminCheck.user.userId
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving image to database:', dbError);
      return NextResponse.json({ success: false, error: 'Failed to save image' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      image: newImage
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
