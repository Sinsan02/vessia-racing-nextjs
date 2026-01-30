import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Get league points standings
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const { data: points, error } = await supabaseAdmin
      .from('driver_points')
      .select(`
        driver_id,
        points,
        races_completed,
        users!inner(
          id,
          full_name,
          profile_picture,
          is_driver
        )
      `)
      .eq('league_id', id)
      .eq('users.is_driver', 1)
      .order('points', { ascending: false })
      .order('races_completed', { ascending: true })
      .order('users(full_name)', { ascending: true });

    if (error) {
      console.error('Error fetching league points:', error);
      throw error;
    }

    // Transform data to match expected format
    const transformedPoints = points?.map(p => ({
      id: p.driver_id,
      full_name: p.users.full_name,
      profile_picture: p.users.profile_picture,
      points: p.points,
      races_completed: p.races_completed
    })) || [];
    
    return NextResponse.json({ success: true, points: transformedPoints });
  } catch (error) {
    console.error('Error fetching league points:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch points' }, { status: 500 });
  }
}