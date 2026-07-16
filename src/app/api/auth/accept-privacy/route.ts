import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const privacyAcceptedAt = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('users')
      .update({ privacy_accepted_at: privacyAcceptedAt })
      .eq('id', userPayload.userId);

    if (error) {
      console.error('Failed to record privacy consent:', error);
      return NextResponse.json(
        { error: 'Failed to record consent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ privacy_accepted_at: privacyAcceptedAt });
  } catch (error) {
    console.error('Accept privacy policy error:', error);
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    );
  }
}
