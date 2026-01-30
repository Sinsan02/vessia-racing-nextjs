import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Delete user (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 401 });
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.userId);

    // Prevent admin from deleting themselves
    if (userId === authResult.user.userId) {
      return NextResponse.json({ success: false, error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Get user info before deletion
    const { data: userToDelete, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single();
      
    if (fetchError || !userToDelete) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Delete related records first (foreign key constraints)
    // Note: Supabase CASCADE will handle this automatically if configured
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `User ${userToDelete.full_name} has been deleted successfully`
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}