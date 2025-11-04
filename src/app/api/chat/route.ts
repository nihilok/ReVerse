import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/services/chat-service';
import { requireAuth, requireFullAuth } from '@/lib/auth/server';
import { z } from 'zod';
import { shouldPromptForPasskey, createPasskeyPromptResponse } from '@/lib/auth/check-prompt-passkey';
import { debugLog } from '@/lib/debug';

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
  const startTime = Date.now();
  const method = request.method;
  const path = request.nextUrl.pathname;
  
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const params = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
    };

    const validatedParams = listChatsSchema.parse(params);
    const chats = await chatService.getUserChats(user.id, validatedParams.limit);

    const duration = Date.now() - startTime;
    debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
      duration,
      status: 200,
    });
    
    return NextResponse.json(chats);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof Error && error.message === 'Authentication required') {
      debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
        duration,
        status: 401,
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (error instanceof Error) {
      debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
        duration,
        status: 400,
      });
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
      duration,
      status: 500,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/chat - Create new chat
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const method = request.method;
  const path = request.nextUrl.pathname;
  
  try {
    // Use requireFullAuth to get isAnonymous field for passkey prompt check
    const user = await requireFullAuth();
    const body = await request.json();
    const validatedData = createChatSchema.parse(body);

    // Check if we should prompt for passkey BEFORE creating the chat
    const shouldPrompt = await shouldPromptForPasskey(
      user.id,
      user.isAnonymous,
      'save_chat'
    );

    const result = await chatService.createChat({
      userId: user.id,
      firstMessage: validatedData.firstMessage,
      passageText: validatedData.passageText,
      passageReference: validatedData.passageReference,
      insightId: validatedData.insightId,
    });

    // Include passkey prompt in response if needed
    const response: { data: typeof result; passkeyPrompt?: ReturnType<typeof createPasskeyPromptResponse> } = {
      data: result,
    };

    if (shouldPrompt) {
      response.passkeyPrompt = createPasskeyPromptResponse();
    }

    const duration = Date.now() - startTime;
    debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
      duration,
      status: 201,
    });
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof Error && error.message === 'Authentication required') {
      debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
        duration,
        status: 401,
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (error instanceof Error) {
      debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
        duration,
        status: 400,
      });
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
      duration,
      status: 500,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
