import { z } from 'zod';

// Bible verse structure
export const bibleVerseSchema = z.object({
  book: z.string(),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive(),
  text: z.string(),
  translation: z.string(),
});

export type BibleVerse = z.infer<typeof bibleVerseSchema>;

// Bible passage (collection of verses)
export const biblePassageSchema = z.object({
  reference: z.string(),
  verses: z.array(bibleVerseSchema),
  translation: z.string(),
});

export type BiblePassage = z.infer<typeof biblePassageSchema>;

// Passage query parameters
export const passageQuerySchema = z.object({
  book: z.string(),
  chapter: z.number().int().positive(),
  verseStart: z.number().int().positive().optional(),
  verseEnd: z.number().int().positive().optional(),
  translation: z.string().default('WEB'),
});

export type PassageQuery = z.infer<typeof passageQuerySchema>;

// Insight structure
export const insightSchema = z.object({
  historicalContext: z.string(),
  theologicalSignificance: z.string(),
  practicalApplication: z.string(),
});

export type InsightData = z.infer<typeof insightSchema>;

// Chat message
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export type ChatMessageData = z.infer<typeof chatMessageSchema>;

// Available Bible translations
export const BIBLE_TRANSLATIONS = [
  { value: 'WEB', label: 'World English Bible' },
  { value: 'KJV', label: 'King James Version' },
  { value: 'BSB', label: 'Berean Standard Bible' },
  { value: 'LSV', label: 'Literal Standard Version' },
  { value: 'NET', label: 'New English Translation' },
  { value: 'ASV', label: 'American Standard Version' },
] as const;

export type BibleTranslation = typeof BIBLE_TRANSLATIONS[number]['value'];
