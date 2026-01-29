import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbQuery } from '@/lib/database';
import { requireAdmin } from '@/lib/auth';

// Delete user (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = requireAdmin(request);
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.userId);

    // Prevent admin from deleting themselves
    if (userId === user.userId) {
      return NextResponse.json({ success: false, error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Get user info before deletion
    const userToDelete = await dbQuery('SELECT gamertag, full_name FROM users WHERE id = ?', [userId]);
    if (!userToDelete || userToDelete.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const targetUser = userToDelete[0];

    // Delete related records first (foreign key constraints)
    await dbRun('DELETE FROM sessions WHERE user_id = ?', [userId]);
    await dbRun('DELETE FROM racing_results WHERE user_id = ?', [userId]);
    await dbRun('DELETE FROM driver_points WHERE driver_id = ?', [userId]);
    await dbRun('DELETE FROM points_history WHERE driver_id = ?', [userId]);
    await dbRun('DELETE FROM instagram_tokens WHERE user_id = ?', [userId]);
    
    // Delete the user
    const result = await dbRun('DELETE FROM users WHERE id = ?', [userId]);
    
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