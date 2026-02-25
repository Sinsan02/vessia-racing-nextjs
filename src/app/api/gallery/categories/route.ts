import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Get all gallery categories
export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('gallery_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Supabase error fetching categories:', error);
      throw error;
    }
    
    return NextResponse.json({ success: true, categories: categories || [] });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}
