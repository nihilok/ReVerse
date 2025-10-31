'use client';

import { useEffect } from 'react';
import { authClient } from '@/lib/auth/client';

/**
 * AuthProvider component that handles automatic anonymous sign-in
 * This ensures users can start using the app immediately without explicit authentication
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user has an existing session
        const session = await authClient.getSession();
        
        if (!session?.data) {
          // Automatically sign in anonymously
          await authClient.signIn.anonymous();
          console.log('User signed in anonymously');
        } else {
          console.log('Existing session found:', session.data.user.isAnonymous ? 'anonymous' : 'authenticated');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };

    initAuth();
  }, []);

  // We render children even before initialization to avoid blocking the UI
  // The session check is async and shouldn't prevent the app from rendering
  return <>{children}</>;
}
