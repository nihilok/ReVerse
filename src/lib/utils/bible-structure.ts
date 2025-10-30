// Bible book information
export interface BookInfo {
  name: string;
  chapters: number;
}

// Protestant canon (66 books)
export const BIBLE_BOOKS: BookInfo[] = [
  // Old Testament - Pentateuch
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  
  // Old Testament - Historical Books
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  
  // Old Testament - Wisdom Literature
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  
  // Old Testament - Major Prophets
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  
  // Old Testament - Minor Prophets
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  
  // New Testament - Gospels
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  
  // New Testament - History
  { name: "Acts", chapters: 28 },
  
  // New Testament - Pauline Epistles
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  
  // New Testament - General Epistles
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  
  // New Testament - Apocalyptic
  { name: "Revelation", chapters: 22 },
];

export function getBookInfo(bookName: string): BookInfo | undefined {
  return BIBLE_BOOKS.find(
    (book) => book.name.toLowerCase() === bookName.toLowerCase()
  );
}

export function getNextChapter(book: string, chapter: number): { book: string; chapter: number } | null {
  const bookInfo = getBookInfo(book);
  if (!bookInfo) return null;
  
  if (chapter < bookInfo.chapters) {
    return { book, chapter: chapter + 1 };
  }
  
  const bookIndex = BIBLE_BOOKS.findIndex(b => b.name === bookInfo.name);
  if (bookIndex < BIBLE_BOOKS.length - 1) {
    const nextBook = BIBLE_BOOKS[bookIndex + 1];
    return { book: nextBook.name, chapter: 1 };
  }
  
  return null;
}

export function getPreviousChapter(book: string, chapter: number): { book: string; chapter: number } | null {
  const bookInfo = getBookInfo(book);
  if (!bookInfo) return null;
  
  if (chapter > 1) {
    return { book, chapter: chapter - 1 };
  }
  
  const bookIndex = BIBLE_BOOKS.findIndex(b => b.name === bookInfo.name);
  if (bookIndex > 0) {
    const prevBook = BIBLE_BOOKS[bookIndex - 1];
    return { book: prevBook.name, chapter: prevBook.chapters };
  }
  
  return null;
}

export function buildReference(
  book: string,
  chapter: number,
  verseStart?: number,
  verseEnd?: number
): string {
  let ref = `${book} ${chapter}`;
  
  if (verseStart) {
    ref += `:${verseStart}`;
    if (verseEnd && verseEnd !== verseStart) {
      ref += `-${verseEnd}`;
    }
  }
  
  return ref;
}

export function parseReference(reference: string): {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
} | null {
  const match = reference.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  
  if (!match) return null;
  
  const [, book, chapterStr, verseStartStr, verseEndStr] = match;
  
  return {
    book: book.trim(),
    chapter: parseInt(chapterStr, 10),
    verseStart: verseStartStr ? parseInt(verseStartStr, 10) : undefined,
    verseEnd: verseEndStr ? parseInt(verseEndStr, 10) : undefined,
  };
}
