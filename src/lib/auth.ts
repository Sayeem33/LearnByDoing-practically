import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export type UserRole = 'student' | 'teacher' | 'admin';

interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string;
}

const AUTH_COOKIE_NAME = 'simulab_auth';
const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing AUTH_SECRET (or NEXTAUTH_SECRET)');
  }

  return 'simulab-dev-only-secret-change-me';
}

function signInput(input: string, secret: string): string {
  return createHmac('sha256', secret).update(input).digest('base64url');
}

export function createAuthToken(user: { id: string; email: string; role: UserRole }): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + AUTH_TOKEN_TTL_SECONDS,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadPart = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const unsigned = `${header}.${payloadPart}`;
  const signature = signInput(unsigned, getAuthSecret());

  return `${unsigned}.${signature}`;
}

function verifyAuthToken(token: string): AuthTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, signaturePart] = parts;
  const unsigned = `${headerPart}.${payloadPart}`;
  const expectedSig = signInput(unsigned, getAuthSecret());

  const signatureBuffer = Buffer.from(signaturePart);
  const expectedBuffer = Buffer.from(expectedSig);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as AuthTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (!payload?.sub || !payload?.email || !payload?.role || !payload?.exp) {
      return null;
    }

    if (payload.exp < now) {
      return null;
    }

    if (!['student', 'teacher', 'admin'].includes(payload.role)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value || null;
}

function toAuthSession(user: AuthUser, exp: number): AuthSession {
  return {
    user,
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

async function findAuthUserById(userId: string): Promise<AuthUser | null> {
  try {
    await dbConnect();
    const user = await User.findById(userId).select('_id name email role');
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error('Auth user lookup failed:', error);
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: AUTH_TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    { success: false, error: 'Forbidden' },
    { status: 403 }
  );
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  return findAuthUserById(payload.sub);
}

export async function getSessionFromRequest(request: NextRequest): Promise<AuthSession | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  const user = await findAuthUserById(payload.sub);
  if (!user) return null;

  return toAuthSession(user, payload.exp);
}

export async function getServerSession(): Promise<AuthSession | null> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  const user = await findAuthUserById(payload.sub);
  if (!user) return null;

  return toAuthSession(user, payload.exp);
}

export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser } | { response: NextResponse }> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return { response: unauthorizedResponse() };
  }

  return { user };
}

export function isPrivilegedRole(role: UserRole): boolean {
  return role === 'teacher' || role === 'admin';
}
