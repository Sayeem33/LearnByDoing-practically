import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockDbConnect, mockFindById } = vi.hoisted(() => ({
  mockDbConnect: vi.fn(),
  mockFindById: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: mockDbConnect,
}));

vi.mock('@/models/User', () => ({
  default: {
    findById: mockFindById,
  },
}));

import { createAuthToken, getSessionFromRequest } from '@/lib/auth';

describe('auth helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a token and resolves a session from a signed cookie', async () => {
    const token = createAuthToken({
      id: 'user-123',
      email: 'student@example.com',
      role: 'student',
    });

    const request = new NextRequest('http://localhost/api/auth/me', {
      headers: {
        cookie: `simulab_auth=${token}`,
      },
    });

    mockFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: 'user-123',
        name: 'Student User',
        email: 'student@example.com',
        role: 'student',
      }),
    });

    const session = await getSessionFromRequest(request);

    expect(mockDbConnect).toHaveBeenCalledTimes(1);
    expect(mockFindById).toHaveBeenCalledWith('user-123');
    expect(session).toMatchObject({
      user: {
        id: 'user-123',
        name: 'Student User',
        email: 'student@example.com',
        role: 'student',
      },
    });
    expect(typeof session?.expiresAt).toBe('string');
  });

  it('returns null for a tampered token', async () => {
    const token = createAuthToken({
      id: 'user-123',
      email: 'student@example.com',
      role: 'student',
    });

    const request = new NextRequest('http://localhost/api/auth/me', {
      headers: {
        cookie: `simulab_auth=${token}tampered`,
      },
    });

    const session = await getSessionFromRequest(request);

    expect(session).toBeNull();
    expect(mockDbConnect).not.toHaveBeenCalled();
    expect(mockFindById).not.toHaveBeenCalled();
  });
});
