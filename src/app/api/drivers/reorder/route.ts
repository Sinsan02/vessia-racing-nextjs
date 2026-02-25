import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
    }

    const { driverId, direction } = await request.json();

    if (!driverId || !direction) {
      return NextResponse.json({ success: false, error: 'Driver ID and direction required' }, { status: 400 });
    }

    // Get current driver
    const { data: currentDriver, error: currentError } = await supabaseAdmin
      .from('users')
      .select('id, display_order')
      .eq('id', driverId)
      .eq('is_driver', 1)
      .single();

    if (currentError || !currentDriver) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    // Get all drivers
    const { data: allDrivers, error: allDriversError } = await supabaseAdmin
      .from('users')
      .select('id, display_order')
      .eq('is_driver', 1)
      .order('display_order', { ascending: true });

    if (allDriversError || !allDrivers) {
      return NextResponse.json({ success: false, error: 'Failed to fetch drivers' }, { status: 500 });
    }

    const currentIndex = allDrivers.findIndex(d => d.id === driverId);
    
    if (currentIndex === -1) {
      return NextResponse.json({ success: false, error: 'Driver not found in list' }, { status: 404 });
    }

    // Check if movement is possible
    if (direction === 'up' && currentIndex === 0) {
      return NextResponse.json({ success: false, error: 'Already at the top' }, { status: 400 });
    }
    
    if (direction === 'down' && currentIndex === allDrivers.length - 1) {
      return NextResponse.json({ success: false, error: 'Already at the bottom' }, { status: 400 });
    }

    // Swap display_order with adjacent driver
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapDriver = allDrivers[swapIndex];

    const tempOrder = currentDriver.display_order;
    
    // Update both drivers
    await supabaseAdmin
      .from('users')
      .update({ display_order: swapDriver.display_order })
      .eq('id', currentDriver.id);

    await supabaseAdmin
      .from('users')
      .update({ display_order: tempOrder })
      .eq('id', swapDriver.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Driver order updated successfully'
    });

  } catch (error) {
    console.error('Error updating driver order:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update order: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
