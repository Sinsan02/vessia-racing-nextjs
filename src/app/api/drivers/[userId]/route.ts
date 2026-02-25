import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const { data: driver, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, experience_level, bio, profile_picture, created_at, iracing_customer_id, iracing_data')
      .eq('id', userId)
      .eq('is_driver', 1)
      .single();

    if (error || !driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      driver
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
