import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getValidIRacingToken } from '@/lib/iracing-oauth';
import { getUserFromRequest } from '@/lib/auth';

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
 * 
 * Uses OAuth tokens for authentication with iRacing API
 */

interface IRacingMemberInfo {
  members?: Array<{
    cust_id: number;
    display_name: string;
    irating?: number;
  }>;
}

interface IRacingCareerStats {
  stats?: Array<{
    category: string;
    license_level?: number;
    safety_rating?: number;
  }>;
}

/**
 * Fetch driver stats from iRacing using OAuth token
 */
async function fetchDriverStats(accessToken: string, customerId: string): Promise<any> {
  try {
    console.log(`🔍 Fetching stats for customer ID: ${customerId}`);

    // Fetch member info
    const memberResponse = await fetch(
      `https://members-ng.iracing.com/data/member/info?cust_ids=${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!memberResponse.ok) {
      console.error(`❌ Failed to fetch member info: ${memberResponse.status}`);
      return null;
    }

    const memberData: IRacingMemberInfo = await memberResponse.json();
    
    if (!memberData.members || memberData.members.length === 0) {
      console.error(`❌ No member data found for customer ID: ${customerId}`);
      return null;
    }

    const member = memberData.members[0];

    // Fetch career stats
    const careerResponse = await fetch(
      `https://members-ng.iracing.com/data/stats/member_career?cust_id=${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    let safetyRating = 'N/A';
    let licenseClass = 'Rookie';
    let licenseLevel = 1;

    if (careerResponse.ok) {
      const careerData: IRacingCareerStats = await careerResponse.json();
      
      if (careerData.stats && careerData.stats.length > 0) {
        const roadStats = careerData.stats.find((s) => s.category === 'Road') || careerData.stats[0];
        
        if (roadStats.license_level !== undefined) {
          licenseLevel = roadStats.license_level;
          const licenseClasses = ['Rookie', 'D', 'C', 'B', 'A', 'Pro', 'Pro/WC'];
          licenseClass = licenseClasses[Math.min(licenseLevel, licenseClasses.length - 1)] || 'Rookie';
        }

        if (roadStats.safety_rating !== undefined) {
          safetyRating = `${licenseClass} ${roadStats.safety_rating.toFixed(2)}`;
        }
      }
    }

    return {
      irating: member.irating || 0,
      safety_rating: safetyRating,
      license_class: licenseClass,
      license_level: licenseLevel,
    };

  } catch (error) {
    console.error(`❌ Error fetching stats for ${customerId}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify the request is authorized (cron secret or admin user)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    let isAuthorized = false;
    
    // Check if it's a cron job with valid secret
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      isAuthorized = true;
    } else {
      // Check if it's an admin user request
      const userPayload = getUserFromRequest(request);
      if (userPayload) {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('role')
          .eq('id', userPayload.userId)
          .single();
        
        if (user && user.role === 'admin') {
          isAuthorized = true;
        }
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all users with iRacing refresh tokens (OAuth connected)
    const { data: drivers, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, iracing_customer_id, iracing_refresh_token')
      .not('iracing_customer_id', 'is', null)
      .not('iracing_refresh_token', 'is', null)
      .neq('iracing_customer_id', '')
      .neq('iracing_refresh_token', '');

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
        message: 'No drivers with iRacing OAuth connection found',
        updated: 0
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each driver
    for (const driver of drivers) {
      try {
        console.log(`Processing ${driver.full_name} (${driver.iracing_customer_id})...`);
        
        // Get a valid OAuth access token (will refresh if expired)
        const accessToken = await getValidIRacingToken(driver.id);
        
        if (!accessToken) {
          console.error(`❌ Failed to get valid token for ${driver.full_name}`);
          errorCount++;
          errors.push(`${driver.full_name}: Token unavailable or expired`);
          continue;
        }
        
        // Fetch stats using OAuth token
        const stats = await fetchDriverStats(accessToken, driver.iracing_customer_id);
        
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
            errors.push(`${driver.full_name}: Database update failed`);
          } else {
            console.log(`✅ Updated ${driver.full_name}`);
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
