import { db } from '@/infrastructure/database/client';
import { chats, insights, userPreferences } from '@/infrastructure/database/schema';
import { eq, and, isNull } from 'drizzle-orm';

/**
 * Check if we should prompt the user to add a passkey
 * Returns true if:
 * 1. User is anonymous
 * 2. This is their first save of the specified type
 * 
 * @param userId - The user's ID
 * @param isAnonymous - Whether the user is anonymous
 * @param actionType - The type of action triggering the check
 */
export async function shouldPromptForPasskey(
  userId: string,
  isAnonymous: boolean,
  actionType: 'save_chat' | 'save_insight' | 'save_settings'
): Promise<boolean> {
  // Only prompt anonymous users
  if (!isAnonymous) {
    return false;
  }

  try {
    switch (actionType) {
      case 'save_chat': {
        // Check if this is their first chat
        const existingChats = await db
          .select({ id: chats.id })
          .from(chats)
          .where(and(eq(chats.userId, userId), isNull(chats.deletedAt)))
          .limit(1);
        
        // If no previous chats exist, this is the first one
        return existingChats.length === 0;
      }

      case 'save_insight': {
        // Check if this is their first insight
        const existingInsights = await db
          .select({ id: insights.id })
          .from(insights)
          .where(and(eq(insights.userId, userId), isNull(insights.deletedAt)))
          .limit(1);
        
        // If no previous insights exist, this is the first one
        return existingInsights.length === 0;
      }

      case 'save_settings': {
        // Check if they have any saved settings (user preferences)
        const existingPreferences = await db
          .select({ id: userPreferences.id })
          .from(userPreferences)
          .where(and(eq(userPreferences.userId, userId), isNull(userPreferences.deletedAt)))
          .limit(1);
        
        // If no previous settings exist, this is the first save
        return existingPreferences.length === 0;
      }

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking if should prompt for passkey:', error);
    return false;
  }
}

/**
 * Create a prompt response object to include in API responses
 */
export function createPasskeyPromptResponse() {
  return {
    type: 'optional_passkey',
    message: 'Your data is now saved. Add a passkey to access it from other devices?',
    actions: {
      addPasskey: 'client_action', // Client will handle passkey addition
      dismiss: 'continue_anonymous',
    },
  };
}
