import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Experiment from '@/models/Experiment';
import User from '@/models/User';
import { RBAC_POLICY, requireRoles } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.reviews.list);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const reviewStatus = searchParams.get('reviewStatus');
    const category = searchParams.get('category');

    const query: Record<string, any> = {
      status: 'submitted',
    };

    if (reviewStatus && reviewStatus !== 'all') {
      query['review.status'] = reviewStatus;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const experiments = await Experiment.find(query)
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    const userIds = Array.from(
      new Set(experiments.map((experiment) => String(experiment.userId)).filter(Boolean))
    );

    const users = await User.find({ _id: { $in: userIds } })
      .select('_id name email role')
      .lean();

    const userMap = new Map(
      users.map((user) => [
        String(user._id),
        {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      ])
    );

    const enrichedExperiments = experiments.map((experiment) => ({
      ...experiment,
      student: userMap.get(String(experiment.userId)) || null,
    }));

    return NextResponse.json({ success: true, data: enrichedExperiments }, { status: 200 });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submitted experiments for review' },
      { status: 500 }
    );
  }
}
