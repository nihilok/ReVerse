import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/services/chat-service';
import { requireAuth } from '@/lib/auth/server';
import { z } from 'zod';

const createChatSchema = z.object({
  firstMessage: z.string(),
  passageText: z.string().optional(),
  passageReference: z.string().optional(),
  insightId: z.string().optional(),
});

const listChatsSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
});

// GET /api/chat - List user's chats
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const params = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
    };

    const validatedParams = listChatsSchema.parse(params);
    const chats = await chatService.getUserChats(user.id, validatedParams.limit);

    return NextResponse.json(chats);
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

// POST /api/chat - Create new chat
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validatedData = createChatSchema.parse(body);
    const result = await chatService.createChat({
      userId: user.id,
      firstMessage: validatedData.firstMessage,
      passageText: validatedData.passageText,
      passageReference: validatedData.passageReference,
      insightId: validatedData.insightId,
    });

    return NextResponse.json(result, { status: 201 });
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
