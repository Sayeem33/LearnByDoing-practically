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
        data: session.user,
        session: {
          expiresAt: session.expiresAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch authenticated user' },
      { status: 500 }
    );
  }
}
