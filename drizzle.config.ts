import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/database/schema/index.ts',
  out: './src/infrastructure/database/migrations',
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/appdb',
} satisfies Config;
