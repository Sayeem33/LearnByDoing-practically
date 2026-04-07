import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Experiment from '@/models/Experiment';
import { experimentAccessFilter, RBAC_POLICY, requireRoles } from '@/lib/rbac';

/**
 * GET /api/experiments
 * Get all experiments for a user
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.experiments.list);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build query
    const query: any = experimentAccessFilter(auth.user);
    if (category) query.category = category;
    if (status) query.status = status;

    const experiments = await Experiment.find(query)
      .sort({ updatedAt: -1 })
      .limit(50);

    return NextResponse.json(
      { success: true, data: experiments },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/experiments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/experiments
 * Create a new experiment
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.experiments.create);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    const body = await request.json();
    const { title, description, category, experimentType, state, status, labReport } = body;

    // Validation
    if (!title || !category || !experimentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create experiment
    const normalizedStatus = ['draft', 'completed', 'submitted'].includes(status) ? status : 'draft';
    const normalizedReport = typeof labReport === 'string' ? labReport.trim() : '';

    if (normalizedStatus === 'submitted' && !normalizedReport) {
      return NextResponse.json(
        { success: false, error: 'A lab report is required before submission' },
        { status: 400 }
      );
    }

    const experiment = await Experiment.create({
      userId: auth.user.id,
      title,
      description: description || '',
      category,
      experimentType,
      state: state || {},
      status: normalizedStatus,
      labReport: normalizedReport,
    });

    return NextResponse.json(
      { success: true, data: experiment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/experiments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create experiment' },
      { status: 500 }
    );
  }
}
