import { redirect } from '@tanstack/react-router';
import type { UserRole } from '@/types';

export function requireAuth() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw redirect({ to: '/' });
  }
}

export function requireRole(allowedRoles: Array<UserRole>) {
  requireAuth();
  const role = localStorage.getItem('user_role') as UserRole;
  if (!allowedRoles.includes(role)) {
    throw redirect({ to: '/' });
  }
}

export function requireParent() {
  requireRole(['parent']);
}

export function requireTeacher() {
  requireRole(['teacher']);
}
