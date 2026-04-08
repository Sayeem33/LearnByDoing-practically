import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockDbConnect,
  mockRequireRoles,
  mockExperimentFind,
  mockExperimentSort,
  mockExperimentLimit,
  mockExperimentLean,
  mockExperimentFindById,
  mockUserFind,
  mockUserSelect,
  mockUserLean,
} = vi.hoisted(() => {
  const experimentLean = vi.fn();
  const experimentLimit = vi.fn(() => ({ lean: experimentLean }));
  const experimentSort = vi.fn(() => ({ limit: experimentLimit }));
  const userLean = vi.fn();
  const userSelect = vi.fn(() => ({ lean: userLean }));

  return {
    mockDbConnect: vi.fn(),
    mockRequireRoles: vi.fn(),
    mockExperimentFind: vi.fn(() => ({ sort: experimentSort })),
    mockExperimentSort: experimentSort,
    mockExperimentLimit: experimentLimit,
    mockExperimentLean: experimentLean,
    mockExperimentFindById: vi.fn(),
    mockUserFind: vi.fn(() => ({ select: userSelect })),
    mockUserSelect: userSelect,
    mockUserLean: userLean,
  };
});

vi.mock('@/lib/dbConnect', () => ({
  default: mockDbConnect,
}));

vi.mock('@/lib/rbac', () => ({
  RBAC_POLICY: {
    reviews: {
      list: ['teacher', 'admin'],
      update: ['teacher', 'admin'],
    },
  },
  requireRoles: mockRequireRoles,
}));

vi.mock('@/models/Experiment', () => ({
  default: {
    find: mockExperimentFind,
    findById: mockExperimentFindById,
  },
}));

vi.mock('@/models/User', () => ({
  default: {
    find: mockUserFind,
  },
}));

import { GET as reviewsGet } from '@/app/api/reviews/route';
import { PUT as reviewPut } from '@/app/api/reviews/[id]/route';

function createJsonRequest(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('review routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoles.mockResolvedValue({
      user: {
        id: 'teacher-1',
        name: 'Teacher',
        email: 'teacher@example.com',
        role: 'teacher',
      },
    });
    mockExperimentFind.mockImplementation(() => ({ sort: mockExperimentSort }));
    mockExperimentSort.mockReturnValue({ limit: mockExperimentLimit });
    mockExperimentLimit.mockReturnValue({ lean: mockExperimentLean });
    mockUserFind.mockImplementation(() => ({ select: mockUserSelect }));
    mockUserSelect.mockReturnValue({ lean: mockUserLean });
    mockExperimentLean.mockResolvedValue([]);
    mockUserLean.mockResolvedValue([]);
  });

  it('lists submitted experiments with student details', async () => {
    mockExperimentLean.mockResolvedValue([
      {
        _id: 'exp-1',
        userId: 'user-1',
        title: 'Free Fall Submission',
        category: 'physics',
        status: 'submitted',
        review: { status: 'pending_review' },
      },
    ]);
    mockUserLean.mockResolvedValue([
      {
        _id: 'user-1',
        name: 'Student One',
        email: 'student@example.com',
        role: 'student',
      },
    ]);

    const response = await reviewsGet(
      new NextRequest('http://localhost/api/reviews?reviewStatus=pending_review&category=physics')
    );

    expect(mockExperimentFind).toHaveBeenCalledWith({
      status: 'submitted',
      'review.status': 'pending_review',
      category: 'physics',
    });
    expect(mockExperimentSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockExperimentLimit).toHaveBeenCalledWith(100);
    expect(mockUserFind).toHaveBeenCalledWith({ _id: { $in: ['user-1'] } });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [
        {
          _id: 'exp-1',
          userId: 'user-1',
          title: 'Free Fall Submission',
          category: 'physics',
          status: 'submitted',
          review: { status: 'pending_review' },
          student: {
            id: 'user-1',
            name: 'Student One',
            email: 'student@example.com',
            role: 'student',
          },
        },
      ],
    });
  });

  it('updates instructor feedback for a submitted experiment', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const experimentDoc = {
      status: 'submitted',
      review: { status: 'pending_review', feedback: '' },
      save,
    };
    mockExperimentFindById.mockResolvedValue(experimentDoc);

    const response = await reviewPut(
      createJsonRequest('http://localhost/api/reviews/507f1f77bcf86cd799439011', {
        reviewStatus: 'approved',
        feedback: 'Clear report and accurate validation results.',
      }),
      { params: { id: '507f1f77bcf86cd799439011' } }
    );

    expect(experimentDoc.review.status).toBe('approved');
    expect(experimentDoc.review.feedback).toBe('Clear report and accurate validation results.');
    expect(experimentDoc.review.reviewedBy).toBe('Teacher');
    expect(experimentDoc.review.reviewerRole).toBe('teacher');
    expect(save).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it('rejects invalid review status updates', async () => {
    mockExperimentFindById.mockResolvedValue({
      status: 'submitted',
      review: { status: 'pending_review' },
      save: vi.fn(),
    });

    const response = await reviewPut(
      createJsonRequest('http://localhost/api/reviews/507f1f77bcf86cd799439011', {
        reviewStatus: 'archived',
      }),
      { params: { id: '507f1f77bcf86cd799439011' } }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Invalid review status',
    });
  });
});
