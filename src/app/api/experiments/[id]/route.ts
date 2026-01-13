import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Experiment from '@/models/Experiment';

/**
 * GET /api/experiments/[id]
 * Get a specific experiment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const experiment = await Experiment.findById(params.id).populate(
      'userId',
      'name email'
    );

    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
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
      { error: 'Failed to fetch experiment', details: error.message },
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
    await dbConnect();

    const body = await request.json();
    const { state, labReport, status, title, description } = body;

    const updateData: any = {};
    if (state) updateData.state = state;
    if (labReport !== undefined) updateData.labReport = labReport;
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const experiment = await Experiment.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: experiment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/experiments/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update experiment', details: error.message },
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
    await dbConnect();

    const experiment = await Experiment.findByIdAndDelete(params.id);

    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
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
      { error: 'Failed to delete experiment', details: error.message },
      { status: 500 }
    );
  }
}