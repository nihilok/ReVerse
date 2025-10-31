'use client';

import { useState, useCallback, useEffect } from 'react';
import { authClient } from '@/lib/auth/client';

const PROMPT_DISMISSED_KEY = 'passkey-prompt-dismissed';
const PROMPT_TRIGGERS_KEY = 'passkey-prompt-triggers';

interface PromptTriggers {
  firstChatSaved: boolean;
  firstInsightSaved: boolean;
  firstPreferenceSaved: boolean;
}

/**
 * Hook to manage passkey prompt display logic
 * Tracks whether the prompt should be shown based on user actions and dismissal state
 */
export function usePasskeyPrompt() {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Check if user is anonymous on mount
  useEffect(() => {
    const checkAnonymousStatus = async () => {
      try {
        const session = await authClient.getSession();
        setIsAnonymous(session?.user?.isAnonymous ?? false);
      } catch (error) {
        console.error('Failed to check anonymous status:', error);
      }
    };

    checkAnonymousStatus();
  }, []);

  /**
   * Check if the prompt should be shown based on dismissal and trigger history
   */
  const shouldPrompt = useCallback(async (): Promise<boolean> => {
    // Don't prompt if already dismissed in this session
    if (sessionStorage.getItem(PROMPT_DISMISSED_KEY) === 'true') {
      return false;
    }

    // Check if user is anonymous
    try {
      const session = await authClient.getSession();
      if (!session?.user?.isAnonymous) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check if should prompt:', error);
      return false;
    }
  }, []);

  /**
   * Mark that a specific trigger has occurred (e.g., first chat saved)
   */
  const markTrigger = useCallback(
    async (trigger: keyof PromptTriggers): Promise<boolean> => {
      // Get current triggers from session storage
      const triggersJson = sessionStorage.getItem(PROMPT_TRIGGERS_KEY);
      const triggers: PromptTriggers = triggersJson
        ? JSON.parse(triggersJson)
        : {
            firstChatSaved: false,
            firstInsightSaved: false,
            firstPreferenceSaved: false,
          };

      // If this trigger has already fired, don't prompt again
      if (triggers[trigger]) {
        return false;
      }

      // Mark this trigger as fired
      triggers[trigger] = true;
      sessionStorage.setItem(PROMPT_TRIGGERS_KEY, JSON.stringify(triggers));

      // Check if we should show the prompt
      const canPrompt = await shouldPrompt();
      if (canPrompt) {
        setShouldShowPrompt(true);
        return true;
      }

      return false;
    },
    [shouldPrompt]
  );

  /**
   * Dismiss the prompt for this session
   */
  const dismissPrompt = useCallback(() => {
    sessionStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
    setShouldShowPrompt(false);
  }, []);

  /**
   * Reset all prompt state (useful for testing or when user signs in)
   */
  const resetPromptState = useCallback(() => {
    sessionStorage.removeItem(PROMPT_DISMISSED_KEY);
    sessionStorage.removeItem(PROMPT_TRIGGERS_KEY);
    setShouldShowPrompt(false);
  }, []);

  return {
    shouldShowPrompt,
    isAnonymous,
    markTrigger,
    dismissPrompt,
    resetPromptState,
  };
}
