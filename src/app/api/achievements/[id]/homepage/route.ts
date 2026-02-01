import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: achievementId } = await params;
    const { show_on_homepage } = await request.json();

    // If setting to true, first check if we already have 3 homepage achievements
    if (show_on_homepage) {
      const { data: currentHomepageAchievements, error: countError } = await supabaseAdmin
        .from('achievements')
        .select('id')
        .eq('show_on_homepage', true);

      if (countError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to check current homepage achievements' 
        }, { status: 500 });
      }

      if (currentHomepageAchievements && currentHomepageAchievements.length >= 3) {
        return NextResponse.json({ 
          success: false, 
          error: 'Maximum 3 achievements can be shown on homepage. Please disable one first.' 
        }, { status: 400 });
      }
    }

    const { data: achievement, error } = await supabaseAdmin
      .from('achievements')
      .update({
        show_on_homepage,
        updated_at: new Date().toISOString()
      })
      .eq('id', achievementId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update homepage status' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      achievement 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}