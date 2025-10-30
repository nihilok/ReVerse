# Copilot Instructions for ReVerse Repository

## Repository Overview
ReVerse is a NextJS Full Stack Bible Reading Application with AI-powered insights and chat features. It's built on a modern tech stack with user authentication and personalized features.

## Development Guidelines

### Technology Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript/JavaScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth for email/password authentication
- **AI Integration**: Anthropic Claude AI (Sonnet 4.5) for insights and chat
- **Bible API**: HelloAO Bible API for scripture content
- **Testing**: Vitest with Testing Library
- **Type**: Full-stack Bible reading application with AI features

### Code Style and Standards
- Follow Next.js best practices and conventions
- Use TypeScript for type safety when applicable
- Follow modern ES6+ JavaScript syntax
- Maintain consistent code formatting throughout the project

### Project Structure
- Follow Next.js standard directory structure
- Keep components modular and reusable
- Separate concerns between client and server code
- Use appropriate Next.js features (App Router, Server Components, etc.)

### Development Practices
- Write clean, maintainable, and well-documented code
- Follow React and Next.js best practices
- Ensure responsive design for all UI components
- Optimize for performance and SEO
- Handle errors gracefully with proper error boundaries

### Testing
- Use Vitest as the testing framework (not Jest)
- Write comprehensive unit, component, and integration tests
- Use Testing Library for component testing
- Mock external dependencies with vi.fn() from Vitest
- Write tests for critical functionality including use cases and domain logic
- Ensure components are testable and follow best practices
- Test both client and server-side code when applicable
- Use in-memory mocks for integration tests

### Dependencies
- Keep dependencies up to date
- Prefer well-maintained and widely-used packages
- Document any significant dependencies and their purpose

### Documentation
- Maintain clear and concise README documentation
- Document any setup steps or configuration requirements
- Provide examples for common use cases
- Keep inline code comments for complex logic

## Domain-Specific Guidelines

### Bible Application Features
- **Bible Structure**: Support 66 books of Protestant canon with proper chapter/verse structure
- **Translations**: Support multiple Bible translations (WEB, KJV, BSB, LSV, etc.)
- **Text Selection**: Allow users to select text for generating insights or starting chats
- **Insights**: AI-generated analysis with three categories:
  - Historical Context
  - Theological Significance
  - Practical Application
- **Chat Features**: Support both insight-linked chats and standalone Bible Q&A
- **User Context**: All insights, chats, and bookmarks are user-specific
- **Caching Strategy**: Cache Bible text aggressively (immutable), cache insights per user+passage

### AI Integration Best Practices
- Use structured prompts for consistent AI output
- Implement proper error handling and retry logic
- Monitor token usage and implement limits if needed
- Parse AI responses carefully with fallback handling
- Provide context (passage reference, text) in all AI requests

### Bible API Integration
- Cache Bible text responses (they don't change)
- Normalize book names (handle variants like "1 Samuel" vs "1Sam")
- Build proper verse references (e.g., "John 3:16-17")
- Handle chapter and verse range queries
- Support multiple translations

## Copilot Usage Guidelines
When assisting with this repository:
- Respect the Next.js framework conventions
- Maintain consistency with existing code patterns
- Provide modern, up-to-date solutions
- Consider both development and production environments
- Ensure accessibility standards are met
- Follow security best practices
- Keep AI prompts and Bible references consistent
- Test with real Bible passages when possible
- Respect user privacy and data segregation
