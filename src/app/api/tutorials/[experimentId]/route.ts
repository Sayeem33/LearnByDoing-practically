import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Tutorial from '@/models/Tutorial';
import { RBAC_POLICY, requireRoles } from '@/lib/rbac';

/**
 * GET /api/tutorials/[experimentId]
 * Get tutorial for a specific experiment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { experimentId: string } }
) {
  try {
    await dbConnect();

    const tutorial = await Tutorial.findOne({
      experimentId: params.experimentId,
    });

    if (!tutorial) {
      return NextResponse.json(
        { success: false, error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: tutorial },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/tutorials/[experimentId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tutorial' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tutorials/[experimentId]
 * Update tutorial content
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { experimentId: string } }
) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.tutorials.update);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    const body = await request.json();

    const tutorial = await Tutorial.findOneAndUpdate(
      { experimentId: params.experimentId },
      body,
      { new: true, runValidators: true }
    );

    if (!tutorial) {
      return NextResponse.json(
        { success: false, error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: tutorial },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/tutorials/[experimentId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tutorial' },
      { status: 500 }
    );
  }
}
