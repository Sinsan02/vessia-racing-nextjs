import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Start iRacing OAuth flow
 * Redirects user to iRacing authorization page
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.IRACING_CLIENT_ID;
    const redirectUri = process.env.IRACING_REDIRECT_URI;

    console.log('🏁 Starting iRacing OAuth flow...');
    console.log('   Client ID:', clientId);
    console.log('   Redirect URI:', redirectUri);

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'iRacing OAuth not configured' },
        { status: 500 }
      );
    }

    // Use oauth.iracing.com as per official iRacing OAuth documentation
    // Documentation: https://oauth.iracing.com/oauth2/book/authorize_endpoint.html
    const authUrl = new URL('https://oauth.iracing.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid');
    authUrl.searchParams.set('audience', 'data-server'); // Required by iRacing for data access
    
    // Generate and store state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    authUrl.searchParams.set('state', state);
    
    console.log('✅ Authorization URL:', authUrl.toString());
    console.log('   Full URL with params:');
    console.log('   - client_id:', clientId);
    console.log('   - redirect_uri:', redirectUri);
    console.log('   - response_type: code');
    console.log('   - scope: openid');
    console.log('   - audience: data-server');
    console.log('   - state:', state);
    
    // Store state in cookie for verification later
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('iracing_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Error starting iRacing OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to start authorization' },
      { status: 500 }
    );
  }
}
