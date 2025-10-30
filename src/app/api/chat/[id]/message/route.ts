import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/services/chat-service';
import { requireAuth } from '@/lib/auth/server';
import { z } from 'zod';

const sendMessageSchema = z.object({
  message: z.string(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/chat/[id]/message - Send message in chat
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id: chatId } = await params;
    const body = await request.json();

    const validatedData = sendMessageSchema.parse(body);
    const result = await chatService.sendMessage({
      userId: user.id,
      chatId,
      message: validatedData.message,
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
