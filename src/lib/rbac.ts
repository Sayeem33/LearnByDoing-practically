import { NextRequest, NextResponse } from 'next/server';
import { AuthUser, UserRole, forbiddenResponse, requireAuth } from '@/lib/auth';

type AllowedRoles = readonly UserRole[];

export const RBAC_POLICY = {
  students: {
    list: ['admin'] as AllowedRoles,
    create: ['admin'] as AllowedRoles,
    read: ['admin'] as AllowedRoles,
    update: ['admin'] as AllowedRoles,
    delete: ['admin'] as AllowedRoles,
  },
  experiments: {
    list: ['student', 'teacher', 'admin'] as AllowedRoles,
    create: ['student', 'teacher', 'admin'] as AllowedRoles,
    read: ['student', 'teacher', 'admin'] as AllowedRoles,
    update: ['student', 'teacher', 'admin'] as AllowedRoles,
    delete: ['student', 'teacher', 'admin'] as AllowedRoles,
  },
  tutorials: {
    update: ['admin'] as AllowedRoles,
  },
} as const;

export function hasRole(userRole: UserRole, allowedRoles: AllowedRoles): boolean {
  return allowedRoles.includes(userRole);
}

export async function requireRoles(
  request: NextRequest,
  allowedRoles: AllowedRoles
): Promise<{ user: AuthUser } | { response: NextResponse }> {
  const auth = await requireAuth(request);
  if ('response' in auth) {
    return auth;
  }

  if (!hasRole(auth.user.role, allowedRoles)) {
    return { response: forbiddenResponse() };
  }

  return auth;
}

export function experimentAccessFilter(user: AuthUser, experimentId?: string) {
  const filter: Record<string, string> = {};

  if (experimentId) {
    filter._id = experimentId;
  }

  // Least privilege: only admins can target non-owned experiments.
  if (user.role !== 'admin') {
    filter.userId = user.id;
  }

  return filter;
}
