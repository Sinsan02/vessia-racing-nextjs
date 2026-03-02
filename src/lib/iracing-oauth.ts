/**
 * iRacing OAuth token management
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TokenRefreshResult {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
}

/**
 * Refresh an expired iRacing OAuth token
 * @param userId User ID to refresh token for
 * @returns New access token and expiration, or null if refresh failed
 */
export async function refreshIRacingToken(userId: string): Promise<TokenRefreshResult | null> {
  try {
    // Get user's current refresh token
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('iracing_refresh_token')
      .eq('id', userId)
      .single();

    if (fetchError || !user?.iracing_refresh_token) {
      console.error(`❌ No refresh token found for user ${userId}`);
      return null;
    }

    const refreshToken = user.iracing_refresh_token;

    // Exchange refresh token for new access token
    console.log(`🔄 Refreshing iRacing token for user ${userId}...`);
    
    const clientId = process.env.IRACING_CLIENT_ID!;
    const clientSecret = process.env.IRACING_CLIENT_SECRET!;
    
    // iRacing requires Basic Authentication
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenResponse = await fetch('https://oauth.iracing.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        audience: 'data-server', // Required for data API access
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`❌ Token refresh failed for user ${userId}:`, errorText);
      return null;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const newRefreshToken = tokenData.refresh_token || refreshToken; // Use old if not provided
    const expiresIn = tokenData.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    if (!accessToken) {
      console.error(`❌ No access token in refresh response for user ${userId}`);
      return null;
    }

    // Update database with new tokens
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        iracing_access_token: accessToken,
        iracing_refresh_token: newRefreshToken,
        iracing_token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error(`❌ Failed to update tokens in database for user ${userId}:`, updateError);
      return null;
    }

    console.log(`✅ Token refreshed successfully for user ${userId}, expires at ${expiresAt.toISOString()}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt
    };

  } catch (error) {
    console.error(`❌ Error refreshing token for user ${userId}:`, error);
    return null;
  }
}

/**
 * Get a valid access token for a user, refreshing if necessary
 * @param userId User ID to get token for
 * @returns Valid access token or null if unavailable
 */
export async function getValidIRacingToken(userId: string): Promise<string | null> {
  try {
    // Fetch user's token data
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('iracing_access_token, iracing_token_expires_at')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      console.error(`❌ Failed to fetch user ${userId}:`, fetchError);
      return null;
    }

    if (!user.iracing_access_token) {
      console.log(`⚠️ User ${userId} has no iRacing access token`);
      return null;
    }

    // Check if token is still valid (with 5 minute buffer)
    const expiresAt = new Date(user.iracing_token_expires_at);
    const now = new Date();
    const bufferMs = 5 * 60 * 1000; // 5 minutes

    if (now.getTime() + bufferMs < expiresAt.getTime()) {
      // Token is still valid
      console.log(`✅ Token still valid for user ${userId}, expires at ${expiresAt.toISOString()}`);
      return user.iracing_access_token;
    }

    // Token expired or expiring soon, refresh it
    console.log(`⚠️ Token expired/expiring for user ${userId}, refreshing...`);
    const refreshResult = await refreshIRacingToken(userId);
    
    if (!refreshResult) {
      console.error(`❌ Failed to refresh token for user ${userId}`);
      return null;
    }

    return refreshResult.accessToken;

  } catch (error) {
    console.error(`❌ Error getting valid token for user ${userId}:`, error);
    return null;
  }
}
