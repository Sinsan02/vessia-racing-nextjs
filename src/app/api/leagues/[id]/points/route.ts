import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Get league points standings (registered drivers and guest drivers)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const { data: points, error } = await supabaseAdmin
      .from('driver_points')
      .select(`
        id,
        driver_id,
        guest_name,
        division_id,
        points,
        races_completed,
        users(
          id,
          full_name,
          profile_picture,
          is_driver
        )
      `)
      .eq('league_id', id);

    if (error) {
      console.error('Error fetching league points:', error);
      throw error;
    }

    // Transform data to match expected format
    const transformedPoints = (points || [])
      .filter((p: any) => p.guest_name || p.users?.is_driver === 1)
      .map((p: any) => ({
        id: p.driver_id ?? null,
        entry_id: p.id,
        is_guest: !p.driver_id,
        division_id: p.division_id ?? null,
        full_name: p.guest_name || p.users.full_name,
        profile_picture: p.guest_name ? null : p.users.profile_picture,
        points: p.points,
        races_completed: p.races_completed
      }))
      .sort((a, b) =>
        b.points - a.points ||
        a.races_completed - b.races_completed ||
        (a.full_name || '').localeCompare(b.full_name || '')
      );
    
    return NextResponse.json({ success: true, points: transformedPoints });
  } catch (error) {
    console.error('Error fetching league points:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch points' }, { status: 500 });
  }
}
