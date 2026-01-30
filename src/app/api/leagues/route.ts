import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Get all leagues
export async function GET() {
  try {
    const { data: leagues, error } = await supabaseAdmin
      .from('leagues')
      .select('*')
      .eq('is_active', 1)
      .order('name');

    if (error) {
      console.error('Supabase error fetching leagues:', error);
      throw error;
    }
    
    return NextResponse.json({ success: true, leagues });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leagues' }, { status: 500 });
  }
}

// Create new league (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { name, description } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'League name is required' }, { status: 400 });
    }

    // Create league
    const { data: newLeague, error: createError } = await supabaseAdmin
      .from('leagues')
      .insert({
        name: name.trim(),
        description: description || ''
      })
      .select()
      .single();

    if (createError) {
      console.error('League creation error:', createError);
      if (createError.code === '23505') {
        return NextResponse.json({ success: false, error: 'League name already exists' }, { status: 400 });
      }
      throw createError;
    }

    const leagueId = newLeague.id;

    // Initialize points for all drivers in the new league
    const { data: drivers, error: driversError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('is_driver', 1);
      
    if (!driversError && drivers) {
      const driverPointsData = drivers.map(driver => ({
        driver_id: driver.id,
        league_id: leagueId,
        points: 0,
        races_completed: 0
      }));
      
      await supabaseAdmin
        .from('driver_points')
        .upsert(driverPointsData, { onConflict: 'driver_id,league_id' });
    }
    
    return NextResponse.json({ 
      success: true, 
      league: { id: leagueId, name: name.trim(), description: description || '' } 
    });
  } catch (error) {
    console.error('Error creating league:', error);
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return NextResponse.json({ success: false, error: 'League name already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create league' }, { status: 500 });
  }
}