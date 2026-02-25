import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { categoryId, direction } = await request.json();

    if (!categoryId || !direction || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get current category
    const { data: currentCategory, error: currentError } = await supabaseAdmin
      .from('gallery_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (currentError || !currentCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get all categories ordered by display_order
    const { data: allCategories, error: allError } = await supabaseAdmin
      .from('gallery_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (allError || !allCategories) {
      return NextResponse.json({ error: 'Could not fetch categories' }, { status: 500 });
    }

    const currentIndex = allCategories.findIndex(c => c.id === categoryId);
    
    if (currentIndex === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    let swapIndex: number;
    
    if (direction === 'up') {
      if (currentIndex === 0) {
        return NextResponse.json({ message: 'Already at top' }, { status: 200 });
      }
      swapIndex = currentIndex - 1;
    } else {
      if (currentIndex === allCategories.length - 1) {
        return NextResponse.json({ message: 'Already at bottom' }, { status: 200 });
      }
      swapIndex = currentIndex + 1;
    }

    const swapCategory = allCategories[swapIndex];

    // Swap display_order values
    const updates = [
      supabaseAdmin
        .from('gallery_categories')
        .update({ display_order: swapCategory.display_order })
        .eq('id', currentCategory.id),
      supabaseAdmin
        .from('gallery_categories')
        .update({ display_order: currentCategory.display_order })
        .eq('id', swapCategory.id)
    ];

    const results = await Promise.all(updates);
    
    if (results.some(r => r.error)) {
      return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Category reordered' });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
