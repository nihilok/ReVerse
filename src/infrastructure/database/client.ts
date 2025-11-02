import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { debugLog, debugError, isDebugEnabled } from '@/lib/debug';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/appdb';

// Log connection attempt
debugLog('DB', 'Connecting to database', {
  url: connectionString.replace(/:[^:@]+@/, ':****@'), // Hide password
  debug: isDebugEnabled(),
});

// For migrations
export const migrationClient = postgres(connectionString, { max: 1 });

// For queries - with debug logging
const queryClient = postgres(connectionString, {
  onnotice: isDebugEnabled() ? (notice) => {
    debugLog('DB', 'PostgreSQL notice', notice);
  } : undefined,
  debug: isDebugEnabled() ? (connection, query, params) => {
    debugLog('DB', 'Query', { connection, query, params });
  } : undefined,
});

// Test connection on startup
queryClient`SELECT 1 as connected`
  .then(() => {
    debugLog('DB', 'Database connection successful');
  })
  .catch((error) => {
    debugError('DB', 'Database connection failed', error);
  });

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
