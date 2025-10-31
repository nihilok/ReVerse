import { db } from '@/infrastructure/database/client';
import { chats, insights, userPreferences } from '@/infrastructure/database/schema';
import { eq } from 'drizzle-orm';

/**
 * Migrate data from an anonymous user to an authenticated user
 * This function is called when an anonymous user adds a passkey
 * 
 * @param anonymousUserId - The ID of the anonymous user
 * @param newUserId - The ID of the new authenticated user
 */
export async function migrateAnonymousUserData(
  anonymousUserId: string,
  newUserId: string
): Promise<void> {
  try {
    console.log(`Starting data migration from anonymous user ${anonymousUserId} to authenticated user ${newUserId}`);

    // Migrate chats
    await db
      .update(chats)
      .set({ userId: newUserId, updatedAt: new Date() })
      .where(eq(chats.userId, anonymousUserId));

    // Migrate insights
    await db
      .update(insights)
      .set({ userId: newUserId, updatedAt: new Date() })
      .where(eq(insights.userId, anonymousUserId));

    // Migrate preferences
    await db
      .update(userPreferences)
      .set({ userId: newUserId, updatedAt: new Date() })
      .where(eq(userPreferences.userId, anonymousUserId));

    console.log(`Successfully migrated data from anonymous user ${anonymousUserId} to authenticated user ${newUserId}`);
  } catch (error) {
    console.error('Error migrating anonymous user data:', error);
    throw new Error('Failed to migrate user data');
  }
}
