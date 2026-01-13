import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Experiment from '@/models/Experiment';

/**
 * GET /api/experiments
 * Get all experiments for a user
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = { userId };
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
      { error: 'Failed to fetch experiments', details: error.message },
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
    await dbConnect();

    const body = await request.json();
    const { userId, title, description, category, experimentType, state } = body;

    // Validation
    if (!userId || !title || !category || !experimentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create experiment
    const experiment = await Experiment.create({
      userId,
      title,
      description: description || '',
      category,
      experimentType,
      state: state || {},
      status: 'draft',
    });

    return NextResponse.json(
      { success: true, data: experiment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/experiments error:', error);
    return NextResponse.json(
      { error: 'Failed to create experiment', details: error.message },
      { status: 500 }
    );
  }
}