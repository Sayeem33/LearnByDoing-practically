import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Experiment from '@/models/Experiment';
import mongoose from 'mongoose';
import { experimentAccessFilter, RBAC_POLICY, requireRoles } from '@/lib/rbac';

/**
 * GET /api/experiments/[id]
 * Get a specific experiment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.experiments.read);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid experiment ID' },
        { status: 400 }
      );
    }

    const experiment = await Experiment.findOne(
      experimentAccessFilter(auth.user, params.id)
    );

    if (!experiment) {
      return NextResponse.json(
        { success: false, error: 'Experiment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: experiment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/experiments/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/experiments/[id]
 * Update an experiment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.experiments.update);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid experiment ID' },
        { status: 400 }
      );
    }

    const experiment = await Experiment.findOne(experimentAccessFilter(auth.user, params.id));

    if (!experiment) {
      return NextResponse.json(
        { success: false, error: 'Experiment not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { state, labReport, status, title, description } = body;

    if (status && !['draft', 'completed', 'submitted'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid experiment status' },
        { status: 400 }
      );
    }

    if (state !== undefined) experiment.state = state;
    if (labReport !== undefined) experiment.labReport = String(labReport);
    if (status) experiment.status = status;
    if (title) experiment.title = title;
    if (description !== undefined) experiment.description = description;

    if (experiment.status === 'submitted' && !experiment.labReport?.trim()) {
      return NextResponse.json(
        { success: false, error: 'A lab report is required before submission' },
        { status: 400 }
      );
    }

    await experiment.save();

    return NextResponse.json(
      { success: true, data: experiment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/experiments/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update experiment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/experiments/[id]
 * Delete an experiment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.experiments.delete);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid experiment ID' },
        { status: 400 }
      );
    }

    const experiment = await Experiment.findOneAndDelete(
      experimentAccessFilter(auth.user, params.id)
    );

    if (!experiment) {
      return NextResponse.json(
        { success: false, error: 'Experiment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Experiment deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/experiments/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete experiment' },
      { status: 500 }
    );
  }
}
