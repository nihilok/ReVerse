import { NextRequest, NextResponse } from 'next/server';
import { insightsService } from '@/lib/services/insights-service';
import { requireAuth, requireFullAuth } from '@/lib/auth/server';
import { z } from 'zod';
import { shouldPromptForPasskey, createPasskeyPromptResponse } from '@/lib/auth/check-prompt-passkey';
import { createApiLogger } from '@/lib/api-logger';

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
  const { logResponse } = createApiLogger(request);
  
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

    logResponse(200);
    return NextResponse.json(insights);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      logResponse(401);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (error instanceof Error) {
      logResponse(400);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    logResponse(500);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/insights - Create/get insight
export async function POST(request: NextRequest) {
  const { logResponse } = createApiLogger(request);
  
  try {
    // Use requireFullAuth to get isAnonymous field for passkey prompt check
    const user = await requireFullAuth();
    const body = await request.json();
    const validatedData = createInsightSchema.parse(body);

    // Check if we should prompt for passkey BEFORE creating the insight
    const shouldPrompt = await shouldPromptForPasskey(
      user.id,
      user.isAnonymous,
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

    logResponse(201);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      logResponse(401);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (error instanceof Error) {
      logResponse(400);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    logResponse(500);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
