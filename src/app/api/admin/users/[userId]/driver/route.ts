import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbQuery } from '@/lib/database';
import { requireAdmin } from '@/lib/auth';

// Update driver status (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await requireAdmin(request);
    const { isDriver } = await request.json();
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.userId);

    // Get user info
    const targetUser = await dbQuery('SELECT full_name, gamertag, bio, profile_picture FROM users WHERE id = $1', [userId]);
    if (!targetUser || targetUser.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const userInfo = targetUser[0];
    const displayName = userInfo.gamertag || userInfo.full_name;

    // Update driver status
    const result = await dbRun('UPDATE users SET is_driver = $1 WHERE id = $2', [isDriver ? 1 : 0, userId]);
    
    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Failed to update driver status' }, { status: 500 });
    }

    // If making user a driver, set default bio if empty
    if (isDriver) {
      if (!userInfo.bio) {
        const defaultBio = `Professional racing driver for Vessia Racing Team. Competing at the highest level with passion and determination.`;
        await dbRun('UPDATE users SET bio = $1 WHERE id = $2', [defaultBio, userId]);
      }
      
      if (!userInfo.profile_picture) {
        // Set a default driver avatar
        const defaultAvatar = '/uploads/default-avatar.png';
        await dbRun('UPDATE users SET profile_picture = $1 WHERE id = $2', [defaultAvatar, userId]);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${displayName} ${isDriver ? 'promoted to driver' : 'removed from driver role'}`
    });
  } catch (error: any) {
    console.error('Error updating driver status:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ success: false, error: 'Failed to update driver status' }, { status: 500 });
  }
}