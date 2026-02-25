import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to check if environment variables are set
 * This does NOT require admin access
 */
export async function GET(request: NextRequest) {
  try {
    const hasEmail = !!process.env.IRACING_EMAIL;
    const hasPassword = !!process.env.IRACING_PASSWORD;
    const hasCronSecret = !!process.env.CRON_SECRET;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    return NextResponse.json({
      environment_variables: {
        IRACING_EMAIL: hasEmail ? `✅ Set (${process.env.IRACING_EMAIL?.length} chars)` : '❌ Missing',
        IRACING_PASSWORD: hasPassword ? `✅ Set (${process.env.IRACING_PASSWORD?.length} chars)` : '❌ Missing',
        CRON_SECRET: hasCronSecret ? `✅ Set (${process.env.CRON_SECRET?.length} chars)` : '❌ Missing',
        NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl ? '✅ Set' : '❌ Missing',
      },
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check environment',
      message: error.message
    }, { status: 500 });
  }
}
