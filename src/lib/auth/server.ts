import { auth } from './config';
import { headers } from 'next/headers';
import { db } from '@/infrastructure/database/client';
import { users } from '@/infrastructure/database/schema';
import { eq } from 'drizzle-orm';

/**
 * Get the current authenticated user from the request
 * Fetches full user data from database including custom fields like isAnonymous
 * Returns null if no user is authenticated
 */
export async function getAuthUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    // Fetch full user data from database to include custom fields
    const [fullUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return fullUser ?? null;
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

