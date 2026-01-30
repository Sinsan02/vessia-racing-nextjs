import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Update driver status (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status || 401 });
    }
    const { isDriver } = await request.json();
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.userId);

    // Get user info
    const { data: userInfo, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('full_name, gamertag, bio, profile_picture')
      .eq('id', userId)
      .single();
      
    if (fetchError || !userInfo) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const displayName = userInfo.gamertag || userInfo.full_name;

    // Update driver status
    const updateData: any = { is_driver: isDriver ? 1 : 0 };
    
    // If making user a driver, set default bio if empty
    if (isDriver) {
      if (!userInfo.bio) {
        updateData.bio = `Professional racing driver for Vessia Racing Team. Competing at the highest level with passion and determination.`;
      }
      
      if (!userInfo.profile_picture) {
        updateData.profile_picture = '/uploads/default-avatar.png';
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId);
      
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update driver status' }, { status: 500 });
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