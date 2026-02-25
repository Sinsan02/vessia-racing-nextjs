import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    const id = params.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Image ID is required' }, { status: 400 });
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('gallery')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting image:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete image' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
