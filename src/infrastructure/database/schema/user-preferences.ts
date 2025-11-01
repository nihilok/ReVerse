import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  defaultTranslation: text('default_translation').notNull().default('WEB'),
  theme: text('theme').notNull().default('system'), // 'light' | 'dark' | 'system'
  fontSize: text('font_size').notNull().default('medium'), // 'small' | 'medium' | 'large'
  showVerseNumbers: boolean('show_verse_numbers').default(true).notNull(),
  autoSavePassages: boolean('auto_save_passages').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
