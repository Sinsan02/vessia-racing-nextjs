import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Get all gallery images
export async function GET() {
  try {
    const { data: images, error } = await supabaseAdmin
      .from('gallery')
      .select(`
        id,
        image_url,
        title,
        description,
        created_at,
        users!inner(
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching gallery images:', error);
      throw error;
    }
    
    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch images' }, { status: 500 });
  }
}
