'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, X } from 'lucide-react';

interface PasskeyPromptProps {
  onDismiss: () => void;
  onSuccess?: () => void;
}

/**
 * PasskeyPrompt component displays a non-blocking prompt encouraging users
 * to add a passkey for cross-device access to their data
 */
export function PasskeyPrompt({ onDismiss, onSuccess }: PasskeyPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPasskey = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get device name (browser and OS)
      const deviceName = getDeviceName();
      
      // Add passkey using Better Auth
      await authClient.passkey.addPasskey({
        name: deviceName,
      });

      console.log('Passkey added successfully');
      onSuccess?.();
      onDismiss();
    } catch (err) {
      console.error('Failed to add passkey:', err);
      
      // Provide specific guidance based on error type
      let errorMessage = 'Failed to add passkey. Please try again.';
      
      if (err instanceof Error) {
        const errMsg = err.message.toLowerCase();
        if (errMsg.includes('abort') || errMsg.includes('cancel')) {
          errorMessage = 'Passkey creation was cancelled. Try again when ready.';
        } else if (errMsg.includes('not supported') || errMsg.includes('not available')) {
          errorMessage = 'Your browser doesn\'t support passkeys. Try using Chrome, Safari, or Edge.';
        } else if (errMsg.includes('credential') && errMsg.includes('exists')) {
          errorMessage = 'A passkey already exists for this device.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 p-6 max-w-sm shadow-2xl border-burgundy-600 bg-parchment-50 dark:bg-brown-900 z-50">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-parchment-100 dark:hover:bg-brown-800 rounded-full transition-colors"
        aria-label="Dismiss prompt"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>

      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-burgundy-100 dark:bg-burgundy-900 rounded-lg">
          <Shield className="h-6 w-6 text-burgundy-600 dark:text-burgundy-400" />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-lg text-gray-900 dark:text-gray-100">
            Secure Your Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your data is saved! Add a passkey to access your chats and insights from any device.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleAddPasskey}
          disabled={isLoading}
          className="flex-1 bg-burgundy-600 hover:bg-burgundy-700 text-white"
        >
          {isLoading ? 'Adding...' : 'Add Passkey'}
        </Button>
        <Button
          onClick={onDismiss}
          variant="outline"
          disabled={isLoading}
          className="border-gray-300 dark:border-gray-600"
        >
          Later
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
        You can always add a passkey later from your settings
      </p>
    </Card>
  );
}

/**
 * Get a user-friendly device name based on browser and OS
 */
function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown Device';

  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'Unknown OS';

  // Detect browser
  if (ua.includes('Chrome') && !ua.includes('Edge')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${browser} on ${os}`;
}
