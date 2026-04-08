import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Experiment from '@/models/Experiment';
import { RBAC_POLICY, requireRoles } from '@/lib/rbac';

const ALLOWED_REVIEW_STATUSES = ['pending_review', 'approved', 'changes_requested'] as const;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.reviews.update);
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

    const experiment = await Experiment.findById(params.id);
    if (!experiment) {
      return NextResponse.json(
        { success: false, error: 'Experiment not found' },
        { status: 404 }
      );
    }

    if (experiment.status !== 'submitted') {
      return NextResponse.json(
        { success: false, error: 'Only submitted experiments can be reviewed' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const reviewStatus = body.reviewStatus;
    const feedback = typeof body.feedback === 'string' ? body.feedback.trim() : '';

    if (!ALLOWED_REVIEW_STATUSES.includes(reviewStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid review status' },
        { status: 400 }
      );
    }

    const reviewerRole = auth.user.role === 'admin' ? 'admin' : 'teacher';

    experiment.review = {
      status: reviewStatus,
      feedback,
      reviewedBy: auth.user.name || auth.user.email,
      reviewerRole,
      reviewedAt: new Date(),
    };

    await experiment.save();

    return NextResponse.json({ success: true, data: experiment }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/reviews/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
