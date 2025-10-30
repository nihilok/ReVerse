# Verse to ReVerse Migration Guide

This document provides a comprehensive guide for the migration of the Verse Bible reader application from React + FastAPI to full-stack NextJS.

## Overview

**Original Repository**: https://github.com/nihilok/Verse  
**Target Repository**: https://github.com/nihilok/ReVerse  
**Status**: Phase 2 in progress

## Migration Progress

### ✅ Phase 1: Foundation & Infrastructure (COMPLETE)

#### Database Schema
Created Drizzle ORM schemas for all entities:
- **insights** - AI-generated passage insights with user association
- **chats** + **chatMessages** - Chat conversations and messages
- **savedPassages** - User bookmarks with notes
- **userPreferences** - User settings (translation, theme, font size)

All schemas include:
- Soft delete support (`deletedAt` timestamp)
- User foreign keys with cascade delete
- Proper indexing for common queries
- UUID primary keys

#### Domain Types
Created type-safe domain models in `src/domain/bible.types.ts`:
- `BibleVerse` - Individual verse structure
- `BiblePassage` - Collection of verses
- `PassageQuery` - Query parameters
- `InsightData` - AI insight structure
- `ChatMessageData` - Chat message structure

#### Utilities
**Bible Structure** (`src/lib/utils/bible-structure.ts`):
- 66 books of Protestant canon with chapter counts
- Navigation helpers (getNextChapter, getPreviousChapter)
- Reference parsing and building
- Book name normalization

#### Service Layer
Implemented complete service layer:

**BibleService** (`src/lib/services/bible-service.ts`):
- Integrates with HelloAO Bible API
- Fetches verses, passages, and chapters
- Supports multiple translations (WEB, KJV, BSB, LSV, etc.)
- Implements caching strategy (1 hour revalidation)

**AIService** (`src/lib/services/ai-service.ts`):
- Integrates with Anthropic Claude AI (Sonnet 4)
- Generates structured insights (historical, theological, practical)
- Handles chat responses with context
- Generates chat titles automatically

**InsightsService** (`src/lib/services/insights-service.ts`):
- Manages user insights with caching
- Checks for existing insights before generating new ones
- Supports favorites and soft delete
- User-scoped operations

**ChatService** (`src/lib/services/chat-service.ts`):
- Manages chat sessions and messages
- Supports insight-linked and standalone chats
- Maintains conversation history
- User-scoped operations

### 🔄 Phase 2: Core Components (IN PROGRESS)

#### UI Components (COMPLETE)
Ported shadcn/ui components from original Verse:
- `tabs.tsx` - Tabbed interface with Radix UI
- `dialog.tsx` - Modal dialogs
- `select.tsx` - Dropdown selects
- `label.tsx` - Form labels
- `input.tsx` - Text inputs
- `button.tsx` - Buttons with variants
- `card.tsx` - Content cards
- `badge.tsx` - Status badges

Created utility:
- `cn.ts` - className merging utility

#### Next Steps
1. **Bible Components**:
   - PassageSearch - Search form for books/chapters/verses
   - BibleReader - Main passage display with verse selection
   - VerseDisplay - Individual verse rendering
   - ChapterNavigation - Prev/Next chapter buttons

2. **Insights Components**:
   - InsightsModal - Display insights in modal with tabs
   - InsightsPanel - Alternative panel view
   - InsightsList - History of user's insights
   - InsightCard - Individual insight card

3. **Chat Components**:
   - ChatModal - Chat interface modal
   - ChatInterface - Message display + input
   - ChatMessage - Individual message with markdown
   - ChatList - Chat history list

4. **Layout Components**:
   - AppSidebar - Collapsible sidebar with tabs
   - AppHeader - Top navigation with auth
   - ThemeToggle - Dark/light mode toggle

### 📋 Phase 3: API Routes & Server Actions (TODO)

#### API Routes to Create
```
/api/bible/passage - GET passage by book/chapter/verses
/api/bible/chapter - GET entire chapter
/api/insights - GET list, POST create
/api/insights/[id] - GET single, PATCH update, DELETE
/api/chat - GET list, POST create
/api/chat/[id] - GET single, DELETE
/api/chat/[id]/message - POST send message
```

