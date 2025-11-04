# Debugging ReVerse

## Overview
ReVerse includes a built-in debug logging system that can be enabled via the `DEBUG` environment variable.

## Enabling Debug Logging

### During Deployment
Use the `--debug` flag when deploying:

```bash
./scripts/deploy.sh -d your-domain.com -k your-api-key --debug
```

### Manual Docker Compose
Set the `DEBUG` environment variable:

```bash
export DEBUG=true
docker compose up
```

### Development
Add to your `.env.local` file:

```bash
DEBUG=true
```

## What Gets Logged

When debug logging is enabled, you'll see detailed logs for:

### Database Operations
- Connection attempts and status
- PostgreSQL notices and warnings
- SQL queries with parameters
- Connection pooling information

Example output:
```
[2025-11-02T12:30:00.000Z] [DB] Connecting to database
[2025-11-02T12:30:00.100Z] [DB] Database connection successful
[2025-11-02T12:30:01.000Z] [DB] Query: SELECT * FROM users WHERE id = $1
```

### HTTP Requests and Responses
- All incoming requests (method, path, query params)
- Request headers (user-agent, content-type)
- Response times and actual status codes

**Note:** Response logging happens inside API route handlers (not middleware) to ensure accurate status codes are captured.

Example output:
```
[2025-11-02T12:30:05.000Z] [REQUEST] GET /api/bible/passage
{
  "method": "GET",
  "path": "/api/bible/passage",
  "query": { "book": "John", "chapter": "3" }
}
[2025-11-02T12:30:05.150Z] [RESPONSE] GET /api/bible/passage - 150ms
{
  "duration": 150,
  "status": 200
}
```

### API Operations
- Bible API requests and responses
- AI service calls
- Authentication flows
- Error details

## Viewing Logs

### Docker Compose
```bash
# Follow all logs
docker compose logs -f

# Follow only app logs
docker compose logs -f app

# View last 100 lines
docker compose logs --tail=100 app
```

### Production Container
```bash
# View running logs
docker logs -f reverse-app

# View with timestamps
docker logs -f --timestamps reverse-app

# Last 50 lines only
docker logs --tail=50 reverse-app
```

## Debug Utility Usage

### In Your Code
```typescript
import { debugLog, debugError, isDebugEnabled } from '@/lib/debug';

// Log informational messages
debugLog('CATEGORY', 'Message', { optional: 'data' });

// Log errors with stack traces
try {
  // ... some operation
} catch (error) {
  debugError('CATEGORY', 'Operation failed', error);
}

// Conditionally execute debug-only code
if (isDebugEnabled()) {
  // Expensive debug operation
}
```

### Categories
Use consistent category names for filtering:
- `DB` - Database operations
- `REQUEST` - HTTP requests
- `RESPONSE` - HTTP responses
- `API` - API route handlers
- `AUTH` - Authentication
- `AI` - AI service calls
- `CACHE` - Caching operations

## Performance Considerations

Debug logging adds overhead, so it's disabled by default in production. Only enable it when:
- Troubleshooting issues
- Testing new deployments
- Debugging integration problems

Remember to disable debug logging once you've resolved the issue:

```bash
./scripts/deploy.sh -d your-domain.com -k your-api-key
```

## Security Notes

- Debug logs may contain sensitive data (query params, headers)
- Don't enable debug mode permanently in production
- Logs are only output to console, not stored persistently
- Database passwords are automatically redacted in connection strings
