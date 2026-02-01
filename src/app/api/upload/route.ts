import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');
    
    // Check if we have the Blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not found in environment variables');
      return NextResponse.json({ 
        success: false, 
        error: 'File upload not configured. Please set up Vercel Blob storage.' 
      }, { status: 500 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      console.log('No file received');
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:', { name: file.name, size: file.size, type: file.type });

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' 
      }, { status: 400 });
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('File too large:', file.size);
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    try {
      // Dynamic import of Vercel Blob
      const { put } = await import('@vercel/blob');
      
      // Generate unique filename
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `events/${timestamp}_${cleanName}`;

      console.log('Attempting to upload to Vercel Blob with filename:', filename);

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
      });

      console.log('Upload successful:', blob.url);

      return NextResponse.json({ 
        success: true, 
        message: 'File uploaded successfully',
        imageUrl: blob.url
      });

    } catch (blobError) {
      console.error('Vercel Blob upload error:', blobError);
      
      // Fallback to base64 data URL for development/testing
      console.log('Falling back to base64 data URL');
      
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
    console.error('General upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}