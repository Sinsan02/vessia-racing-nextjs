import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Handle iRacing OAuth callback
 * Exchanges authorization code for access token
 */
export async function GET(request: NextRequest) {
  console.log('🎯 ====== CALLBACK ENDPOINT CALLED ======');
  console.log('   Request URL:', request.url);
  console.log('   Request method:', request.method);
  
  try {
    const searchParams = request.nextUrl.searchParams;
    console.log('   All search params:', Array.from(searchParams.entries()));
    
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('   Code:', code ? 'Present (length=' + code.length + ')' : 'Missing');
    console.log('   State:', state ? 'Present' : 'Missing');
    console.log('   Error:', error || 'None');

    // Check for authorization errors
    if (error) {
      console.error('❌ iRacing authorization error:', error);
      const errorDescription = searchParams.get('error_description');
      const errorUri = searchParams.get('error_uri');
      console.error('   Error description:', errorDescription);
      console.error('   Error URI:', errorUri);
      return NextResponse.redirect(
        new URL(`/profile?error=iracing_auth_failed&message=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/profile?error=iracing_auth_failed&message=no_code', request.url)
      );
    }

    // Verify state parameter for CSRF protection
    const storedState = request.cookies.get('iracing_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      console.error('❌ State mismatch - possible CSRF attack');
      return NextResponse.redirect(
        new URL('/profile?error=state_mismatch', request.url)
      );
    }

    // Get PKCE code_verifier from cookie
    const codeVerifier = request.cookies.get('iracing_code_verifier')?.value;
    if (!codeVerifier) {
      console.error('❌ No code_verifier found in cookies');
      return NextResponse.redirect(
        new URL('/profile?error=pkce_missing', request.url)
      );
    }

    const clientId = process.env.IRACING_CLIENT_ID;
    const clientSecret = process.env.IRACING_CLIENT_SECRET;
    const redirectUri = process.env.IRACING_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('iRacing OAuth credentials not configured');
      return NextResponse.redirect(
        new URL('/profile?error=iracing_config_error', request.url)
      );
    }

    // Exchange authorization code for access token
    // Documentation: https://oauth.iracing.com/oauth2/book/token_endpoint.html
    console.log('🔄 Exchanging authorization code for access token with PKCE...');
    console.log('   Client ID:', clientId);
    console.log('   Client Secret (first 10 chars):', clientSecret?.substring(0, 10));
    console.log('   Code verifier length:', codeVerifier?.length);
    
    // Try sending credentials in body with proper encoding
    const tokenBody = new URLSearchParams();
    tokenBody.append('grant_type', 'authorization_code');
    tokenBody.append('code', code);
    tokenBody.append('redirect_uri', redirectUri);
    tokenBody.append('client_id', clientId);
    tokenBody.append('client_secret', clientSecret);
    tokenBody.append('code_verifier', codeVerifier);
    
    console.log('   Token request body (URL encoded):', tokenBody.toString());
    
    const tokenResponse = await fetch('https://oauth.iracing.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', tokenResponse.status, errorText);
      return NextResponse.redirect(
        new URL('/profile?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 3600; // Default 1 hour
    
    if (!accessToken) {
      console.error('❌ No access token in response:', tokenData);
      return NextResponse.redirect(
        new URL('/profile?error=no_access_token', request.url)
      );
    }
    
    if (!refreshToken) {
      console.error('⚠️ Warning: No refresh token received. Automatic updates may not work.');
    }

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    console.log('✅ Token exchange successful');

    // Fetch user info from iRacing
    console.log('🔄 Fetching user info from iRacing...');
    const userInfoResponse = await fetch('https://oauth.iracing.com/oauth2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch user info');
      return NextResponse.redirect(
        new URL('/profile?error=userinfo_failed', request.url)
      );
    }

    const userInfo = await userInfoResponse.json();
    const iracingCustomerId = userInfo.sub || userInfo.cust_id;

    if (!iracingCustomerId) {
      console.error('No customer ID in user info');
      return NextResponse.redirect(
        new URL('/profile?error=no_customer_id', request.url)
      );
    }

    // Get current user from session
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=not_authenticated', request.url)
      );
    }

    // Verify token and get user
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_session', request.url)
      );
    }

    // Update user's iRacing data with OAuth tokens
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        iracing_customer_id: iracingCustomerId,
        iracing_access_token: accessToken,
        iracing_refresh_token: refreshToken,
        iracing_token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update iRacing data:', updateError);
      return NextResponse.redirect(
        new URL('/profile?error=update_failed', request.url)
      );
    }

    console.log(`✅ Successfully connected iRacing account for user ${user.id}`);
    console.log(`   Customer ID: ${iracingCustomerId}`);
    console.log(`   Token expires at: ${expiresAt.toISOString()}`);

    // Success! Clear cookies and redirect to profile
    const response = NextResponse.redirect(
      new URL('/profile?success=iracing_connected', request.url)
    );
    
    // Clear OAuth cookies
    response.cookies.delete('iracing_oauth_state');
    response.cookies.delete('iracing_code_verifier');
    
    return response;

  } catch (error) {
    console.error('Error in iRacing callback:', error);
    return NextResponse.redirect(
      new URL('/profile?error=callback_error', request.url)
    );
  }
}
