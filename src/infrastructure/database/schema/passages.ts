import { pgTable, text, timestamp, uuid, integer, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const savedPassages = pgTable('saved_passages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reference: text('reference').notNull(), // e.g., "John 3:16-17"
  book: text('book').notNull(), // e.g., "John"
  chapter: integer('chapter').notNull(),
  verseStart: integer('verse_start').notNull(),
  verseEnd: integer('verse_end'),
  translation: text('translation').notNull().default('WEB'),
  text: text('text').notNull(),
  isBookmark: boolean('is_bookmark').default(false).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('passages_user_id_idx').on(table.userId),
  createdAtIdx: index('passages_created_at_idx').on(table.createdAt),
  bookmarkIdx: index('passages_bookmark_idx').on(table.userId, table.isBookmark),
}));

export type SavedPassage = typeof savedPassages.$inferSelect;
export type NewSavedPassage = typeof savedPassages.$inferInsert;
