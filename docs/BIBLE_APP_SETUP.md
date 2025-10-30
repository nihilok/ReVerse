# Bible App Setup Guide

This guide will help you set up the ReVerse Bible reading application after the initial migration work.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running (via Docker or local)
- Anthropic API key for Claude AI

## Environment Setup

1. **Copy environment template**:
```bash
cp .env.example .env.local
```

2. **Configure environment variables**:
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/reverse

# Better Auth (already configured)
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000

# AI Service
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

3. **Get an Anthropic API key**:
   - Go to https://console.anthropic.com/
   - Create an account or sign in
   - Generate an API key
   - Add it to `.env.local`

## Database Setup

1. **Start PostgreSQL** (if using Docker):
```bash
docker-compose up postgres -d
```

2. **Push database schema**:
```bash
npm run db:push
```

This will create all the necessary tables:
- `users`, `sessions`, `accounts` (Better Auth)
- `insights` - AI-generated Bible passage insights
- `chats`, `chat_messages` - Chat conversations
- `saved_passages` - User bookmarks
- `user_preferences` - User settings

3. **Verify tables** (optional):
```bash
npm run db:studio
```

## Running the Application

1. **Install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm run dev
```

3. **Open browser**:
Navigate to http://localhost:3000

## Features Implemented

### ✅ Backend Infrastructure
- **Database Schema**: Complete schema for all Bible app entities
- **Service Layer**: 
  - Bible API integration (HelloAO)
  - Claude AI integration for insights and chat
  - Insights management with caching
  - Chat session management
- **Domain Types**: Type-safe models for verses, passages, insights, chats
- **Utilities**: Bible structure (66 books), reference parsing, navigation

### ✅ UI Components
- **shadcn/ui Components**: Tabs, Dialog, Select, Label, Input, Button, Card, Badge
- **Utilities**: `cn()` for className merging

### 🔄 In Progress
- **Bible Reader Components**: PassageSearch, BibleReader, VerseDisplay
- **Insights Components**: InsightsModal, InsightsPanel, InsightsList
- **Chat Components**: ChatModal, ChatInterface, ChatMessage
- **Layout Components**: AppSidebar, AppHeader, ThemeToggle

### 📋 TODO
- **API Routes**: REST endpoints for Bible, Insights, Chat
- **Pages**: Main reader, history pages, settings
- **Features**: Text selection, navigation, favorites, theme toggle
- **Testing**: Unit tests for services and components

## API Reference

### Bible Service
```typescript
import { bibleService } from '@/lib/services/bible-service';

// Get a single verse
const verse = await bibleService.getVerse('John', 3, 16, 'WEB');

// Get a passage range
const passage = await bibleService.getPassage({
  book: 'John',
  chapter: 3,
  verseStart: 16,
  verseEnd: 17,
  translation: 'WEB'
});

// Get entire chapter
const chapter = await bibleService.getChapter('John', 3, 'WEB');
```

### AI Service
```typescript
import { aiService } from '@/lib/services/ai-service';

// Generate insights
const insights = await aiService.generateInsight({
  passageText: 'For God so loved the world...',
  passageReference: 'John 3:16'
});

// Generate chat response
const response = await aiService.generateChatResponse(
  'What does this passage mean?',
  {
    passageText: '...',
    passageReference: 'John 3:16',
    chatHistory: []
  }
);
```

### Insights Service
```typescript
import { insightsService } from '@/lib/services/insights-service';

// Get or create insight (with caching)
const insight = await insightsService.getOrCreateInsight({
  userId: 'user-id',
  passageText: '...',
  passageReference: 'John 3:16'
});

// Get user's insights
const insights = await insightsService.getUserInsights('user-id', {
  limit: 50,
  favoriteOnly: false
});

// Toggle favorite
await insightsService.toggleFavorite('user-id', 'insight-id');
```

### Chat Service
```typescript
import { chatService } from '@/lib/services/chat-service';

// Create new chat
const { chat, userMessage, aiMessage } = await chatService.createChat({
  userId: 'user-id',
  firstMessage: 'What does this passage mean?',
  passageText: '...',
  passageReference: 'John 3:16'
});

// Send message
const { userMessage, aiMessage } = await chatService.sendMessage({
  userId: 'user-id',
  chatId: 'chat-id',
  message: 'Can you explain more?'
});
```

## Bible Structure

The app supports 66 books of the Protestant canon:

**Old Testament**: Genesis through Malachi (39 books)  
**New Testament**: Matthew through Revelation (27 books)

### Translations Supported
- **WEB** - World English Bible (default)
- **KJV** - King James Version
- **BSB** - Berean Standard Bible
- **LSV** - Literal Standard Version
- **NET** - New English Translation
- **ASV** - American Standard Version

### Reference Format
- Single verse: `John 3:16`
- Verse range: `John 3:16-17`
- Entire chapter: `John 3`
- Multiple chapters: Requires separate requests

## Utilities

### Bible Structure
```typescript
import { 
  BIBLE_BOOKS,
  getBookInfo,
  getNextChapter,
  getPreviousChapter,
  buildReference,
  parseReference
} from '@/lib/utils/bible-structure';

// Get book info
const john = getBookInfo('John'); // { name: 'John', chapters: 21 }

// Navigate chapters
const next = getNextChapter('John', 3); // { book: 'John', chapter: 4 }
const prev = getPreviousChapter('John', 3); // { book: 'John', chapter: 2 }

// Build reference
const ref = buildReference('John', 3, 16, 17); // 'John 3:16-17'

// Parse reference
const parsed = parseReference('John 3:16-17');
// { book: 'John', chapter: 3, verseStart: 16, verseEnd: 17 }
```

## Development Workflow

1. **Make schema changes**:
   - Edit files in `src/infrastructure/database/schema/`
   - Run `npm run db:push` to update database

2. **Create services**:
   - Add business logic in `src/lib/services/`
   - Use existing services as reference

3. **Create components**:
   - Add React components in `src/components/`
   - Use shadcn/ui components from `src/components/ui/`

4. **Create API routes**:
   - Add routes in `src/app/api/`
   - Integrate with services

5. **Create pages**:
   - Add pages in `src/app/`
   - Use Server Components where possible

6. **Test**:
   - Write tests in `__tests__/` directories
   - Run `npm test` to verify

7. **Lint**:
   - Run `npm run lint` before committing
   - Fix any issues

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# View logs
docker-compose logs postgres
```

### API Key Issues
- Verify `ANTHROPIC_API_KEY` is set in `.env.local`
- Check API key is valid at https://console.anthropic.com/
- Ensure key has sufficient credits

### Build Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## Next Steps

1. **Complete UI Components**: Create Bible reader, Insights, and Chat components
2. **Create API Routes**: Implement REST endpoints
3. **Build Pages**: Main reader, history, settings
4. **Add Features**: Text selection, navigation, favorites
5. **Write Tests**: Unit and integration tests
6. **Polish UI**: Responsive design, theme toggle, PWA

## Resources

- **Original Verse Repo**: https://github.com/nihilok/Verse
- **NextJS Docs**: https://nextjs.org/docs
- **Drizzle ORM**: https://orm.drizzle.team/
- **Better Auth**: https://www.better-auth.com/
- **Anthropic Claude**: https://docs.anthropic.com/
- **HelloAO Bible API**: https://bible.helloao.org/api
- **Radix UI**: https://www.radix-ui.com/

## Support

For issues or questions:
1. Check the [Migration Guide](./MIGRATION_GUIDE.md)
2. Review [Architecture docs](./architecture.md)
3. Check original Verse implementation in `/tmp/Verse/`
4. Open an issue on GitHub
