import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to verify environment variables are loaded
 * Remove this in production!
 */
export async function GET() {
  const envCheck = {
    clientId: process.env.IRACING_CLIENT_ID ? '✅ Set' : '❌ Missing',
    clientSecret: process.env.IRACING_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    redirectUri: process.env.IRACING_REDIRECT_URI ? '✅ Set' : '❌ Missing',
    nodeEnv: process.env.NODE_ENV,
    // Show first 10 chars only for security
    clientIdValue: process.env.IRACING_CLIENT_ID?.substring(0, 10) || 'undefined',
    redirectUriValue: process.env.IRACING_REDIRECT_URI || 'undefined',
  };

  return NextResponse.json(envCheck);
}
