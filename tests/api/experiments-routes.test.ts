import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockDbConnect,
  mockRequireRoles,
  mockExperimentAccessFilter,
  mockFind,
  mockCreate,
  mockFindOne,
  mockLimit,
  mockSort,
} = vi.hoisted(() => {
  const limit = vi.fn();
  const sort = vi.fn();
  sort.mockReturnValue({ limit });

  return {
    mockDbConnect: vi.fn(),
    mockRequireRoles: vi.fn(),
    mockExperimentAccessFilter: vi.fn(),
    mockFind: vi.fn(() => ({ sort })),
    mockCreate: vi.fn(),
    mockFindOne: vi.fn(),
    mockLimit: limit,
    mockSort: sort,
  };
});

vi.mock('@/lib/dbConnect', () => ({
  default: mockDbConnect,
}));

vi.mock('@/lib/rbac', () => ({
  RBAC_POLICY: {
    experiments: {
      list: ['student', 'teacher', 'admin'],
      create: ['student', 'teacher', 'admin'],
      update: ['student', 'teacher', 'admin'],
    },
  },
  requireRoles: mockRequireRoles,
  experimentAccessFilter: mockExperimentAccessFilter,
}));

vi.mock('@/models/Experiment', () => ({
  default: {
    find: mockFind,
    create: mockCreate,
    findOne: mockFindOne,
  },
}));

import { GET as experimentsGet, POST as experimentsPost } from '@/app/api/experiments/route';
import { PUT as experimentPut } from '@/app/api/experiments/[id]/route';

function createJsonRequest(url: string, method: 'POST' | 'PUT', body: unknown) {
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('experiment routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoles.mockResolvedValue({
      user: {
        id: 'user-1',
        role: 'student',
      },
    });
    mockExperimentAccessFilter.mockReturnValue({ userId: 'user-1' });
    mockFind.mockImplementation(() => ({ sort: mockSort }));
    mockSort.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([]);
  });

  it('lists experiments with category and status filters', async () => {
    mockLimit.mockResolvedValue([{ _id: 'exp-1', title: 'Free Fall Lab' }]);

    const response = await experimentsGet(
      new NextRequest('http://localhost/api/experiments?category=physics&status=draft')
    );

    expect(mockExperimentAccessFilter).toHaveBeenCalledWith({ id: 'user-1', role: 'student' });
    expect(mockFind).toHaveBeenCalledWith({
      userId: 'user-1',
      category: 'physics',
      status: 'draft',
    });
    expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockLimit).toHaveBeenCalledWith(50);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [{ _id: 'exp-1', title: 'Free Fall Lab' }],
    });
  });

  it('blocks creating a submitted experiment without a lab report', async () => {
    const response = await experimentsPost(
      createJsonRequest('http://localhost/api/experiments', 'POST', {
        title: 'Projectile Motion',
        category: 'physics',
        experimentType: 'projectilemotion',
        status: 'submitted',
        labReport: '   ',
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'A lab report is required before submission',
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates a draft experiment for the authenticated user', async () => {
    mockCreate.mockResolvedValue({
      _id: 'exp-1',
      title: 'Pendulum Lab',
      status: 'draft',
      labReport: '',
    });

    const response = await experimentsPost(
      createJsonRequest('http://localhost/api/experiments', 'POST', {
        title: 'Pendulum Lab',
        category: 'physics',
        experimentType: 'pendulum',
        state: { length: 2 },
      })
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        title: 'Pendulum Lab',
        category: 'physics',
        experimentType: 'pendulum',
        status: 'draft',
      })
    );
    expect(response.status).toBe(201);
  });

  it('rejects invalid experiment status updates', async () => {
    mockFindOne.mockResolvedValue({
      status: 'draft',
      labReport: '',
      save: vi.fn(),
    });

    const response = await experimentPut(
      createJsonRequest('http://localhost/api/experiments/exp-1', 'PUT', {
        status: 'archived',
      }),
      { params: { id: '507f1f77bcf86cd799439011' } }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Invalid experiment status',
    });
  });

  it('prevents submitting an experiment without a saved lab report', async () => {
    const save = vi.fn();
    mockFindOne.mockResolvedValue({
      status: 'draft',
      labReport: '',
      title: 'Collision Lab',
      description: '',
      state: {},
      save,
    });

    const response = await experimentPut(
      createJsonRequest('http://localhost/api/experiments/exp-1', 'PUT', {
        status: 'submitted',
      }),
      { params: { id: '507f1f77bcf86cd799439011' } }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'A lab report is required before submission',
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('updates an experiment report and persists submission status', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const experimentDoc = {
      status: 'draft',
      labReport: '',
      title: 'Free Fall Lab',
      description: '',
      state: { height: 100 },
      save,
    };
    mockFindOne.mockResolvedValue(experimentDoc);

    const response = await experimentPut(
      createJsonRequest('http://localhost/api/experiments/exp-1', 'PUT', {
        status: 'submitted',
        labReport: '# Completed lab report',
      }),
      { params: { id: '507f1f77bcf86cd799439011' } }
    );

    expect(experimentDoc.status).toBe('submitted');
    expect(experimentDoc.labReport).toBe('# Completed lab report');
    expect(save).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });
});
