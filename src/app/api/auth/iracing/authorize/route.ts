import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Generate PKCE code verifier and challenge
 */
function generatePKCE() {
  // Generate random code_verifier (43-128 characters)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  
  // Create code_challenge (SHA-256 hash of verifier, base64url encoded)
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}

/**
 * Start iRacing OAuth flow with PKCE
 * Redirects user to iRacing authorization page
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.IRACING_CLIENT_ID?.trim();
    const redirectUri = process.env.IRACING_REDIRECT_URI?.trim();

    console.log('🏁 Starting iRacing OAuth flow with PKCE...');
    console.log('   Client ID:', clientId);
    console.log('   Redirect URI:', redirectUri);

    if (!clientId || !redirectUri) {
      console.error('❌ iRacing OAuth environment variables not configured!');
      console.error('   Missing:', !clientId ? 'IRACING_CLIENT_ID' : '', !redirectUri ? 'IRACING_REDIRECT_URI' : '');
      return NextResponse.redirect(
        new URL('/profile?error=iracing_config_error', request.url)
      );
    }

    // Generate PKCE parameters
    const { codeVerifier, codeChallenge } = generatePKCE();
    console.log('   Generated PKCE code_challenge');

    // Use oauth.iracing.com as per official iRacing OAuth documentation
    // Documentation: https://oauth.iracing.com/oauth2/book/authorize_endpoint.html
    const authUrl = new URL('https://oauth.iracing.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('scope', 'iracing.profile'); // Request profile scope for user info
    
    // Generate and store state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    authUrl.searchParams.set('state', state);
    
    console.log('✅ Authorization URL:', authUrl.toString());
    console.log('   Full URL with params:');
    console.log('   - client_id:', clientId);
    console.log('   - redirect_uri:', redirectUri);
    console.log('   - response_type: code');
    console.log('   - code_challenge_method: S256');
    console.log('   - scope: iracing.profile');
    console.log('   - state:', state);
    
    // Store state and code_verifier in cookies for verification later
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('iracing_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });
    response.cookies.set('iracing_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('❌ Error starting iRacing OAuth:', error);
    return NextResponse.redirect(
      new URL('/profile?error=iracing_auth_failed', request.url)
    );
  }
}
