import { db } from '@/infrastructure/database/client';
import { insights } from '@/infrastructure/database/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { aiService } from './ai-service';
import type { Insight } from '@/infrastructure/database/schema';

interface CreateInsightParams {
  userId: string;
  passageText: string;
  passageReference: string;
}

interface GetInsightsOptions {
  limit?: number;
  offset?: number;
  favoriteOnly?: boolean;
}

/**
 * Service for managing user insights
 */
class InsightsService {
  /**
   * Get or create an insight (caching strategy)
   */
  async getOrCreateInsight(params: CreateInsightParams): Promise<Insight> {
    const { userId, passageText, passageReference } = params;
    
    // Check if insight already exists for this user and passage
    const existing = await db.query.insights.findFirst({
      where: and(
        eq(insights.userId, userId),
        eq(insights.passageReference, passageReference),
        eq(insights.passageText, passageText),
        isNull(insights.deletedAt)
      ),
    });
    
    if (existing) {
      return existing;
    }
    
    // Generate new insight using AI
    const insightData = await aiService.generateInsight({
      passageText,
      passageReference,
    });
    
    // Save to database
    const [newInsight] = await db.insert(insights).values({
      userId,
      passageText,
      passageReference,
      historicalContext: insightData.historicalContext,
      theologicalSignificance: insightData.theologicalSignificance,
      practicalApplication: insightData.practicalApplication,
      isFavorite: false,
    }).returning();
    
    return newInsight;
  }
  
  /**
   * Get user's insights with options
   */
  async getUserInsights(userId: string, options: GetInsightsOptions = {}): Promise<Insight[]> {
    const { limit = 50, offset = 0, favoriteOnly = false } = options;
    
    const conditions = [
      eq(insights.userId, userId),
      isNull(insights.deletedAt),
    ];
    
    if (favoriteOnly) {
      conditions.push(eq(insights.isFavorite, true));
    }
    
    return await db.query.insights.findMany({
      where: and(...conditions),
      orderBy: [desc(insights.createdAt)],
      limit,
      offset,
    });
  }
  
  /**
   * Get a single insight by ID
   */
  async getInsightById(userId: string, insightId: string): Promise<Insight | null> {
    const result = await db.query.insights.findFirst({
      where: and(
        eq(insights.id, insightId),
        eq(insights.userId, userId),
        isNull(insights.deletedAt)
      ),
    });
    
    return result || null;
  }
  
  /**
   * Toggle favorite status
   */
  async toggleFavorite(userId: string, insightId: string): Promise<Insight> {
    // First get the insight
    const insight = await this.getInsightById(userId, insightId);
    if (!insight) {
      throw new Error('Insight not found');
    }
    
    // Toggle favorite
    const [updated] = await db
      .update(insights)
      .set({
        isFavorite: !insight.isFavorite,
        updatedAt: new Date(),
      })
      .where(and(
        eq(insights.id, insightId),
        eq(insights.userId, userId)
      ))
      .returning();
    
    return updated;
  }
  
  /**
   * Delete an insight (soft delete)
   */
  async deleteInsight(userId: string, insightId: string): Promise<void> {
    // Verify ownership
    const insight = await this.getInsightById(userId, insightId);
    if (!insight) {
      throw new Error('Insight not found');
    }
    
    // Soft delete
    await db
      .update(insights)
      .set({ deletedAt: new Date() })
      .where(and(
        eq(insights.id, insightId),
        eq(insights.userId, userId)
      ));
  }
}

// Singleton instance
export const insightsService = new InsightsService();
