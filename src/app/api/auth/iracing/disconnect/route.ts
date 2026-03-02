import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Disconnect iRacing OAuth integration
 * Removes all iRacing data and tokens for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Remove all iRacing data from user
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        iracing_customer_id: null,
        iracing_access_token: null,
        iracing_refresh_token: null,
        iracing_token_expires_at: null,
        iracing_data: null,
        iracing_data_updated_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userPayload.userId);

    if (updateError) {
      console.error('Failed to disconnect iRacing:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect iRacing' },
        { status: 500 }
      );
    }

    console.log(`✅ iRacing disconnected for user ${userPayload.userId}`);
    
    return NextResponse.json({
      success: true,
      message: 'iRacing account disconnected successfully'
    });

  } catch (error) {
    console.error('Error disconnecting iRacing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
