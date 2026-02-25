import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { iRacingService } from '@/lib/iracing';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Only admins can refresh stats
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { userId } = await params;

    // Get driver with iracing_customer_id
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('users')
      .select('id, iracing_customer_id')
      .eq('id', userId)
      .single();

    if (driverError || !driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    if (!driver.iracing_customer_id) {
      return NextResponse.json(
        { error: 'Driver does not have an iRacing Customer ID configured' },
        { status: 400 }
      );
    }

    // Fetch stats from iRacing
    const stats = await iRacingService.getDriverStats(driver.iracing_customer_id);

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch iRacing stats. Check API credentials and customer ID.' },
        { status: 500 }
      );
    }

    // Update driver with new stats
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        iracing_data: {
          ...stats,
          last_updated: new Date().toISOString()
        },
        iracing_data_updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating driver stats:', updateError);
      return NextResponse.json(
        { error: 'Failed to save stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'iRacing stats updated successfully',
      stats
    });
  } catch (error) {
    console.error('Error refreshing iRacing stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
