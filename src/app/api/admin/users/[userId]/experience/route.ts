import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { userId } = await params;
    const { experience } = await request.json();

    if (!experience || typeof experience !== 'string') {
      return NextResponse.json({ success: false, error: 'Experience is required' }, { status: 400 });
    }

    // Update user experience
    const { error } = await supabaseAdmin
      .from('users')
      .update({ experience })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user experience:', error);
      return NextResponse.json({ success: false, error: 'Failed to update experience' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Experience updated to "${experience}" successfully!` 
    });
  } catch (error) {
    console.error('Error updating user experience:', error);
    return NextResponse.json({ success: false, error: 'Failed to update experience' }, { status: 500 });
  }
}