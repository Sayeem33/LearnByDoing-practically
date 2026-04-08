import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockRequireAuth,
  mockGetProgress,
  mockMarkStepCompleted,
  mockTrackTutorialProgress,
  mockTrackLabProgress,
  mockAwardAchievement,
} = vi.hoisted(() => ({
  mockRequireAuth: vi.fn(),
  mockGetProgress: vi.fn(),
  mockMarkStepCompleted: vi.fn(),
  mockTrackTutorialProgress: vi.fn(),
  mockTrackLabProgress: vi.fn(),
  mockAwardAchievement: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock('@/lib/progressTracker', () => ({
  getProgress: mockGetProgress,
  markStepCompleted: mockMarkStepCompleted,
  trackTutorialProgress: mockTrackTutorialProgress,
  trackLabProgress: mockTrackLabProgress,
  awardAchievement: mockAwardAchievement,
}));

import { GET as progressGet, POST as progressPost } from '@/app/api/progress/route';

function createJsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/progress', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('progress route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      user: {
        id: 'user-1',
        role: 'student',
      },
    });
  });

  it('returns the authenticated user progress document', async () => {
    mockGetProgress.mockResolvedValue({
      userId: 'user-1',
      stats: { completedStepsCount: 3 },
    });

    const response = await progressGet(new NextRequest('http://localhost/api/progress'));

    expect(mockGetProgress).toHaveBeenCalledWith('user-1');
    expect(response.status).toBe(200);
  });

  it('records tutorial progress updates', async () => {
    mockTrackTutorialProgress.mockResolvedValue({ userId: 'user-1' });

    const response = await progressPost(
      createJsonRequest({
        action: 'tutorial_progress',
        tutorialId: 'freefall',
        experimentName: 'Free Fall',
        category: 'physics',
        totalChapters: 5,
        chapterNumber: 2,
      })
    );

    expect(mockTrackTutorialProgress).toHaveBeenCalledWith('user-1', {
      tutorialId: 'freefall',
      experimentName: 'Free Fall',
      category: 'physics',
      totalChapters: 5,
      chapterNumber: 2,
      completed: undefined,
    });
    expect(response.status).toBe(200);
  });

  it('records lab progress updates', async () => {
    mockTrackLabProgress.mockResolvedValue({ userId: 'user-1' });

    const response = await progressPost(
      createJsonRequest({
        action: 'lab_progress',
        experimentType: 'pendulum',
        experimentName: 'Simple Pendulum',
        category: 'physics',
        event: 'saved',
        status: 'draft',
        reportSaved: false,
      })
    );

    expect(mockTrackLabProgress).toHaveBeenCalledWith('user-1', {
      experimentType: 'pendulum',
      experimentName: 'Simple Pendulum',
      category: 'physics',
      savedExperimentId: undefined,
      event: 'saved',
      status: 'draft',
      reportSaved: false,
    });
    expect(response.status).toBe(200);
  });

  it('rejects unsupported actions', async () => {
    const response = await progressPost(
      createJsonRequest({
        action: 'unknown',
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Unsupported progress action',
    });
  });
});
