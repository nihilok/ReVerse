import { db } from '@/infrastructure/database/client';
import { chats, chatMessages } from '@/infrastructure/database/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { aiService } from './ai-service';
import { insightsService } from './insights-service';
import type { Chat, ChatMessage } from '@/infrastructure/database/schema';
import type { ChatMessageData } from '@/domain/bible.types';

interface CreateChatParams {
  userId: string;
  firstMessage: string;
  passageText?: string;
  passageReference?: string;
  insightId?: string;
}

interface SendMessageParams {
  userId: string;
  chatId: string;
  message: string;
}

/**
 * Service for managing chat conversations
 */
class ChatService {
  /**
   * Create a new chat session
   */
  async createChat(params: CreateChatParams): Promise<{
    chat: Chat;
    userMessage: ChatMessage;
    aiMessage: ChatMessage;
  }> {
    const { userId, firstMessage, passageText, passageReference, insightId } = params;
    
    // Generate title from first message
    const title = await aiService.generateChatTitle(firstMessage);
    
    // Create chat
    const [chat] = await db.insert(chats).values({
      userId,
      title,
      passageReference: passageReference || null,
      passageText: passageText || null,
      insightId: insightId || null,
    }).returning();
    
    // Add user message
    const [userMessage] = await db.insert(chatMessages).values({
      chatId: chat.id,
      role: 'user',
      content: firstMessage,
    }).returning();
    
    // Generate AI response
    let aiResponse: string;
    
    if (insightId) {
      // Chat linked to insight - get insight context
      const insight = await insightsService.getInsightById(userId, insightId);
      if (!insight) {
        throw new Error('Insight not found');
      }
      
      aiResponse = await aiService.generateChatResponse(firstMessage, {
        passageText: insight.passageText,
        passageReference: insight.passageReference,
        insight: {
          historicalContext: insight.historicalContext,
          theologicalSignificance: insight.theologicalSignificance,
          practicalApplication: insight.practicalApplication,
        },
        chatHistory: [],
      });
    } else if (passageText && passageReference) {
      // Standalone chat with passage context
      aiResponse = await aiService.generateStandaloneChatResponse(
        firstMessage,
        [],
        { passageText, passageReference }
      );
    } else {
      // Standalone chat without passage context
      aiResponse = await aiService.generateStandaloneChatResponse(firstMessage);
    }
    
    // Save AI response
    const [aiMessage] = await db.insert(chatMessages).values({
      chatId: chat.id,
      role: 'assistant',
      content: aiResponse,
    }).returning();
    
    return { chat, userMessage, aiMessage };
  }
  
  /**
   * Send a message in an existing chat
   */
  async sendMessage(params: SendMessageParams): Promise<{
    userMessage: ChatMessage;
    aiMessage: ChatMessage;
  }> {
    const { userId, chatId, message } = params;
    
    // Verify chat ownership
    const chat = await this.getChatById(userId, chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    // Get chat history
    const history = await this.getChatMessages(chatId);
    
    // Add user message
    const [userMessage] = await db.insert(chatMessages).values({
      chatId,
      role: 'user',
      content: message,
    }).returning();
    
    // Prepare chat history for AI
    const chatHistory: ChatMessageData[] = history.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
    
    // Generate AI response
    let aiResponse: string;
    
    if (chat.insightId) {
      // Chat linked to insight
      const insight = await insightsService.getInsightById(userId, chat.insightId);
      if (!insight) {
        throw new Error('Insight not found');
      }
      
      aiResponse = await aiService.generateChatResponse(message, {
        passageText: insight.passageText,
        passageReference: insight.passageReference,
        insight: {
          historicalContext: insight.historicalContext,
          theologicalSignificance: insight.theologicalSignificance,
          practicalApplication: insight.practicalApplication,
        },
        chatHistory,
      });
    } else if (chat.passageText && chat.passageReference) {
      // Standalone chat with passage context
      aiResponse = await aiService.generateStandaloneChatResponse(
        message,
        chatHistory,
        {
          passageText: chat.passageText,
          passageReference: chat.passageReference,
        }
      );
    } else {
      // Standalone chat without passage context
      aiResponse = await aiService.generateStandaloneChatResponse(message, chatHistory);
    }
    
    // Save AI response
    const [aiMessage] = await db.insert(chatMessages).values({
      chatId,
      role: 'assistant',
      content: aiResponse,
    }).returning();
    
    // Update chat timestamp
    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, chatId));
    
    return { userMessage, aiMessage };
  }
  
  /**
   * Get chat by ID
   */
  async getChatById(userId: string, chatId: string): Promise<Chat | null> {
    const result = await db.query.chats.findFirst({
      where: and(
        eq(chats.id, chatId),
        eq(chats.userId, userId),
        isNull(chats.deletedAt)
      ),
    });
    
    return result || null;
  }
  
  /**
   * Get chat messages
   */
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    return await db.query.chatMessages.findMany({
      where: and(
        eq(chatMessages.chatId, chatId),
        isNull(chatMessages.deletedAt)
      ),
      orderBy: [chatMessages.createdAt],
    });
  }
  
  /**
   * Get user's chats with message counts
   */
  async getUserChats(userId: string, limit: number = 50): Promise<Array<Chat & { messageCount: number }>> {
    const userChats = await db.query.chats.findMany({
      where: and(
        eq(chats.userId, userId),
        isNull(chats.deletedAt)
      ),
      orderBy: [desc(chats.updatedAt)],
      limit,
    });

    // Get message counts for each chat
    return await Promise.all(
      userChats.map(async (chat) => {
        const messages = await db.query.chatMessages.findMany({
          where: and(
            eq(chatMessages.chatId, chat.id),
            isNull(chatMessages.deletedAt)
          ),
        });
        return {
          ...chat,
          messageCount: messages.length,
        };
      })
    );
  }
  
  /**
   * Delete a chat (soft delete)
   */
  async deleteChat(userId: string, chatId: string): Promise<void> {
    // Verify ownership
    const chat = await this.getChatById(userId, chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    // Soft delete chat and its messages
    await db.transaction(async (tx) => {
      await tx
        .update(chats)
        .set({ deletedAt: new Date() })
        .where(eq(chats.id, chatId));
      
      await tx
        .update(chatMessages)
        .set({ deletedAt: new Date() })
        .where(eq(chatMessages.chatId, chatId));
    });
  }
}

// Singleton instance
export const chatService = new ChatService();
