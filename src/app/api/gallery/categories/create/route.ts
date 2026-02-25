import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    // Check if category already exists
    const { data: existing } = await supabaseAdmin
      .from('gallery_categories')
      .select('id')
      .eq('name', name.trim())
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Category already exists' }, { status: 400 });
    }

    // Get max display_order
    const { data: maxOrder } = await supabaseAdmin
      .from('gallery_categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    // Create category
    const { data: newCategory, error: createError } = await supabaseAdmin
      .from('gallery_categories')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        display_order: newOrder
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating category:', createError);
      return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Category created successfully',
      category: newCategory
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
