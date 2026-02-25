import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { iRacingService } from '@/lib/iracing';

/**
 * Test endpoint for admin to verify iRacing API credentials
 * GET /api/test-iracing
 */
export async function GET(request: NextRequest) {
  try {
    // Only admins can test
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    console.log('🧪 Testing iRacing API credentials...');

    // Check if credentials are configured
    const hasEmail = !!process.env.IRACING_EMAIL;
    const hasPassword = !!process.env.IRACING_PASSWORD;
    
    console.log('Environment check:', {
      IRACING_EMAIL: hasEmail,
      IRACING_PASSWORD: hasPassword,
      emailLength: process.env.IRACING_EMAIL?.length || 0,
      passwordLength: process.env.IRACING_PASSWORD?.length || 0
    });

    if (!hasEmail || !hasPassword) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables not configured',
        details: {
          IRACING_EMAIL: hasEmail ? '✅ Set' : '❌ Missing',
          IRACING_PASSWORD: hasPassword ? '✅ Set' : '❌ Missing',
        }
      }, { status: 500 });
    }

    // Try to fetch stats for a known driver (Lewis Hamilton - Customer ID: 1)
    // This is a public test to verify authentication works
    const testCustomerId = '1'; // iRacing founder account
    console.log('🔍 Testing with Customer ID:', testCustomerId);

    const stats = await iRacingService.getDriverStats(testCustomerId);

    if (!stats) {
      return NextResponse.json({
        success: false,
        error: 'Authentication or API request failed',
        details: 'Check Vercel Function Logs for detailed error messages',
        hint: 'Look for messages starting with 🔄, ✅, or ❌'
      }, { status: 500 });
    }

    console.log('✅ iRacing API test successful!');

    return NextResponse.json({
      success: true,
      message: 'iRacing API credentials are working!',
      testResult: {
        customerId: testCustomerId,
        stats: stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error.message || 'Unknown error',
      details: 'Check Vercel Function Logs for stack trace'
    }, { status: 500 });
  }
}
