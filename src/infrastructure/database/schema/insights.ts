import { pgTable, text, timestamp, uuid, boolean, index, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const insights = pgTable('insights', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  passageReference: text('passage_reference').notNull(), // e.g., "John 3:16"
  passageText: text('passage_text').notNull(),
  historicalContext: text('historical_context').notNull(),
  theologicalSignificance: text('theological_significance').notNull(),
  practicalApplication: text('practical_application').notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('insights_user_id_idx').on(table.userId),
  createdAtIdx: index('insights_created_at_idx').on(table.createdAt),
  favoriteIdx: index('insights_favorite_idx').on(table.userId, table.isFavorite),
  // Use only userId and passageReference for uniqueness to avoid large index on passageText
  // This prevents duplicate insights for the same passage reference per user
  uniquePassage: unique('insights_unique_passage').on(table.userId, table.passageReference),
}));

export type Insight = typeof insights.$inferSelect;
export type NewInsight = typeof insights.$inferInsert;
