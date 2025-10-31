// eslint-disable-next-line import/no-anonymous-default-export
export default {
  schema: './src/infrastructure/database/schema/index.ts',
  out: './src/infrastructure/database/migrations',
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/appdb',
};
