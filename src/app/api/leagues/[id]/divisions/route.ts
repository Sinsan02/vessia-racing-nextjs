import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Create a new division in a league (admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const leagueId = parseInt(id);
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Division name is required' }, { status: 400 });
    }

    const { data: league } = await supabaseAdmin
      .from('leagues')
      .select('id')
      .eq('id', leagueId)
      .single();

    if (!league) {
      return NextResponse.json({ success: false, error: 'League not found' }, { status: 404 });
    }

    // Place the new division after the existing ones
    const { data: lastDivision } = await supabaseAdmin
      .from('league_divisions')
      .select('sort_order')
      .eq('league_id', leagueId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: division, error } = await supabaseAdmin
      .from('league_divisions')
      .insert({
        league_id: leagueId,
        name: name.trim(),
        sort_order: (lastDivision?.sort_order ?? -1) + 1
      })
      .select('id, league_id, name, sort_order')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'A division with this name already exists in the league' }, { status: 400 });
      }
      console.error('Error creating division:', error);
      throw error;
    }

    return NextResponse.json({ success: true, division });
  } catch (error) {
    console.error('Error creating division:', error);
    return NextResponse.json({ success: false, error: 'Failed to create division' }, { status: 500 });
  }
}
