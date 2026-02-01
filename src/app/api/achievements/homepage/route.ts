import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = supabaseAdmin;
    
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('show_on_homepage', true)
      .order('achievement_date', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch homepage achievements' 
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