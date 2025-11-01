# Troubleshooting Guide

## Session Expired Error

### Problem
You're getting a "Session expired. Please refresh the page to continue." error when trying to start a chat or generate insights.

### Root Cause
This error typically occurs when Better Auth sessions are not properly configured or when the session cookies are not being maintained correctly. Common causes include:

1. **Missing session configuration**: Better Auth needs explicit session duration settings
2. **Cookie not persisting**: Browser or server configuration preventing cookie storage
3. **Session expiring too quickly**: Default session timeout is too short
4. **Environment variable issues**: Missing or incorrect auth configuration

### Solution

The following changes have been made to fix this issue:

#### 1. Better Auth Configuration (`src/lib/auth/config.ts`)

Added proper session configuration:

```typescript
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  updateAge: 60 * 60 * 24, // Update session once per day
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 minutes cache
  },
},
advanced: {
  useSecureCookies: process.env.NODE_ENV === 'production',
},
```

**What this does:**
- Sets session expiration to 7 days
- Enables cookie caching for better performance
- Ensures cookies work in both development and production
- Updates session daily to keep it fresh

#### 2. Environment Variables

Make sure your `.env.local` file includes:

```bash
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars-long
BETTER_AUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-your-key-here
NODE_ENV=development
```

For Docker/production, ensure `.env` or environment includes:
```bash
BETTER_AUTH_SECRET=production-secret-key-min-32-chars-change-me-please
BETTER_AUTH_URL=https://your-domain.com
ANTHROPIC_API_KEY=sk-ant-your-production-key
PASSKEY_RP_ID=your-domain.com
NODE_ENV=production
```

### Testing the Fix

1. **Clear browser storage:**
   - Open DevTools (F12)
   - Go to Application → Storage
   - Click "Clear site data"
   - Refresh the page

2. **Restart your development server:**
   ```bash
   npm run dev
   ```

3. **For Docker:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

4. **Test the authentication flow:**
   - Select some Bible text
   - Click "Generate Insight" or "Ask Question"
   - The operation should complete without session errors

### Additional Debugging

If you still see session errors:

1. **Check browser console** for authentication-related errors
2. **Verify cookies are being set:**
   - DevTools → Application → Cookies
   - Look for `better-auth.session_token` cookie
   - Verify it has a future expiration date

3. **Check server logs** for authentication errors
4. **Ensure database is accessible** and Better Auth tables exist

### Anonymous Authentication

ReVerse uses anonymous authentication by default. When you first visit the app:

1. An anonymous user is automatically created
2. A session cookie is set
3. You can use all features immediately
4. Optionally add a passkey later to access data from other devices

The session should persist for 7 days and auto-refresh daily during use.

## Other Common Issues

### Database Connection Issues

**Error:** `Could not connect to database`

**Solution:**
- Ensure PostgreSQL is running: `docker compose up postgres`
- Check DATABASE_URL is correct in your `.env` file
- For Docker containers, use service name: `postgresql://postgres:postgres@postgres:5432/appdb`
- For local development, use localhost: `postgresql://postgres:postgres@localhost:5432/appdb`

### Database Schema/Migration Issues

**Error:** Tables don't exist, or schema is out of sync

**Solutions:**

#### Development (Local):
```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Or for rapid prototyping (not recommended for production)
npm run db:push
```

#### Production (Docker):
Migrations run automatically on container startup via the `migrations` service. If they didn't run:

```bash
# Check migration logs
docker compose logs migrations

# Manually run migrations if needed
docker compose run --rm migrations

# Or restart containers to trigger migrations
docker compose down
docker compose up -d --build
```

**Common migration issues:**

1. **Migration files not committed to git:**
   ```bash
   # Check if migrations exist
   ls src/infrastructure/database/migrations/
   
   # If empty, generate initial migration
   npm run db:generate
   git add src/infrastructure/database/migrations/
   git commit -m "Add database migrations"
   ```

2. **Wrong DATABASE_URL in production:**
   - Inside Docker containers, use service name `postgres:5432`
   - Outside Docker, use `localhost:5433` (or your mapped port)
   - Never use `localhost` inside a container

3. **Migrations not applied after schema change:**
   ```bash
   # 1. Generate new migration
   npm run db:generate
   
   # 2. Commit to git
   git add src/infrastructure/database/migrations/
   git commit -m "Add migration for [your change]"
   
   # 3. Deploy (migrations run automatically)
   git push
   ```

