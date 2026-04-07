import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockDbConnect,
  mockFind,
  mockSort,
  mockFindOne,
  mockFindOneAndUpdate,
  mockRequireRoles,
} = vi.hoisted(() => {
  const sort = vi.fn();
  sort.mockResolvedValue([]);

  return {
    mockDbConnect: vi.fn(),
    mockFind: vi.fn(() => ({ sort })),
    mockSort: sort,
    mockFindOne: vi.fn(),
    mockFindOneAndUpdate: vi.fn(),
    mockRequireRoles: vi.fn(),
  };
});

vi.mock('@/lib/dbConnect', () => ({
  default: mockDbConnect,
}));

vi.mock('@/lib/rbac', () => ({
  RBAC_POLICY: {
    tutorials: {
      update: ['teacher', 'admin'],
    },
  },
  requireRoles: mockRequireRoles,
}));

vi.mock('@/models/Tutorial', () => ({
  default: {
    find: mockFind,
    findOne: mockFindOne,
    findOneAndUpdate: mockFindOneAndUpdate,
  },
}));

import { GET as tutorialsGet } from '@/app/api/tutorials/route';
import { GET as tutorialGet, PUT as tutorialPut } from '@/app/api/tutorials/[experimentId]/route';

function createJsonRequest(url: string, method: 'PUT', body: unknown) {
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('tutorial routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoles.mockResolvedValue({
      user: { id: 'teacher-1', role: 'teacher' },
    });
    mockSort.mockResolvedValue([]);
  });

  it('filters tutorial listings by category and difficulty', async () => {
    mockSort.mockResolvedValue([{ experimentId: 'freefall', title: 'Free Fall Tutorial' }]);

    const response = await tutorialsGet(
      new NextRequest('http://localhost/api/tutorials?category=physics&difficulty=beginner')
    );

    expect(mockFind).toHaveBeenCalledWith({
      category: 'physics',
      difficulty: 'beginner',
    });
    expect(mockSort).toHaveBeenCalledWith({ difficulty: 1 });
    expect(response.status).toBe(200);
  });

  it('returns 404 when a tutorial is not found by experiment id', async () => {
    mockFindOne.mockResolvedValue(null);

    const response = await tutorialGet(
      new NextRequest('http://localhost/api/tutorials/freefall'),
      { params: { experimentId: 'freefall' } }
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Tutorial not found',
    });
  });

  it('updates tutorial content through the protected route', async () => {
    mockFindOneAndUpdate.mockResolvedValue({
      experimentId: 'pendulum',
      title: 'Updated Pendulum Tutorial',
    });

    const response = await tutorialPut(
      createJsonRequest('http://localhost/api/tutorials/pendulum', 'PUT', {
        title: 'Updated Pendulum Tutorial',
      }),
      { params: { experimentId: 'pendulum' } }
    );

    expect(mockRequireRoles).toHaveBeenCalled();
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { experimentId: 'pendulum' },
      { title: 'Updated Pendulum Tutorial' },
      { new: true, runValidators: true }
    );
    expect(response.status).toBe(200);
  });
});
