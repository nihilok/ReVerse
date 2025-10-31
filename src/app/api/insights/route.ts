import { NextRequest, NextResponse } from 'next/server';
import { insightsService } from '@/lib/services/insights-service';
import { requireAuth } from '@/lib/auth/server';
import { z } from 'zod';

const createInsightSchema = z.object({
  passageText: z.string(),
  passageReference: z.string(),
});

const listInsightsSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().min(0).optional(),
  favoriteOnly: z.boolean().optional(),
});

// GET /api/insights - List user's insights
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const params = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined,
      favoriteOnly: searchParams.get('favoriteOnly') === 'true',
    };

    const validatedParams = listInsightsSchema.parse(params);
    const insights = await insightsService.getUserInsights(user.id, validatedParams);

    return NextResponse.json(insights);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/insights - Create/get insight
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validatedData = createInsightSchema.parse(body);
    
    // Check if we should prompt for passkey BEFORE creating the insight
    const { shouldPromptForPasskey, createPasskeyPromptResponse } = await import('@/lib/auth/check-prompt-passkey');
    const shouldPrompt = await shouldPromptForPasskey(
      user.id,
      user.isAnonymous ?? false,
      'save_insight'
    );
    
    const insight = await insightsService.getOrCreateInsight({
      userId: user.id,
      passageText: validatedData.passageText,
      passageReference: validatedData.passageReference,
    });

    // Include passkey prompt in response if needed
    const response: { data: typeof insight; passkeyPrompt?: ReturnType<typeof createPasskeyPromptResponse> } = {
      data: insight,
    };

    if (shouldPrompt) {
      response.passkeyPrompt = createPasskeyPromptResponse();
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
