import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify user is admin
    await requireAdmin(request);

    const { experience } = await request.json();
    const { userId } = await params;

    // Validate experience level
    const validExperiences = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validExperiences.includes(experience)) {
      return NextResponse.json(
        { success: false, error: 'Invalid experience level' },
        { status: 400 }
      );
    }

    // Update user experience in database
    const { error } = await supabaseAdmin
      .from('users')
      .update({ experience_level: experience })
      .eq('id', userId);

    if (error) {
      console.error('Supabase error updating experience:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'User experience level updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating user experience:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update user experience' },
      { status: 500 }
    );
  }
}
