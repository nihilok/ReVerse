import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { db } from '@/infrastructure/database/client';
import { migrateAnonymousUserData } from './migrate-anonymous-data';

const secret = process.env.BETTER_AUTH_SECRET || 'development-secret-key-min-32-chars-long-please-change';

// Validate secret in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET environment variable is required in production');
  }
  if (secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long in production');
  }
}

const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [baseURL],
  secret,
  plugins: [
    // Enable anonymous authentication
    anonymous({
      emailDomainName: 'reverse-app.com',
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        // Migrate data from anonymous user to authenticated user
        await migrateAnonymousUserData(anonymousUser.id, newUser.id);
      },
    }),
    // Enable passkey authentication
    passkey({
      rpID: process.env.NODE_ENV === 'production' 
        ? process.env.PASSKEY_RP_ID || 'reverse-app.com'
        : 'localhost',
      rpName: 'ReVerse - Bible Reading App',
      origin: process.env.NODE_ENV === 'production'
        ? baseURL
        : ['http://localhost:3000', 'http://localhost:3001'],
    }),
  ],
});
