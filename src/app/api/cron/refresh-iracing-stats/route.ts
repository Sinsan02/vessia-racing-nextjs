import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { iRacingService } from '@/lib/iracing';

/**
 * Cron job endpoint to refresh iRacing stats for all drivers
 * 
 * This endpoint should be called by Vercel Cron Jobs or manually by admins
 * Set up in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/refresh-iracing-stats",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (cron secret or admin)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Check if it's a cron job (with secret) or admin request
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // If CRON_SECRET is set but doesn't match, reject
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all users with iRacing Customer IDs
    const { data: drivers, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, iracing_customer_id')
      .not('iracing_customer_id', 'is', null)
      .neq('iracing_customer_id', '');

    if (error) {
      console.error('Error fetching drivers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch drivers' },
        { status: 500 }
      );
    }

    if (!drivers || drivers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No drivers with iRacing IDs found',
        updated: 0
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each driver
    for (const driver of drivers) {
      try {
        console.log(`Fetching stats for ${driver.full_name} (${driver.iracing_customer_id})...`);
        
        const stats = await iRacingService.getDriverStats(driver.iracing_customer_id);
        
        if (stats) {
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
            .eq('id', driver.id);

          if (updateError) {
            console.error(`Failed to update ${driver.full_name}:`, updateError);
            errorCount++;
            errors.push(`${driver.full_name}: Update failed`);
          } else {
            console.log(`✓ Updated ${driver.full_name}`);
            successCount++;
          }
        } else {
          console.warn(`No stats returned for ${driver.full_name}`);
          errorCount++;
          errors.push(`${driver.full_name}: No stats available`);
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err: any) {
        console.error(`Error processing ${driver.full_name}:`, err);
        errorCount++;
        errors.push(`${driver.full_name}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Stats refresh completed`,
      total: drivers.length,
      updated: successCount,
      failed: errorCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
