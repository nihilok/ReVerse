import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/insights/route';
import * as authServer from '@/lib/auth/server';
import * as debugLib from '@/lib/debug';

// Mock the dependencies
vi.mock('@/lib/auth/server');
vi.mock('@/lib/services/insights-service');
vi.mock('@/lib/debug');
vi.mock('@/lib/auth/check-prompt-passkey');

describe('Insights API Response Logging', () => {
  const mockDebugLog = vi.mocked(debugLib.debugLog);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/insights', () => {
    it('should log 401 status when authentication fails', async () => {
      // Mock authentication failure
      vi.mocked(authServer.requireAuth).mockRejectedValue(
        new Error('Authentication required')
      );

      const request = new NextRequest('http://localhost:3000/api/insights');
      const response = await GET(request);

      expect(response.status).toBe(401);
      
      // Verify RESPONSE was logged with 401 status
      expect(mockDebugLog).toHaveBeenCalledWith(
        'RESPONSE',
        expect.stringContaining('GET /api/insights'),
        expect.objectContaining({
          status: 401,
          duration: expect.any(Number),
        })
      );
    });

    it('should log 200 status when request succeeds', async () => {
      // Mock successful authentication
      vi.mocked(authServer.requireAuth).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock successful service call
      const { insightsService } = await import('@/lib/services/insights-service');
      vi.mocked(insightsService.getUserInsights).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/insights');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      // Verify RESPONSE was logged with 200 status
      expect(mockDebugLog).toHaveBeenCalledWith(
        'RESPONSE',
        expect.stringContaining('GET /api/insights'),
        expect.objectContaining({
          status: 200,
          duration: expect.any(Number),
        })
      );
    });
  });

  describe('POST /api/insights', () => {
    it('should log 401 status when authentication fails', async () => {
      // Mock authentication failure
      vi.mocked(authServer.requireFullAuth).mockRejectedValue(
        new Error('Authentication required')
      );

      const request = new NextRequest('http://localhost:3000/api/insights', {
        method: 'POST',
        body: JSON.stringify({
          passageText: 'Test passage',
          passageReference: 'John 3:16',
        }),
      });
      
      const response = await POST(request);

      expect(response.status).toBe(401);
      
      // Verify RESPONSE was logged with 401 status
      expect(mockDebugLog).toHaveBeenCalledWith(
        'RESPONSE',
        expect.stringContaining('POST /api/insights'),
        expect.objectContaining({
          status: 401,
          duration: expect.any(Number),
        })
      );
    });

    it('should log 201 status when insight is created successfully', async () => {
      // Mock successful authentication
      vi.mocked(authServer.requireFullAuth).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        name: 'Test User',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAnonymous: false,
      });

      // Mock passkey prompt check
      const { shouldPromptForPasskey } = await import('@/lib/auth/check-prompt-passkey');
      vi.mocked(shouldPromptForPasskey).mockResolvedValue(false);

      // Mock successful service call
      const { insightsService } = await import('@/lib/services/insights-service');
      vi.mocked(insightsService.getOrCreateInsight).mockResolvedValue({
        id: 'insight-123',
        userId: 'user-123',
        passageReference: 'John 3:16',
        passageText: 'Test passage',
        historicalContext: 'Test context',
        theologicalSignificance: 'Test significance',
        practicalApplication: 'Test application',
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/insights', {
        method: 'POST',
        body: JSON.stringify({
          passageText: 'Test passage',
          passageReference: 'John 3:16',
        }),
      });
      
      const response = await POST(request);

      expect(response.status).toBe(201);
      
      // Verify RESPONSE was logged with 201 status
      expect(mockDebugLog).toHaveBeenCalledWith(
        'RESPONSE',
        expect.stringContaining('POST /api/insights'),
        expect.objectContaining({
          status: 201,
          duration: expect.any(Number),
        })
      );
    });
  });
});
