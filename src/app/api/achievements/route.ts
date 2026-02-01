import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = supabaseAdmin;
    
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .order('achievement_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch achievements' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      achievements: achievements || [] 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, race_name, track_name, achievement_date, position, category, icon } = body;

    if (!title || !race_name || !achievement_date) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title, race name, and achievement date are required' 
      }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const { data: achievement, error } = await supabase
      .from('achievements')
      .insert([
        {
          title,
          description,
          race_name,
          track_name,
          achievement_date,
          position: position || 1,
          category: category || 'Race Victory',
          icon: icon || '🏆',
          show_on_homepage: false, // Default to false, can be set later
          created_by: 1 // For now, hardcode as admin
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create achievement' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      achievement 
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}