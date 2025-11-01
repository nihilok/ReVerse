import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/infrastructure/database/client';
import { userPreferences } from '@/infrastructure/database/schema/user-preferences';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  defaultTranslation: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
  showVerseNumbers: z.boolean().optional(),
  autoSavePassages: z.boolean().optional(),
});

// GET /api/preferences - Get user's preferences
export async function GET() {
  try {
    const user = await requireAuth();
    
    const results = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id))
      .limit(1);

    if (results.length === 0) {
      // Return default preferences if none exist
      return NextResponse.json({
        defaultTranslation: 'WEB',
        theme: 'system',
        fontSize: 'medium',
        showVerseNumbers: true,
        autoSavePassages: true,
      });
    }

    return NextResponse.json(results[0]);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/preferences - Update user's preferences
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const validatedData = updatePreferencesSchema.parse(body);

    // Check if preferences exist
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id))
      .limit(1);

    let result;
    if (existing.length === 0) {
      // Create new preferences
      const [created] = await db
        .insert(userPreferences)
        .values({
          userId: user.id,
          ...validatedData,
        })
        .returning();
      result = created;
    } else {
      // Update existing preferences
      const [updated] = await db
        .update(userPreferences)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, user.id))
        .returning();
      result = updated;
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
