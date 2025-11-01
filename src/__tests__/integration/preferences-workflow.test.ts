import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT } from '@/app/api/preferences/route';
import { NextRequest } from 'next/server';

// Mock the auth module
vi.mock('@/lib/auth/server', () => ({
  requireAuth: vi.fn(),
}));

// Mock the database
vi.mock('@/infrastructure/database/client', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value, type: 'eq' })),
}));

// Mock the schema
vi.mock('@/infrastructure/database/schema/user-preferences', () => ({
  userPreferences: {
    userId: 'userId',
  },
}));

import { requireAuth } from '@/lib/auth/server';
import { db } from '@/infrastructure/database/client';

/**
 * Integration tests for user preferences API
 * These tests verify the preferences endpoints work correctly
 */
describe('Preferences Workflow Integration Tests', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    isAnonymous: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: true,
    image: null,
    deletedAt: null,
  };

  const mockPreferences = {
    id: 'pref-id',
    userId: 'test-user-id',
    defaultTranslation: 'WEB',
    theme: 'light',
    fontSize: 'medium',
    showVerseNumbers: true,
    autoSavePassages: true,
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue(mockUser);
  });

  describe('GET /api/preferences', () => {
    it('should return existing preferences for authenticated user', async () => {
      // Mock database query to return preferences
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPreferences]),
          }),
        }),
      } as never);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userId).toBe(mockPreferences.userId);
      expect(data.defaultTranslation).toBe(mockPreferences.defaultTranslation);
      expect(data.theme).toBe(mockPreferences.theme);
      expect(data.fontSize).toBe(mockPreferences.fontSize);
    });

    it('should return default preferences when none exist', async () => {
      // Mock database query to return empty array
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        defaultTranslation: 'WEB',
        theme: 'system',
        fontSize: 'medium',
        showVerseNumbers: true,
        autoSavePassages: true,
      });
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error('Authentication required'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('PUT /api/preferences', () => {
    it('should create new preferences when none exist', async () => {
      const newPreferences = {
        defaultTranslation: 'KJV',
        theme: 'dark',
        fontSize: 'large',
      };

      // Mock database query to return empty array (no existing preferences)
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      // Mock insert
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ ...mockPreferences, ...newPreferences }]),
        }),
      } as never);

      const request = new NextRequest('http://localhost/api/preferences', {
        method: 'PUT',
        body: JSON.stringify(newPreferences),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.defaultTranslation).toBe('KJV');
      expect(data.theme).toBe('dark');
      expect(data.fontSize).toBe('large');
    });

    it('should update existing preferences', async () => {
      const updates = {
        theme: 'dark',
        fontSize: 'small',
      };

      // Mock database query to return existing preferences
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockPreferences]),
          }),
        }),
      } as never);

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...mockPreferences, ...updates }]),
          }),
        }),
      } as never);

      const request = new NextRequest('http://localhost/api/preferences', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.theme).toBe('dark');
      expect(data.fontSize).toBe('small');
    });

    it('should validate theme values', async () => {
      const invalidData = {
        theme: 'invalid-theme',
      };

      const request = new NextRequest('http://localhost/api/preferences', {
        method: 'PUT',
        body: JSON.stringify(invalidData),
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
    });

    it('should validate fontSize values', async () => {
      const invalidData = {
        fontSize: 'extra-huge',
      };

      const request = new NextRequest('http://localhost/api/preferences', {
        method: 'PUT',
        body: JSON.stringify(invalidData),
      });

      const response = await PUT(request);

      expect(response.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error('Authentication required'));

      const request = new NextRequest('http://localhost/api/preferences', {
        method: 'PUT',
        body: JSON.stringify({ theme: 'dark' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
