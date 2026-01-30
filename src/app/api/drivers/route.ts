import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: drivers, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, experience_level, created_at, bio, profile_picture')
      .eq('is_driver', 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching drivers:', error);
      throw error;
    }

    // Transform data to match expected format
    const transformedDrivers = drivers.map(driver => ({
      id: driver.id,
      name: driver.full_name,
      experience: driver.experience_level,
      created_at: driver.created_at,
      bio: driver.bio,
      profile_picture: driver.profile_picture
    }));

    return NextResponse.json({
      success: true,
      drivers: transformedDrivers || []
    });
  } catch (error) {
    console.error('Drivers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}