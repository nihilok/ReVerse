import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { db } from '@/infrastructure/database/client';
import * as schema from '@/infrastructure/database/schema';
import { migrateAnonymousUserData } from './migrate-anonymous-data';

// Lazy initialization to avoid build-time errors
// Environment variables are only validated when auth is first accessed at runtime
let _authInstance: ReturnType<typeof betterAuth> | null = null;

function initializeAuth() {
  if (_authInstance) {
    return _authInstance;
  }

  const secret = process.env.BETTER_AUTH_SECRET || 'development-secret-key-min-32-chars-long-please-change';

  // Validate secret in production (but not during build phase)
  // The CI env var is commonly set during CI/CD builds, and NEXT_PHASE is set by Next.js
  const isBuildTime = process.env.CI === 'true' || process.env.NEXT_PHASE === 'phase-production-build';

  if (process.env.NODE_ENV === 'production' && !isBuildTime) {
    if (!process.env.BETTER_AUTH_SECRET) {
      throw new Error('BETTER_AUTH_SECRET environment variable is required in production');
    }
    if (secret.length < 32) {
      throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long in production');
    }
  }

  const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

  // Warn if PASSKEY_RP_ID is not set in production (at runtime, not during build)
  if (process.env.NODE_ENV === 'production' && !isBuildTime && !process.env.PASSKEY_RP_ID) {
    console.warn(
      'Warning: PASSKEY_RP_ID environment variable is not set in production. ' +
      'Passkey authentication will use "localhost" which may cause issues. ' +
      'Please set PASSKEY_RP_ID to your production domain (e.g., "example.com").'
    );
  }

  // Build trusted origins list - include both frontend and backend URLs
  const trustedOrigins = [baseURL];
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL && process.env.NEXT_PUBLIC_BETTER_AUTH_URL !== baseURL) {
    trustedOrigins.push(process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
  }
  // Add production URL variations if in production
  if (process.env.NODE_ENV === 'production') {
    const prodUrl = new URL(baseURL);
    // Add both with and without www
    if (prodUrl.hostname.startsWith('www.')) {
      trustedOrigins.push(`${prodUrl.protocol}//${prodUrl.hostname.replace('www.', '')}`);
    } else {
      trustedOrigins.push(`${prodUrl.protocol}//www.${prodUrl.hostname}`);
    }
  }

  _authInstance = betterAuth({
    database: drizzleAdapter(db, {
      schema: schema,
      provider: 'pg',
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    trustedOrigins,
    secret,
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session once per day
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes cache
      },
    },
    advanced: {
      // Ensure cookies work properly in all environments
      useSecureCookies: process.env.NODE_ENV === 'production',
      // Trust proxy headers (CRITICAL for reverse proxy setups with SSL termination)
      // This tells Better Auth to respect X-Forwarded-Proto, X-Forwarded-Host, etc.
      // Required when Nginx/Apache handles SSL and forwards to Next.js over HTTP
      trustProxy: process.env.NODE_ENV === 'production',
      crossSubDomainCookies: {
        enabled: process.env.NODE_ENV === 'production',
      },
      database: {
        // Let PostgreSQL generate UUIDs via defaultRandom()
        generateId: false,
      },
    },
    plugins: [
      // Enable anonymous authentication
      anonymous({
        emailDomainName: 'reverse-app.com',
        onLinkAccount: async ({ anonymousUser, newUser }) => {
          // Migrate data from anonymous user to authenticated user
          await migrateAnonymousUserData(anonymousUser.user.id, newUser.user.id);
        },
      }),
      // Enable passkey authentication
      passkey({
        rpID: process.env.NODE_ENV === 'production'
          ? (() => {
              const rpId = process.env.PASSKEY_RP_ID;
              // Allow build-time execution without throwing
              if (!rpId && !isBuildTime) {
                throw new Error('PASSKEY_RP_ID environment variable is required in production');
              }
              // Use localhost as fallback during build (will be overridden at runtime)
              return rpId || 'localhost';
            })()
          : 'localhost',
        rpName: 'ReVerse - Bible Reading App',
        origin: process.env.NODE_ENV === 'production'
          ? baseURL
          : ['http://localhost:3000', 'http://localhost:3001'],
      }),
    ],
  });

  return _authInstance;
}

// Export a proxy that lazily initializes auth on first access
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, prop) {
    const instance = initializeAuth();
    return instance[prop as keyof typeof instance];
  },
});

