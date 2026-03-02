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
    irating?: number;
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

    // Fetch member info - returns a link to S3 data
    const memberInfoResponse = await fetch(
      `https://members-ng.iracing.com/data/member/info?cust_ids=${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!memberInfoResponse.ok) {
      console.error(`❌ Failed to fetch member info: ${memberInfoResponse.status}`);
      return null;
    }

    const memberInfoData = await memberInfoResponse.json();
    
    // iRacing returns a link to the actual data hosted on S3
    if (!memberInfoData.link) {
      console.error(`❌ No data link in member info response for customer ID: ${customerId}`);
      return null;
    }

    console.log(`🔗 Fetching member data from S3...`);
    const memberDataResponse = await fetch(memberInfoData.link);
    
    if (!memberDataResponse.ok) {
      console.error(`❌ Failed to fetch member data from S3: ${memberDataResponse.status}`);
      return null;
    }

    const s3Data = await memberDataResponse.json();
    console.log('📊 S3 data structure:', JSON.stringify(s3Data).substring(0, 300));
    
    // S3 data might have different formats
    let member;
    if (s3Data.members && Array.isArray(s3Data.members) && s3Data.members.length > 0) {
      // Format 1: { members: [...] }
      member = s3Data.members[0];
    } else if (Array.isArray(s3Data) && s3Data.length > 0) {
      // Format 2: Direct array
      member = s3Data[0];
    } else if (s3Data.cust_id || s3Data.display_name) {
      // Format 3: Direct member object
      member = s3Data;
    } else {
      console.error(`❌ Unexpected S3 data format for customer ID: ${customerId}`);
      console.error('S3 data:', JSON.stringify(s3Data));
      return null;
    }

    console.log(`✅ Member: ${member.display_name || 'Unknown'}`);

    // Fetch career stats - also returns a link to S3 data
    const careerInfoResponse = await fetch(
      `https://members-ng.iracing.com/data/stats/member_career?cust_id=${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    // Process stats for all categories
    const categoryStats: any = {};

    if (careerInfoResponse.ok) {
      const careerInfoData = await careerInfoResponse.json();
      console.log('📦 Career info response:', JSON.stringify(careerInfoData).substring(0, 200));
      
      // Career stats also return a link to S3 data
      if (careerInfoData.link) {
        console.log(`🔗 Fetching career data from S3...`);
        const careerDataResponse = await fetch(careerInfoData.link);
        
        if (!careerDataResponse.ok) {
          console.warn(`⚠️ Failed to fetch career data from S3: ${careerDataResponse.status}`);
        } else {
          const careerData: IRacingCareerStats = await careerDataResponse.json();
          console.log('📊 Full career data:', JSON.stringify(careerData));
          
          if (careerData.stats && careerData.stats.length > 0) {
            // Process each category
            careerData.stats.forEach((categoryData) => {
              const category = categoryData.category;
              const licenseClasses = ['Rookie', 'D', 'C', 'B', 'A', 'Pro', 'Pro/WC'];
              
              // Get license info from category data
              const licenseLevel = categoryData.license_level || 1;
              const licenseClass = licenseClasses[Math.min(licenseLevel, licenseClasses.length - 1)] || 'Rookie';
              
              // iRating and safety rating are at the category level in career stats
              const irating = categoryData.irating || 0;
              const safetyRating = categoryData.safety_rating ? categoryData.safety_rating : 0;
              
              categoryStats[category] = {
                irating: irating,
                safety_rating: safetyRating > 0 ? `${licenseClass} ${safetyRating.toFixed(2)}` : 'N/A',
                license_class: licenseClass,
                license_level: licenseLevel
              };
              
              console.log(`📊 ${category}: iRating=${irating}, SR=${safetyRating}, License=${licenseClass}`);
            });
            
            console.log('✅ Processed stats for categories:', Object.keys(categoryStats).join(', '));
          } else {
            console.warn('⚠️ No stats found in career data');
          }
        }
      } else {
        console.warn('⚠️ No link in career info response');
      }
    } else {
      console.warn(`⚠️ Failed to fetch career info: ${careerInfoResponse.status}`);
    }

    return {
      categories: categoryStats
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
