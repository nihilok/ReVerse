import { auth } from './config';
import { headers } from 'next/headers';

/**
 * Get the current authenticated user from the request
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
 * Require an authenticated user
 * Throws an error if no user is authenticated
 */
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
