import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { name, description } = await request.json();
    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, error: 'Invalid category ID' }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    // Check if category exists
    const { data: existing } = await supabaseAdmin
      .from('gallery_categories')
      .select('id')
      .eq('id', categoryId)
      .single();

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Check if new name conflicts with another category
    const { data: nameConflict } = await supabaseAdmin
      .from('gallery_categories')
      .select('id')
      .eq('name', name.trim())
      .neq('id', categoryId)
      .single();

    if (nameConflict) {
      return NextResponse.json({ success: false, error: 'Category name already exists' }, { status: 400 });
    }

    // Update category
    const { data: updatedCategory, error: updateError } = await supabaseAdmin
      .from('gallery_categories')
      .update({
        name: name.trim(),
        description: description?.trim() || null
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating category:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const categoryId = parseInt(params.id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, error: 'Invalid category ID' }, { status: 400 });
    }

    // Check if category exists
    const { data: existing } = await supabaseAdmin
      .from('gallery_categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    // Check if there are images using this category
    const { data: imagesInCategory, error: countError } = await supabaseAdmin
      .from('gallery')
      .select('id')
      .eq('category', existing.name);

    if (countError) {
      console.error('Error checking images in category:', countError);
      return NextResponse.json({ success: false, error: 'Failed to check category usage' }, { status: 500 });
    }

    if (imagesInCategory && imagesInCategory.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot delete category with ${imagesInCategory.length} images. Please move or delete images first.` 
      }, { status: 400 });
    }

    // Delete category
    const { error: deleteError } = await supabaseAdmin
      .from('gallery_categories')
      .delete()
      .eq('id', categoryId);

    if (deleteError) {
      console.error('Error deleting category:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
