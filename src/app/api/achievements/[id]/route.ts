import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { title, description, race_name, track_name, achievement_date, position, category, icon } = body;
    const { id: achievementId } = await params;

    const supabase = supabaseAdmin;

    const { data: achievement, error } = await supabase
      .from('achievements')
      .update({
        title,
        description,
        race_name,
        track_name,
        achievement_date,
        position,
        category,
        icon,
        updated_at: new Date().toISOString()
      })
      .eq('id', achievementId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update achievement' 
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: achievementId } = await params;
    const supabase = supabaseAdmin;

    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', achievementId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete achievement' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}