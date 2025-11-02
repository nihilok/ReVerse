# Debug Logging Implementation Summary

## Changes Made

### 1. Debug Utility (`src/lib/debug.ts`)
Created a centralized debug logging utility controlled by the `DEBUG` environment variable.

**Features:**
- `debugLog(category, message, data?)` - Log structured messages with optional data
- `debugError(category, message, error)` - Log errors with stack traces
- `isDebugEnabled()` - Check if debug mode is active
- Timestamps on all log entries
- Pretty-printed JSON data

### 2. Database Debug Logging (`src/infrastructure/database/client.ts`)
Enhanced database client with:
- Connection status logging (with password redaction)
- PostgreSQL notice logging
- Query logging with parameters
- Connection test on startup
- Automatic error reporting

### 3. Request/Response Middleware (`src/middleware.ts`)
Added Next.js middleware for HTTP logging:
- All incoming requests (method, path, query params)
- Selected headers (user-agent, content-type)
- Response timing
- Status codes

**Scope:**
- All API routes (`/api/:path*`)
- All pages (except static assets)

### 4. API Route Example (`src/app/api/bible/passage/route.ts`)
Demonstrated debug logging in API routes:
- Parameter logging
- Validation logging
- Success/failure logging
- Error details

### 5. Docker Configuration
**docker-compose.yml:**
- Added `DEBUG` environment variable to app service
- Defaults to `false` if not set

**scripts/deploy.sh:**
- Added `--debug` flag
- Added `DEBUG` to exported variables
- Added debug status to configuration summary
- Updated help text and examples

### 6. Documentation (`docs/debugging.md`)
Complete guide covering:
- How to enable debug logging
- What gets logged
- How to view logs
- Debug utility API
- Performance considerations
- Security notes

## Usage Examples

### Enable Debug During Deployment
```bash
./scripts/deploy.sh -d reverse.jarv.dev -k sk-ant-xxx --debug
```

### View Logs
```bash
# All logs
docker compose logs -f

# App only
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app
```

### Add Debug Logging to New Code
```typescript
import { debugLog, debugError } from '@/lib/debug';

export async function myFunction() {
  debugLog('MY_CATEGORY', 'Starting operation', { param: 'value' });
  
  try {
    // ... operation
    debugLog('MY_CATEGORY', 'Operation succeeded');
  } catch (error) {
    debugError('MY_CATEGORY', 'Operation failed', error);
  }
}
```

## Log Categories Used
- `DB` - Database operations
- `REQUEST` - HTTP requests
- `RESPONSE` - HTTP responses  
- `API` - API route handlers

Extend with additional categories as needed.

## Testing Checklist

1. **Database Logging:**
   - [ ] Connection attempts logged
   - [ ] Passwords redacted in logs
   - [ ] Queries logged when DEBUG=true
   - [ ] Connection errors reported

2. **Request Logging:**
   - [ ] All API requests logged
   - [ ] Page requests logged (except static assets)
   - [ ] Query parameters captured
   - [ ] Response timing recorded

3. **API Logging:**
   - [ ] Request parameters logged
   - [ ] Success responses logged
   - [ ] Errors logged with details
   - [ ] No sensitive data leaked

4. **Production Safety:**
   - [ ] Debug disabled by default
   - [ ] No performance impact when disabled
   - [ ] Logs go to stdout (Docker captures)
   - [ ] No persistent log storage

## Performance Impact

When `DEBUG=false` (default):
- All debug functions short-circuit immediately
- Zero overhead on production
- No log output

When `DEBUG=true`:
- Minimal overhead for simple logs
- Database query logging has moderate overhead
- Only enable for troubleshooting

## Security Considerations

✅ **Safe:**
- Passwords are redacted from connection strings
- Only outputs to container stdout
- No logs written to disk
- Disabled by default in production

⚠️ **Be Aware:**
- Query parameters may contain sensitive data
- Headers are logged (but filtered to common ones)
- AI prompts and responses will be logged
- Disable debug mode after troubleshooting
