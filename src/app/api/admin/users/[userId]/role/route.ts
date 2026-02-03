import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { requireAdmin } from '@/lib/auth';

// Update user role (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 401 });
    }

    const { role } = await request.json();
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.userId);

    // Validate role
    if (!['member', 'admin'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    // Prevent admin from demoting themselves
    if (userId === authResult.user.userId && role !== 'admin') {
      return NextResponse.json({ success: false, error: 'You cannot remove your own admin access' }, { status: 400 });
    }

    const supabase = await getDatabase();
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);
    
    if (error) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ success: false, error: 'Failed to update user role' }, { status: 500 });
  }
}