4. **drizzle-kit not found in production:**
   - The `migrations` service uses the `development` target which includes `drizzle-kit`
   - Don't run migrations from the `app` service

### Missing API Keys

**Error:** `ANTHROPIC_API_KEY environment variable is required`

**Solution:**
- Get an API key from https://console.anthropic.com
- Add it to your `.env.local` file
- Restart your dev server

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Build Failures in Docker

**Error:** Build fails with missing environment variables

**Solution:**
- Ensure all required environment variables are in your `.env` file
- Pass them to docker compose: `docker compose --env-file .env up --build`

## Production Deployment Issues

### 401 Unauthorized Errors in Production

**Error:** Getting 401 errors when trying to use insights, chat, or other authenticated features

**Root Causes & Solutions:**

1. **Wrong BETTER_AUTH_URL:**
   ```bash
   # ❌ Wrong - uses localhost
   BETTER_AUTH_URL=http://localhost:3000
   
   # ✅ Correct - uses your public domain
   BETTER_AUTH_URL=https://yourdomain.com
   ```
   
   After fixing, restart containers:
   ```bash
   docker compose down
   docker compose up -d
   ```

2. **Wrong DATABASE_URL for Docker:**
   ```bash
   # ❌ Wrong - can't reach localhost from inside container
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/appdb
   
   # ✅ Correct - uses Docker service name
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/appdb
   ```

3. **Missing or incorrect PASSKEY_RP_ID:**
   ```bash
   # Must match your domain (without protocol)
   PASSKEY_RP_ID=yourdomain.com
   ```

4. **Cookies not being set properly:**
   - Check browser DevTools → Application → Cookies
   - Look for `better-auth.session_token` cookie
   - Verify domain matches your site
   - Ensure Nginx is forwarding proxy headers:
     ```nginx
     proxy_set_header X-Forwarded-Proto $scheme;
     proxy_set_header X-Forwarded-Host $host;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     ```

5. **Clear browser data and test fresh:**
   ```bash
   # In browser DevTools
   Application → Clear site data
   ```

### Static Assets Returning 404

**Error:** CSS/JS files not loading, seeing unstyled "Loading..." text

**Solution:**

Your Nginx config should proxy **everything** to the Next.js container, not try to serve static files directly:

```nginx
upstream reverse_app {
    server 192.168.1.x:3000;  # Your app server IP
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://reverse_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Don't** add special handling for `/_next/static` - let Next.js serve its own files.

### No Access Logs in Production

**Error:** Not seeing page requests in Docker logs

**Explanation:** Next.js production mode doesn't log HTTP requests by default.

**Solutions:**

1. **Check Nginx logs** (if using reverse proxy):
   ```bash
   tail -f /var/log/nginx/access.log
   ```

2. **Add middleware logging** in `/src/middleware.ts`:
   ```typescript
   export function middleware(request: NextRequest) {
     console.log(`${request.method} ${request.nextUrl.pathname}`);
     return NextResponse.next();
   }
   ```

3. **View Docker container logs:**
   ```bash
   docker compose logs -f app
   ```

### Migrations Not Running on Deploy

**Error:** Schema changes not applied after deployment

**Checklist:**

1. **Generated migration files?**
   ```bash
   npm run db:generate
   git add src/infrastructure/database/migrations/
   git commit -m "Add migration"
   ```

2. **Check migrations service:**
   ```bash
   # View migration logs
   docker compose logs migrations
   
   # Should see: service completed successfully
   docker compose ps migrations
   ```

3. **Manually run if needed:**
   ```bash
   docker compose run --rm migrations
   ```

### Environment Variable Checklist for Production

Essential variables in your production `.env` file:

```bash
# Database (use 'postgres' hostname for Docker network)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/appdb

# Auth (use your public domain with HTTPS)
BETTER_AUTH_SECRET=your-long-random-secret-min-32-chars
BETTER_AUTH_URL=https://yourdomain.com
PASSKEY_RP_ID=yourdomain.com

# AI
ANTHROPIC_API_KEY=sk-ant-your-api-key

# Optional
NODE_ENV=production
```

After changing environment variables:
```bash
docker compose down
docker compose up -d
```

## Need More Help?

1. Check the [Authentication documentation](./AUTHENTICATION.md)
2. Review the [Quick Start guide](./quick-start.md)
3. Look for similar issues in GitHub Issues
4. Enable debug logging by adding `DEBUG=better-auth:*` to your environment variables

