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

    const memberData = await memberInfoResponse.json();
    
    if (!memberData || !memberData.members || memberData.members.length === 0) {
      console.error(`❌ No member data found for customer ID: ${driver.iracing_customer_id}`);
      return NextResponse.json(
        { error: 'No iRacing data found for your account' },
        { status: 404 }
      );
    }

    const member = memberData.members[0];
    console.log(`✅ Member data retrieved: ${member.display_name || 'Unknown'}`);

    // Fetch career stats for license info
    const careerResponse = await fetch(
      `https://members-ng.iracing.com/data/stats/member_career?cust_id=${driver.iracing_customer_id}`,
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
      const careerData = await careerResponse.json();
      
      if (careerData && careerData.stats && careerData.stats.length > 0) {
        const roadStats = careerData.stats.find((s: any) => s.category === 'Road') || careerData.stats[0];
        
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

    const stats = {
      irating: member.irating || 0,
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
