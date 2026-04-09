import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockDbConnect,
  mockRequireRoles,
  mockAssignmentFind,
  mockAssignmentCreate,
  mockUserFindById,
  mockUserFind,
  mockTutorialFindOne,
  mockProgressFindOne,
  mockProgressFind,
} = vi.hoisted(() => {
  const assignmentSort = vi.fn();
  const assignmentFind = vi.fn(() => ({ sort: assignmentSort }));

  return {
    mockDbConnect: vi.fn(),
    mockRequireRoles: vi.fn(),
    mockAssignmentFind: assignmentFind,
    mockAssignmentCreate: vi.fn(),
    mockUserFindById: vi.fn(),
    mockUserFind: vi.fn(),
    mockTutorialFindOne: vi.fn(),
    mockProgressFindOne: vi.fn(),
    mockProgressFind: vi.fn(),
  };
});

vi.mock('@/lib/dbConnect', () => ({
  default: mockDbConnect,
}));

vi.mock('@/lib/rbac', () => ({
  RBAC_POLICY: {
    assignments: {
      list: ['student', 'teacher', 'admin'],
      create: ['teacher', 'admin'],
      targets: ['teacher', 'admin'],
    },
  },
  requireRoles: mockRequireRoles,
}));

vi.mock('@/models/Assignment', () => ({
  default: {
    find: mockAssignmentFind,
    create: mockAssignmentCreate,
  },
}));

vi.mock('@/models/User', () => ({
  default: {
    findById: mockUserFindById,
    find: mockUserFind,
  },
}));

vi.mock('@/models/Tutorial', () => ({
  default: {
    findOne: mockTutorialFindOne,
  },
}));

vi.mock('@/models/UserProgress', () => ({
  default: {
    findOne: mockProgressFindOne,
    find: mockProgressFind,
  },
}));

import { GET as assignmentsGet, POST as assignmentsPost } from '@/app/api/assignments/route';

function createJsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/assignments', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('assignment routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssignmentFind.mockImplementation(() => ({
      sort: vi.fn().mockResolvedValue([]),
    }));
    mockUserFind.mockResolvedValue([]);
    mockProgressFind.mockResolvedValue([]);
  });

  it('returns only assignments visible to the current student', async () => {
    mockRequireRoles.mockResolvedValue({
      user: {
        id: 'student-1',
        role: 'student',
      },
    });
    mockUserFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: 'student-1',
        institution: 'SimuLab School',
        grade: 'Class 10',
      }),
    });
    mockAssignmentFind.mockImplementation(() => ({
      sort: vi.fn().mockResolvedValue([
        {
          sourceType: 'tutorial',
          sourceId: 'freefall',
          assignedStudentIds: [],
          assignedClasses: ['SimuLab School__Class 10'],
          toObject: () => ({
            _id: 'assignment-1',
            title: 'Free Fall Tutorial',
            sourceType: 'tutorial',
            sourceId: 'freefall',
            assignedStudentIds: [],
            assignedClasses: ['SimuLab School__Class 10'],
          }),
        },
        {
          sourceType: 'tutorial',
          sourceId: 'collision',
          assignedStudentIds: ['student-2'],
          assignedClasses: [],
          toObject: () => ({
            _id: 'assignment-2',
            title: 'Hidden Assignment',
            sourceType: 'tutorial',
            sourceId: 'collision',
            assignedStudentIds: ['student-2'],
            assignedClasses: [],
          }),
        },
      ]),
    }));
    mockProgressFindOne.mockResolvedValue({
      tutorialProgress: [
        {
          tutorialId: 'freefall',
          completionPercent: 75,
        },
      ],
    });

    const response = await assignmentsGet(new NextRequest('http://localhost/api/assignments'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0].title).toBe('Free Fall Tutorial');
    expect(payload.data[0].studentStatus.completionPercent).toBe(75);
  });

  it('allows a teacher to create a lab assignment', async () => {
    mockRequireRoles.mockResolvedValue({
      user: {
        id: 'teacher-1',
        role: 'teacher',
        name: 'Teacher One',
      },
    });
    mockAssignmentCreate.mockResolvedValue({
      _id: 'assignment-1',
      title: 'Projectile Motion Practice',
    });

    const response = await assignmentsPost(
      createJsonRequest({
        title: 'Projectile Motion Practice',
        sourceType: 'lab',
        sourceId: 'projectilemotion',
        dueDate: '2026-05-01',
        assignedClasses: ['SimuLab School__Class 10'],
      })
    );

    expect(mockAssignmentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Projectile Motion Practice',
        sourceType: 'lab',
        sourceId: 'projectilemotion',
        createdBy: 'teacher-1',
        creatorRole: 'teacher',
      })
    );
    expect(response.status).toBe(201);
  });
});
