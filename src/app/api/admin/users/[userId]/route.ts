import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Delete user (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await requireAdmin(request);
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.userId);

    // Prevent admin from deleting themselves
    if (userId === user.userId) {
      return NextResponse.json({ success: false, error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Get user info before deletion
    const { data: userToDelete, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('gamertag, full_name')
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
      throw deleteError;
    }
    
    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `User ${targetUser.gamertag} has been deleted successfully`
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