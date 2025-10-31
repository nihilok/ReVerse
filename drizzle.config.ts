import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema/index.ts',
  out: './src/infrastructure/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/appdb',
  },
  verbose: true,
  strict: true,
});
