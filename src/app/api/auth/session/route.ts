import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return unauthorizedResponse();
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: session.user,
          expiresAt: session.expiresAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/auth/session error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
