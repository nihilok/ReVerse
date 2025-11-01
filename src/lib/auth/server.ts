import { auth } from './config';
import { headers } from 'next/headers';
import { db } from '@/infrastructure/database/client';
import { users } from '@/infrastructure/database/schema';
import { eq } from 'drizzle-orm';
import type { User } from 'better-auth';

/**
 * Get the current authenticated user from the request
 * Returns basic user data from session (id, email, name, etc.)
 * Returns null if no user is authenticated
 */
export async function getAuthUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the full user data including custom fields like isAnonymous
 * Use this sparingly as it requires a database query
 * For most cases, prefer getAuthUser() which uses cached session data
 */
export async function getFullUser(userId: string) {
  const [fullUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return fullUser ?? null;
}

/**
 * Require an authenticated user
 * Throws an error if no user is authenticated
 * Returns basic user data from session
 */
export async function requireAuth(): Promise<User> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require an authenticated user with full data including custom fields
 * Throws an error if no user is authenticated
 * Makes a database query to fetch custom fields like isAnonymous
 */
export async function requireFullAuth() {
  const user = await requireAuth();
  const fullUser = await getFullUser(user.id);
  if (!fullUser) {
    throw new Error('User not found');
  }
  return fullUser;
}

