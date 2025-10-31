# ReVerse - NextJS Bible Reading Application

A modern, full-stack Bible reading application built with NextJS 16, featuring AI-powered insights and chat capabilities. This is a complete port of the [Verse](https://github.com/nihilok/Verse) application from React + FastAPI to NextJS.

## Features

### 📖 Bible Reading
- **66 Books** - Complete Protestant canon
- **Multiple Translations** - WEB, KJV, BSB, LSV, NET, ASV
- **Smart Navigation** - Chapter-by-chapter navigation with Previous/Next buttons
- **Verse Selection** - Select specific verses or ranges
- **Beautiful Typography** - Elegant serif fonts optimized for reading scripture

### 🤖 AI-Powered Features
- **Insights Generation** - AI-generated analysis with three categories:
  - Historical Context
  - Theological Significance  
  - Practical Application
- **Chat Interface** - Ask questions about passages and get AI responses
- **Insight History** - Browse and favorite past insights
- **Chat History** - Review previous conversations

### 🎨 Design & UX
- **Beautiful Theming** - Warm parchment-inspired design with burgundy and gold accents
- **Dark Mode** - Full dark mode support with warm brown tones
- **Responsive** - Mobile-first design that works on all devices
- **Accessible** - WCAG compliant with semantic HTML and ARIA attributes

### 🏗️ Technical Features
- 🚀 **NextJS 16** - App Router and Server Components
- 🔐 **Better Auth** - User authentication with session management
- 🗄️ **PostgreSQL** - Relational database with Drizzle ORM
- 🤖 **Claude AI** - Anthropic Claude Sonnet 4 for insights and chat
- 🧪 **Vitest** - Comprehensive testing with Testing Library
- 📝 **TypeScript** - Full type safety throughout
- 🎨 **Tailwind CSS v4** - Modern styling with custom theme
- 🔄 **CI/CD** - Automated testing and builds

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local and add:
# - ANTHROPIC_API_KEY (get from https://console.anthropic.com)
# - BETTER_AUTH_SECRET (any random 32+ character string)

# 3. Start PostgreSQL
docker-compose up postgres -d

# 4. Push schema to database
npm run db:push

# 5. Start development server
npm run dev
```

Visit [http://localhost:3000/reader](http://localhost:3000/reader) to start reading!

### First Steps
1. Navigate to `/reader` to access the Bible reader
2. Select a book, chapter, and translation
3. Click "Search" to load the passage
4. Select text to generate AI insights or start a chat

## Application Structure

### Pages
- **`/reader`** - Main Bible reading interface with sidebar
- **`/history/insights`** - Browse and manage saved insights
- **`/history/chats`** - View chat conversation history
- **`/settings`** - User preferences (translation, font size, theme)
- **`/signin`** & `/signup` - Authentication pages

### Architecture

Clean Domain-Driven Design:
- **Domain Layer** (`src/domain/`) - Bible types and validation schemas
- **Services** (`src/lib/services/`) - Bible API, AI, Insights, and Chat services
- **Infrastructure** (`src/infrastructure/`) - Database, repositories, and ORM
- **Components** (`src/components/`) - Reusable UI components organized by feature
- **API Routes** (`src/app/api/`) - RESTful endpoints for Bible, insights, and chats

### Key Components
- **BibleReader** - Main passage display with verse selection
- **PassageSearch** - Book, chapter, and translation selector
- **InsightsModal** - AI-generated insights with tabbed interface
- **ChatInterface** - Real-time chat with AI about passages
- **ThemeToggle** - Light/dark mode switcher

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── users/        # User management endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── domain/                # Domain layer (business logic & types)
│   └── user.types.ts
├── infrastructure/        # Infrastructure layer
│   ├── database/
│   │   ├── schema/       # Drizzle schema definitions
│   │   ├── migrations/   # Database migrations
│   │   ├── base-repository.ts
│   │   └── client.ts
│   └── repositories/     # Repository implementations
│       └── user.repository.ts
├── use-cases/            # Use case layer (application logic)
│   └── user/
│       ├── create-user.use-case.ts
│       ├── get-user.use-case.ts
│       ├── update-user.use-case.ts
│       └── delete-user.use-case.ts
└── lib/                  # Shared utilities
    └── auth/             # Better Auth configuration
```

## Architecture

This template follows Domain-Driven Design (DDD) principles with a functional approach:

### Layers

1. **Domain Layer** (`src/domain/`)
   - Contains business entities, types, and validation schemas
   - Pure business logic with no external dependencies

2. **Infrastructure Layer** (`src/infrastructure/`)
   - Database access and ORM configuration
   - Repository pattern implementations
   - External service integrations

3. **Use Case Layer** (`src/use-cases/`)
   - Application-specific business rules
   - Orchestrates data flow between layers
   - Input validation and error handling

4. **API Layer** (`src/app/api/`)
   - HTTP endpoint definitions
   - Request/response handling
   - Integrates use cases with HTTP layer

## Documentation

### Getting Started
- [Quick Start Guide](./docs/quick-start.md) - Get running in 5 minutes
- [Architecture Overview](./docs/architecture.md) - Understand the DDD design
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute

### Guides
- [Authentication](./src/lib/auth/README.md) - Better Auth setup and usage
- [RBAC System](./docs/rbac.md) - Role-Based Access Control implementation
- [Database](./src/infrastructure/database/README.md) - Drizzle ORM and soft-delete pattern
- [Database Schema](./src/infrastructure/database/schema/README.md) - Schema definitions
- [Use Cases](./src/use-cases/README.md) - Business logic layer
- [Docker Setup](./docs/docker.md) - Development and production Docker
- [Testing Guide](./docs/testing.md) - Testing strategy and examples

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## Database Management

### Generate Migrations

After modifying the schema files:

```bash
npm run db:generate
```

### Apply Migrations

```bash
npm run db:migrate
```

### Push Schema (Development)

For quick schema updates in development:

```bash
npm run db:push
```

## Docker

### Development

```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up postgres
```

### Production

```bash
# Build and start
docker-compose up --build app
```

## Testing

This template includes comprehensive testing with Vitest:

Run the test suite:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Test Coverage

- **Unit Tests** - Use case and domain logic
- **Component Tests** - React components with Testing Library
- **Integration Tests** - Complete user workflows

See the [Testing Guide](./docs/testing.md) for more details.

## CI/CD

The project includes GitHub Actions workflows for:

- Running tests on every push and PR
- Building Docker images
- Code quality checks (linting)

See `.github/workflows/ci.yml` for details.

## License

MIT
