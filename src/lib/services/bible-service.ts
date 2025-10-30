import type { BibleVerse, BiblePassage, PassageQuery } from '@/domain/bible.types';
import { buildReference } from '@/lib/utils/bible-structure';

/**
 * Bible service for fetching Bible passages from HelloAO API
 */
class BibleService {
  private baseUrl = 'https://bible.helloao.org/api';
  
  // Map user-friendly translation names to HelloAO API IDs
  private translationIds: Record<string, string> = {
    WEB: 'ENGWEBP',
    KJV: 'eng_kjv',
    BSB: 'BSB',
    LSV: 'eng_lsv',
    NET: 'eng_net',
    ASV: 'eng_asv',
  };
  
  // Map book names to HelloAO API book IDs
  private bookIds: Record<string, string> = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
    'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
    '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
    'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA',
    'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
    'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZE', 'Daniel': 'DAN',
    'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
    'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG',
    'Zechariah': 'ZEC', 'Malachi': 'MAL', 'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK',
    'John': 'JHN', 'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
    'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
    '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
    'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE',
    '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD',
    'Revelation': 'REV',
  };
  
  /**
   * Normalize book name to API book ID
   */
  private normalizeBookName(book: string): string {
    return this.bookIds[book] || book.replace(/\s/g, '').toUpperCase();
  }
  
  /**
   * Extract verse text from content array
   */
  private extractVerseText(content: Array<string | { text?: string; noteId?: number }>): string {
    const textParts: string[] = [];
    
    for (const item of content) {
      if (typeof item === 'string') {
        textParts.push(item);
      } else if (item.text) {
        textParts.push(item.text);
      } else if (item.noteId !== undefined) {
        // Footnote marker - add space to separate surrounding words
        textParts.push(' ');
      }
    }
    
    return textParts.join('').trim();
  }
  
  /**
   * Fetch chapter data from HelloAO API
   */
  private async getChapterData(
    book: string,
    chapter: number,
    translation: string
  ): Promise<{ chapter: { content: Array<{ type: string; number?: number; content?: unknown[] }> } } | null> {
    try {
      const bookId = this.normalizeBookName(book);
      const apiTranslation = this.translationIds[translation] || translation;
      const url = `${this.baseUrl}/${apiTranslation}/${bookId}/${chapter}.json`;
      
      const response = await fetch(url, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch Bible chapter: ${response.statusText}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chapter data:', error);
      return null;
    }
  }
  
  /**
   * Get a single verse
   */
  async getVerse(
    book: string,
    chapter: number,
    verse: number,
    translation: string = 'WEB'
  ): Promise<BibleVerse | null> {
    const data = await this.getChapterData(book, chapter, translation);
    if (!data) return null;
    
    const chapterContent = data.chapter.content;
    
    for (const item of chapterContent) {
      if (item.type === 'verse' && item.number === verse) {
        const text = this.extractVerseText(item.content as Array<string | { text?: string; noteId?: number }>);
        return {
          book,
          chapter,
          verse,
          text,
          translation,
        };
      }
    }
    
    return null;
  }
  
  /**
   * Get a passage (range of verses)
   */
  async getPassage(params: PassageQuery): Promise<BiblePassage | null> {
    const { book, chapter, verseStart, verseEnd, translation = 'WEB' } = params;
    
    // If no verse range specified, get the entire chapter
    if (!verseStart) {
      return this.getChapter(book, chapter, translation);
    }
    
    const data = await this.getChapterData(book, chapter, translation);
    if (!data) return null;
    
    const chapterContent = data.chapter.content;
    const verses: BibleVerse[] = [];
    const endVerse = verseEnd || verseStart;
    
    for (const item of chapterContent) {
      if (item.type === 'verse' && item.number !== undefined) {
        const verseNum = item.number;
        if (verseNum >= verseStart && verseNum <= endVerse) {
          const text = this.extractVerseText(item.content as Array<string | { text?: string; noteId?: number }>);
          verses.push({
            book,
            chapter,
            verse: verseNum,
            text,
            translation,
          });
        }
      }
    }
    
    if (verses.length === 0) return null;
    
    const reference = buildReference(book, chapter, verseStart, verseEnd);
    
    return {
      reference,
      verses,
      translation,
    };
  }
  
  /**
   * Get an entire chapter
   */
  async getChapter(
    book: string,
    chapter: number,
    translation: string = 'WEB'
  ): Promise<BiblePassage | null> {
    const data = await this.getChapterData(book, chapter, translation);
    if (!data) return null;
    
    const chapterContent = data.chapter.content;
    const verses: BibleVerse[] = [];
    
    for (const item of chapterContent) {
      if (item.type === 'verse' && item.number !== undefined) {
        const verseNum = item.number;
        const text = this.extractVerseText(item.content as Array<string | { text?: string; noteId?: number }>);
        verses.push({
          book,
          chapter,
          verse: verseNum,
          text,
          translation,
        });
      }
    }
    
    if (verses.length === 0) return null;
    
    const reference = buildReference(book, chapter);
    
    return {
      reference,
      verses,
      translation,
    };
  }
}

// Singleton instance
export const bibleService = new BibleService();
