import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockDbConnect,
  mockFindOne,
  mockCreate,
  mockCreateAuthToken,
  mockSetAuthCookie,
  mockGetSessionFromRequest,
  mockUnauthorizedResponse,
} = vi.hoisted(() => ({
  mockDbConnect: vi.fn(),
  mockFindOne: vi.fn(),
  mockCreate: vi.fn(),
  mockCreateAuthToken: vi.fn(),
  mockSetAuthCookie: vi.fn(),
  mockGetSessionFromRequest: vi.fn(),
  mockUnauthorizedResponse: vi.fn(() =>
    NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  ),
}));

vi.mock('@/lib/dbConnect', () => ({
  default: mockDbConnect,
}));

vi.mock('@/models/User', () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

vi.mock('@/lib/auth', () => ({
  createAuthToken: mockCreateAuthToken,
  setAuthCookie: mockSetAuthCookie,
  getSessionFromRequest: mockGetSessionFromRequest,
  unauthorizedResponse: mockUnauthorizedResponse,
}));

import { POST as registerPost } from '@/app/api/auth/register/route';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { GET as meGet } from '@/app/api/auth/me/route';

function createJsonRequest(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateAuthToken.mockReturnValue('signed-auth-token');
  });

  it('registers a new user and sets an auth cookie', async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      _id: 'user-1',
      name: 'New Student',
      email: 'new@example.com',
      role: 'student',
      toObject: () => ({
        _id: 'user-1',
        name: 'New Student',
        email: 'new@example.com',
        role: 'student',
        password: 'hashed',
      }),
    });

    const response = await registerPost(
      createJsonRequest('http://localhost/api/auth/register', {
        name: 'New Student',
        email: 'new@example.com',
        password: 'password123',
      })
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      message: 'Registration successful',
    });
    expect(mockDbConnect).toHaveBeenCalled();
    expect(mockFindOne).toHaveBeenCalledWith({ email: 'new@example.com' });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Student',
        email: 'new@example.com',
        role: 'student',
      })
    );
    expect(mockCreateAuthToken).toHaveBeenCalled();
    expect(mockSetAuthCookie).toHaveBeenCalled();
  });

  it('rejects duplicate registration emails', async () => {
    mockFindOne.mockResolvedValue({ _id: 'existing-user' });

    const response = await registerPost(
      createJsonRequest('http://localhost/api/auth/register', {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Email already registered',
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('logs in a teacher only from the instructor role flow', async () => {
    const comparePassword = vi.fn().mockResolvedValue(true);
    const select = vi.fn().mockResolvedValue({
      _id: 'teacher-1',
      email: 'teacher@example.com',
      role: 'teacher',
      comparePassword,
      toObject: () => ({
        _id: 'teacher-1',
        name: 'Teacher',
        email: 'teacher@example.com',
        role: 'teacher',
        password: 'hashed',
      }),
    });

    mockFindOne.mockReturnValue({ select });

    const badRoleResponse = await loginPost(
      createJsonRequest('http://localhost/api/auth/login', {
        email: 'teacher@example.com',
        password: 'password123',
        loginRole: 'student',
      })
    );

    expect(badRoleResponse.status).toBe(403);
    await expect(badRoleResponse.json()).resolves.toEqual({
      success: false,
      error: 'Please choose Instructor login for this account',
    });

    const goodRoleResponse = await loginPost(
      createJsonRequest('http://localhost/api/auth/login', {
        email: 'teacher@example.com',
        password: 'password123',
        loginRole: 'instructor',
      })
    );

    expect(goodRoleResponse.status).toBe(200);
    await expect(goodRoleResponse.json()).resolves.toMatchObject({
      success: true,
      message: 'Login successful',
    });
    expect(comparePassword).toHaveBeenCalledWith('password123');
    expect(mockSetAuthCookie).toHaveBeenCalled();
  });

  it('returns the authenticated user from /api/auth/me', async () => {
    mockGetSessionFromRequest.mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Student User',
        email: 'student@example.com',
        role: 'student',
      },
      expiresAt: '2030-01-01T00:00:00.000Z',
    });

    const response = await meGet(new NextRequest('http://localhost/api/auth/me'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        id: 'user-1',
        name: 'Student User',
        email: 'student@example.com',
        role: 'student',
      },
      session: {
        expiresAt: '2030-01-01T00:00:00.000Z',
      },
    });
  });

  it('returns unauthorized from /api/auth/me when no session exists', async () => {
    mockGetSessionFromRequest.mockResolvedValue(null);

    const response = await meGet(new NextRequest('http://localhost/api/auth/me'));

    expect(mockUnauthorizedResponse).toHaveBeenCalled();
    expect(response.status).toBe(401);
  });
});
