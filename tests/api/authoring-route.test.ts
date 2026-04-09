import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockDbConnect,
  mockRequireRoles,
  mockFind,
  mockFindOneAndUpdate,
  mockTutorialFindOneAndUpdate,
} = vi.hoisted(() => ({
  mockDbConnect: vi.fn(),
  mockRequireRoles: vi.fn(),
  mockFind: vi.fn(),
  mockFindOneAndUpdate: vi.fn(),
  mockTutorialFindOneAndUpdate: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: mockDbConnect,
}));

vi.mock('@/lib/rbac', () => ({
  RBAC_POLICY: {
    authoring: {
      list: ['teacher', 'admin'],
      create: ['teacher', 'admin'],
      update: ['teacher', 'admin'],
    },
  },
  requireRoles: mockRequireRoles,
}));

vi.mock('@/models/ConceptDefinition', () => ({
  default: {
    find: mockFind,
    findOneAndUpdate: mockFindOneAndUpdate,
  },
}));

vi.mock('@/models/Tutorial', () => ({
  default: {
    findOneAndUpdate: mockTutorialFindOneAndUpdate,
  },
}));

import { GET as authoringGet, POST as authoringPost } from '@/app/api/authoring/route';

function createJsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/authoring', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('authoring route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoles.mockResolvedValue({
      user: {
        id: 'teacher-1',
        name: 'Teacher One',
        role: 'teacher',
      },
    });
    mockFind.mockReturnValue({
      sort: vi.fn().mockResolvedValue([{ conceptId: 'custommodule' }]),
    });
    mockFindOneAndUpdate.mockResolvedValue({
      conceptId: 'custommodule',
      name: 'Custom Module',
    });
    mockTutorialFindOneAndUpdate.mockResolvedValue({});
  });

  it('lists saved definitions for a teacher', async () => {
    const response = await authoringGet(new NextRequest('http://localhost/api/authoring'));

    expect(mockFind).toHaveBeenCalledWith({ createdBy: 'teacher-1' });
    expect(response.status).toBe(200);
  });

  it('saves a concept definition and syncs tutorial chapters', async () => {
    const response = await authoringPost(
      createJsonRequest({
        name: 'Custom Module',
        category: 'physics',
        description: 'Simple custom module',
        theory: 'Theory goes here',
        objectives: ['Understand idea'],
        controls: [{ key: 'speed', label: 'Speed', kind: 'range' }],
        formulas: [{ key: 'f1', label: 'Main Formula', expression: 'v = d/t' }],
        charts: [{ key: 'chart1', title: 'Graph', xKey: 'time', yKey: 'speed' }],
        tutorialChapters: [{ title: 'Intro', content: 'Chapter content', keyPoints: ['Point A'] }],
        validationRules: [{ key: 'rule1', label: 'Check rule', implemented: false }],
        defaultState: { dataPoints: [] },
      })
    );

    expect(mockFindOneAndUpdate).toHaveBeenCalled();
    expect(mockTutorialFindOneAndUpdate).toHaveBeenCalled();
    expect(response.status).toBe(201);
  });
});
