import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getValidIRacingToken } from '@/lib/iracing-oauth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get authenticated user
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // User can only refresh their own stats (unless admin)
    const isOwnProfile = authUser.userId === parseInt(userId);
    const isAdmin = authUser.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get driver with OAuth tokens
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('users')
      .select('id, iracing_customer_id, iracing_access_token, iracing_refresh_token, iracing_token_expires_at')
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
        { error: 'iRacing not connected. Please connect your iRacing account first.' },
        { status: 400 }
      );
    }

    // Get valid OAuth access token (will refresh if needed)
    console.log(`🔍 Getting valid iRacing token for user ${userId}...`);
    const accessToken = await getValidIRacingToken(userId);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to get iRacing access token. Please reconnect your iRacing account.' },
        { status: 401 }
      );
    }

    console.log(`✅ Got valid access token for user ${userId}`);
    console.log(`🔍 Fetching stats for customer ID: ${driver.iracing_customer_id}`);

    // Fetch member info from iRacing Data API using OAuth token
    // Note: iRacing API returns a link to S3-hosted data, not direct data
    const memberInfoResponse = await fetch(
      `https://members-ng.iracing.com/data/member/info?cust_ids=${driver.iracing_customer_id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!memberInfoResponse.ok) {
      const errorText = await memberInfoResponse.text();
      console.error(`❌ Failed to fetch member info: ${memberInfoResponse.status}`, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch iRacing stats. Please try reconnecting your account.' },
        { status: 500 }
      );
    }

    const memberInfoData = await memberInfoResponse.json();
    console.log('📦 Member info response:', JSON.stringify(memberInfoData).substring(0, 200));
    
    // iRacing returns a link to the actual data hosted on S3
    if (!memberInfoData.link) {
      console.error(`❌ No data link in member info response for customer ID: ${driver.iracing_customer_id}`);
      return NextResponse.json(
        { error: 'Invalid response from iRacing API' },
        { status: 500 }
      );
    }

    console.log(`🔗 Fetching member data from S3 link...`);
    const memberDataResponse = await fetch(memberInfoData.link);
    
    if (!memberDataResponse.ok) {
      console.error(`❌ Failed to fetch member data from S3: ${memberDataResponse.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch member data from iRacing' },
        { status: 500 }
      );
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
      console.error(`❌ Unexpected S3 data format for customer ID: ${driver.iracing_customer_id}`);
      console.error('S3 data:', JSON.stringify(s3Data));
      return NextResponse.json(
        { error: 'Unexpected data format from iRacing API' },
        { status: 500 }
      );
    }

    console.log(`✅ Member data retrieved: ${member.display_name || 'Unknown'}`);

    // Fetch career stats for license info and iRating
    // This also returns a link to S3 data
    const careerInfoResponse = await fetch(
      `https://members-ng.iracing.com/data/stats/member_career?cust_id=${driver.iracing_customer_id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    let irating = 0;
    let safetyRating = 'N/A';
    let licenseClass = 'Rookie';
    let licenseLevel = 1;

    if (careerInfoResponse.ok) {
      const careerInfoData = await careerInfoResponse.json();
      console.log('📦 Career info response:', JSON.stringify(careerInfoData).substring(0, 200));
      
      // Career stats also return a link to S3 data
      if (careerInfoData.link) {
        console.log(`🔗 Fetching career data from S3 link...`);
        const careerDataResponse = await fetch(careerInfoData.link);
        
        if (!careerDataResponse.ok) {
          console.warn(`⚠️ Failed to fetch career data from S3: ${careerDataResponse.status}`);
        } else {
          const careerData = await careerDataResponse.json();
          console.log('📊 Career data structure:', JSON.stringify(careerData).substring(0, 500));
          
          if (careerData && careerData.stats && careerData.stats.length > 0) {
            const roadStats = careerData.stats.find((s: any) => s.category === 'Road') || careerData.stats[0];
            console.log('🏎️ Road stats:', JSON.stringify(roadStats).substring(0, 300));
            
            // Get iRating from road stats
            if (roadStats.irating !== undefined) {
              irating = roadStats.irating;
            }
            
            if (roadStats.license_level !== undefined) {
              licenseLevel = roadStats.license_level;
              const licenseClasses = ['Rookie', 'D', 'C', 'B', 'A', 'Pro', 'Pro/WC'];
              licenseClass = licenseClasses[Math.min(licenseLevel, licenseClasses.length - 1)] || 'Rookie';
            }

            if (roadStats.safety_rating !== undefined) {
              safetyRating = `${licenseClass} ${roadStats.safety_rating.toFixed(2)}`;
            }
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

    const stats = {
      irating: irating,
      safety_rating: safetyRating,
      license_class: licenseClass,
      license_level: licenseLevel,
    };

    console.log('✅ iRacing stats retrieved successfully:', stats);

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
