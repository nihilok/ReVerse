import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePasskeyPrompt } from '@/hooks/usePasskeyPrompt';
import { authClient } from '@/lib/auth/client';

// Mock the auth client
vi.mock('@/lib/auth/client', () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));

/**
 * Tests for the usePasskeyPrompt hook
 * Verifies prompt display logic and trigger management
 */
describe('usePasskeyPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear session storage before each test
    sessionStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', async () => {
      vi.mocked(authClient.getSession).mockResolvedValue({
        user: { id: '123', isAnonymous: true },
      } as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      expect(result.current.shouldShowPrompt).toBe(false);
      
      await waitFor(() => {
        expect(result.current.isAnonymous).toBe(true);
      });
    });

    it('should detect authenticated users', async () => {
      vi.mocked(authClient.getSession).mockResolvedValue({
        user: { id: '123', isAnonymous: false },
      } as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      await waitFor(() => {
        expect(result.current.isAnonymous).toBe(false);
      });
    });

    it('should handle missing session', async () => {
      vi.mocked(authClient.getSession).mockResolvedValue(null as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      await waitFor(() => {
        expect(result.current.isAnonymous).toBe(false);
      });
    });
  });

  describe('Trigger Management', () => {
    it('should mark trigger and show prompt for anonymous users', async () => {
      vi.mocked(authClient.getSession).mockResolvedValue({
        user: { id: '123', isAnonymous: true },
      } as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      let shouldPrompt = false;
      await act(async () => {
        shouldPrompt = await result.current.markTrigger('firstChatSaved');
      });

      expect(shouldPrompt).toBe(true);
      expect(result.current.shouldShowPrompt).toBe(true);
    });

    it('should not show prompt for authenticated users', async () => {
      vi.mocked(authClient.getSession).mockResolvedValue({
        user: { id: '123', isAnonymous: false },
      } as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      let shouldPrompt = false;
      await act(async () => {
        shouldPrompt = await result.current.markTrigger('firstChatSaved');
      });

      expect(shouldPrompt).toBe(false);
      expect(result.current.shouldShowPrompt).toBe(false);
    });

    it('should not show prompt if already dismissed', async () => {
      sessionStorage.setItem('passkey-prompt-dismissed', 'true');

      vi.mocked(authClient.getSession).mockResolvedValue({
        user: { id: '123', isAnonymous: true },
      } as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      let shouldPrompt = false;
      await act(async () => {
        shouldPrompt = await result.current.markTrigger('firstChatSaved');
      });

      expect(shouldPrompt).toBe(false);
    });

    it('should not trigger twice for same action', async () => {
      vi.mocked(authClient.getSession).mockResolvedValue({
        user: { id: '123', isAnonymous: true },
      } as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      // First trigger
      let shouldPrompt = false;
      await act(async () => {
        shouldPrompt = await result.current.markTrigger('firstChatSaved');
      });
      expect(shouldPrompt).toBe(true);

      // Second trigger with same action
      await act(async () => {
        shouldPrompt = await result.current.markTrigger('firstChatSaved');
      });
      expect(shouldPrompt).toBe(false);
    });

    it('should allow different triggers', async () => {
      vi.mocked(authClient.getSession).mockResolvedValue({
        user: { id: '123', isAnonymous: true },
      } as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      // First trigger
      await act(async () => {
        await result.current.markTrigger('firstChatSaved');
      });

      // Dismiss the prompt
      act(() => {
        result.current.dismissPrompt();
      });

      // Different trigger should not work if already dismissed
      let shouldPrompt = false;
      await act(async () => {
        shouldPrompt = await result.current.markTrigger('firstInsightSaved');
      });
      expect(shouldPrompt).toBe(false);
    });
  });

  describe('Dismiss Functionality', () => {
    it('should dismiss prompt and set session storage', async () => {
      vi.mocked(authClient.getSession).mockResolvedValue({
        user: { id: '123', isAnonymous: true },
      } as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      await act(async () => {
        await result.current.markTrigger('firstChatSaved');
      });

      act(() => {
        result.current.dismissPrompt();
      });

      expect(result.current.shouldShowPrompt).toBe(false);
      expect(sessionStorage.getItem('passkey-prompt-dismissed')).toBe('true');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all prompt state', async () => {
      vi.mocked(authClient.getSession).mockResolvedValue({
        user: { id: '123', isAnonymous: true },
      } as never);

      const { result } = renderHook(() => usePasskeyPrompt());

      // Set up state
      await act(async () => {
        await result.current.markTrigger('firstChatSaved');
      });

      act(() => {
        result.current.dismissPrompt();
      });

      // Reset
      act(() => {
        result.current.resetPromptState();
      });

      expect(result.current.shouldShowPrompt).toBe(false);
      expect(sessionStorage.getItem('passkey-prompt-dismissed')).toBeNull();
      expect(sessionStorage.getItem('passkey-prompt-triggers')).toBeNull();
    });
  });
});