#### Server Actions to Create
```typescript
// actions/bible.ts
- fetchPassage()
- savePassageBookmark()

// actions/insights.ts
- generateInsight()
- toggleInsightFavorite()
- deleteInsight()

// actions/chat.ts
- createChat()
- sendChatMessage()
- deleteChat()
```

### 🎯 Phase 4: Pages & Routing (TODO)

#### Pages to Create
```
/ - Main Bible reader (public, enhanced for authenticated users)
/history/insights - User's insights history (protected)
/history/chats - User's chat history (protected)
/settings - User preferences (protected)
```

#### Layouts
- Root layout with Better Auth integration
- Main layout with sidebar and header
- Auth layouts for login/signup

### ✨ Phase 5: User Features & Polish (TODO)

- Text selection tooltip for quick actions
- Chapter navigation (prev/next)
- Favorites and bookmarks
- Theme toggle (dark/light mode)
- PWA capabilities (manifest, service worker)
- Responsive design for mobile

### 🧪 Phase 6: Testing & Documentation (TODO)

- Service layer tests
- API route tests
- Component tests
- Integration tests
- E2E tests
- Documentation updates
- Security review with CodeQL

## Technical Details

### Dependencies Added
```json
{
  "@anthropic-ai/sdk": "^latest",
  "react-markdown": "^latest",
  "remark-gfm": "^latest",
  "lucide-react": "^latest",
  "class-variance-authority": "^latest",
  "clsx": "^latest",
  "tailwind-merge": "^latest",
  "@radix-ui/react-tabs": "^latest",
  "@radix-ui/react-dialog": "^latest",
  "@radix-ui/react-select": "^latest",
  "@radix-ui/react-label": "^latest"
}
```

### Environment Variables Required
```env
# Database
DATABASE_URL=postgresql://...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Better Auth (already configured)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
```

### Database Migration
After schema changes, run:
```bash
npm run db:push
```

## Reference Implementation

The original Verse application is available in `/tmp/Verse/` for reference:
- **Frontend**: `/tmp/Verse/frontend/src/components/`
- **Backend**: `/tmp/Verse/backend/app/`
- **API Routes**: `/tmp/Verse/backend/app/api/routes.py`

## Key Design Decisions

1. **User Association**: All content (insights, chats, passages) is linked to users
2. **Soft Delete**: All entities support soft delete for data recovery
3. **Caching Strategy**: 
   - Bible passages: 1 hour (immutable data)
   - Insights: Cached per user+passage combination
   - Chat: No caching (real-time)
4. **AI Model**: Claude Sonnet 4 for quality and context length
5. **Database**: PostgreSQL with Drizzle ORM for type safety
6. **UI Framework**: Radix UI + Tailwind for accessibility and styling

## Testing Strategy

- **Unit Tests**: Service layer business logic
- **Component Tests**: React components with Testing Library
- **Integration Tests**: API routes with in-memory database
- **E2E Tests**: Critical user flows (read passage, generate insight, chat)

## Security Considerations

- All user operations verify ownership
- API routes require authentication
- Soft delete prevents data loss
- Input validation with Zod schemas
- Rate limiting on AI endpoints (TODO)
- SQL injection prevention via ORM

## Performance Optimizations

- Bible passage caching (1 hour)
- Insight caching (per user+passage)
- Server components for initial page load
- Streaming responses for AI chat
- Database indexing on common queries
- Image optimization for PWA icons

## Known Issues & Limitations

1. No rate limiting on AI endpoints yet
2. No pagination on chat messages
3. No full-text search on passages
4. No offline support yet (PWA TODO)
5. No multi-language UI support

## Future Enhancements

- Reading plans
- Verse of the day
- Social features (share insights)
- Advanced search (concordance)
- Audio Bible integration
- Study notes and highlighting
- Cross-references
- Subscription model for premium features

## Support

For questions or issues, please refer to:
- Original Verse repo: https://github.com/nihilok/Verse
- Issue tracker: https://github.com/nihilok/ReVerse/issues
- Documentation: `/docs/` directory
