import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'File upload not configured. Please set up Vercel Blob storage.' 
      }, { status: 500 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

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

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    try {
      const { put } = await import('@vercel/blob');
      
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `events/${timestamp}_${cleanName}`;

      const blob = await put(filename, file, {
        access: 'public',
      });

      return NextResponse.json({ 
        success: true, 
        message: 'File uploaded successfully',
        imageUrl: blob.url
      });

    } catch (blobError) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      return NextResponse.json({ 
        success: true, 
        message: 'File uploaded successfully (fallback mode)',
        imageUrl: dataUrl
      });
    }

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}