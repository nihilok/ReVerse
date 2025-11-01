'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/client';

/**
 * AuthProvider component that handles automatic anonymous sign-in
 * This ensures users can start using the app immediately without explicit authentication
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

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
        // Still mark as initialized even on error to avoid blocking the UI
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Show a minimal loading state while initializing auth
  // This prevents 401 errors when users try to interact too quickly
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
