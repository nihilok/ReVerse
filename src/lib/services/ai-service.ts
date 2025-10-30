import Anthropic from '@anthropic-ai/sdk';
import type { InsightData, ChatMessageData } from '@/domain/bible.types';

interface InsightRequest {
  passageText: string;
  passageReference: string;
}

interface ChatContext {
  passageText: string;
  passageReference: string;
  insight?: InsightData;
  chatHistory: ChatMessageData[];
}

/**
 * AI service for generating insights and chat responses using Claude
 */
class AIService {
  private client: Anthropic;
  
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  
  /**
   * Parse structured insights from Claude response
   */
  private parseInsights(content: string): InsightData {
    const insights: InsightData = {
      historicalContext: '',
      theologicalSignificance: '',
      practicalApplication: '',
    };
    
    // Split by markers
    const parts = content.split('HISTORICAL_CONTEXT:');
    if (parts.length > 1) {
      let remaining = parts[1];
      const theoParts = remaining.split('THEOLOGICAL_SIGNIFICANCE:');
      
      if (theoParts.length > 1) {
        insights.historicalContext = theoParts[0].trim();
        remaining = theoParts[1];
        
        const pracParts = remaining.split('PRACTICAL_APPLICATION:');
        if (pracParts.length > 1) {
          insights.theologicalSignificance = pracParts[0].trim();
          insights.practicalApplication = pracParts[1].trim();
        } else {
          insights.theologicalSignificance = remaining.trim();
        }
      }
    }
    
    // Fallback: if parsing failed, try to extract meaningful content
    if (!insights.historicalContext && !insights.theologicalSignificance && !insights.practicalApplication) {
      // Just return the whole content in historical context
      insights.historicalContext = content;
      insights.theologicalSignificance = 'See historical context above.';
      insights.practicalApplication = 'See historical context above.';
    }
    
    return insights;
  }
  
  /**
   * Build prompt for generating insights
   */
  private buildInsightPrompt(request: InsightRequest): string {
    return `You are a biblical scholar and theologian. Analyze the following Bible passage and provide insights in three categories:

Passage Reference: ${request.passageReference}
Passage Text: ${request.passageText}

Please provide:
1. Historical Context: The historical background, cultural setting, and when/why this was written
2. Theological Significance: The theological themes, doctrines, and spiritual meaning
3. Practical Application: How this passage applies to modern life and practical ways to apply its teachings

Format your response as follows:
HISTORICAL_CONTEXT: [your analysis]
THEOLOGICAL_SIGNIFICANCE: [your analysis]
PRACTICAL_APPLICATION: [your analysis]`;
  }
  
  /**
   * Generate insights for a Bible passage
   */
  async generateInsight(request: InsightRequest): Promise<InsightData> {
    try {
      const prompt = this.buildInsightPrompt(request);
      
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      
      // Extract text from response
      const content = Array.isArray(message.content) && message.content.length > 0 ? message.content[0] : undefined;
      const text = content && content.type === 'text' ? content.text : '';
      
      return this.parseInsights(text);
    } catch (error) {
      console.error('Error generating insights:', error);
      throw new Error('Failed to generate insights');
    }
  }
  
  /**
   * Build system prompt for chat with insight context
   */
  private buildChatSystemPrompt(context: ChatContext): string {
    const { passageReference, passageText, insight } = context;
    
    // Truncate text to avoid token limits
    const maxTextLength = 2000;
    const truncatedPassage = passageText.length > maxTextLength
      ? passageText.substring(0, maxTextLength) + '...'
      : passageText;
    const truncatedReference = passageReference.substring(0, 200);
    
    if (insight) {
      return `You are a knowledgeable biblical scholar and theologian having a conversation about a Bible passage.

Passage Reference: ${truncatedReference}
Passage Text: ${truncatedPassage}

You previously provided these insights:
- Historical Context: ${insight.historicalContext.substring(0, 1000)}
- Theological Significance: ${insight.theologicalSignificance.substring(0, 1000)}
- Practical Application: ${insight.practicalApplication.substring(0, 1000)}

Continue the conversation by answering the user's questions thoughtfully and in depth. Draw from biblical scholarship, theology, and practical wisdom. Keep your responses focused and relevant to the passage and previous insights.`;
    } else {
      return `You are a knowledgeable biblical scholar and theologian having a conversation about a Bible passage.

Passage Reference: ${truncatedReference}
Passage Text: ${truncatedPassage}

Answer questions thoughtfully and in depth. Draw from biblical scholarship, theology, and practical wisdom.`;
    }
  }
  
  /**
   * Generate chat response with context
   */
  async generateChatResponse(message: string, context: ChatContext): Promise<string> {
    try {
      const systemPrompt = this.buildChatSystemPrompt(context);
      
      // Build messages array
      const messages: Anthropic.MessageParam[] = [];
      
      // Add chat history
      for (const msg of context.chatHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
      
      // Add current user message
      messages.push({
        role: 'user',
        content: message,
      });
      
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages,
      });
      
      // Extract text from response
      const content = response.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw new Error('Failed to generate chat response');
    }
  }
  
  /**
   * Generate standalone chat response (no insight context)
   */
  async generateStandaloneChatResponse(
    message: string,
    chatHistory: ChatMessageData[] = [],
    passageContext?: { passageText: string; passageReference: string }
  ): Promise<string> {
    try {
      let systemPrompt = `You are a knowledgeable biblical scholar and theologian having a conversation. 
Answer questions about the Bible, theology, and faith thoughtfully and in depth. Draw from biblical scholarship, 
theology, and practical wisdom.`;
      
      // Add passage context if provided
      if (passageContext) {
        const maxTextLength = 2000;
        const truncatedPassage = passageContext.passageText.length > maxTextLength
          ? passageContext.passageText.substring(0, maxTextLength) + '...'
          : passageContext.passageText;
        const truncatedReference = passageContext.passageReference.substring(0, 200);
        
        systemPrompt = `You are a knowledgeable biblical scholar and theologian having a conversation about a Bible passage.

Passage Reference: ${truncatedReference}
Passage Text: ${truncatedPassage}

Answer questions thoughtfully and in depth. Draw from biblical scholarship, theology, and practical wisdom.`;
      }
      
      // Build messages array
      const messages: Anthropic.MessageParam[] = [];
      
      // Add chat history
      for (const msg of chatHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
      
      // Add current user message
      messages.push({
        role: 'user',
        content: message,
      });
      
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages,
      });
      
      // Extract text from response
      const content = response.content && response.content.length > 0 ? response.content[0] : undefined;
      return content && content.type === 'text' ? content.text : '';
    } catch (error) {
      console.error('Error generating standalone chat response:', error);
      throw new Error('Failed to generate chat response');
    }
  }
  
  /**
   * Generate a title for a chat based on the first message
   */
  async generateChatTitle(firstMessage: string): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: `Generate a short (3-6 words) title for a conversation that starts with: "${firstMessage.substring(0, 200)}". Only respond with the title, nothing else.`,
          },
        ],
      });
      
      const content = Array.isArray(response.content) && response.content.length > 0 ? response.content[0] : undefined;
      const title = content && content.type === 'text' && typeof content.text === 'string'
        ? content.text.trim()
        : 'Bible Chat';
      
      // Remove quotes if AI added them
      return title.replace(/^["']|["']$/g, '').substring(0, 200);
    } catch (error) {
      console.error('Error generating chat title:', error);
      return 'Bible Chat';
    }
  }
}

// Singleton instance
export const aiService = new AIService();
