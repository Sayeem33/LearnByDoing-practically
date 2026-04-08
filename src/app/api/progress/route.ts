import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  awardAchievement,
  getProgress,
  markStepCompleted,
  trackLabProgress,
  trackTutorialProgress,
} from '@/lib/progressTracker';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('response' in auth) {
      return auth.response;
    }

    const progress = await getProgress(auth.user.id);

    return NextResponse.json(
      { success: true, data: progress },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/progress error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('response' in auth) {
      return auth.response;
    }

    const body = await request.json();
    const { action } = body || {};

    let progress;

    switch (action) {
      case 'complete_step':
        if (!body.experimentType || !body.step) {
          return NextResponse.json(
            { success: false, error: 'experimentType and step are required' },
            { status: 400 }
          );
        }
        progress = await markStepCompleted(auth.user.id, body.experimentType, body.step);
        break;

      case 'tutorial_progress':
        if (!body.tutorialId || !body.experimentName || !body.category || !body.totalChapters) {
          return NextResponse.json(
            { success: false, error: 'Missing tutorial progress fields' },
            { status: 400 }
          );
        }
        progress = await trackTutorialProgress(auth.user.id, {
          tutorialId: body.tutorialId,
          experimentName: body.experimentName,
          category: body.category,
          totalChapters: body.totalChapters,
          chapterNumber: body.chapterNumber,
          completed: body.completed,
        });
        break;

      case 'lab_progress':
        if (!body.experimentType || !body.experimentName || !body.category) {
          return NextResponse.json(
            { success: false, error: 'Missing lab progress fields' },
            { status: 400 }
          );
        }
        progress = await trackLabProgress(auth.user.id, {
          experimentType: body.experimentType,
          experimentName: body.experimentName,
          category: body.category,
          savedExperimentId: body.savedExperimentId,
          event: body.event,
          status: body.status,
          reportSaved: body.reportSaved,
        });
        break;

      case 'award_achievement':
        if (!body.achievementId) {
          return NextResponse.json(
            { success: false, error: 'achievementId is required' },
            { status: 400 }
          );
        }
        progress = await awardAchievement(auth.user.id, body.achievementId, {
          title: body.title,
          description: body.description,
          kind: body.kind,
          icon: body.icon,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported progress action' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { success: true, data: progress },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/progress error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
