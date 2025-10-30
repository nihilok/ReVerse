import { NextRequest, NextResponse } from 'next/server';
import { bibleService } from '@/lib/services/bible-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const book = searchParams.get('book');
    const chapterStr = searchParams.get('chapter');
    const translation = searchParams.get('translation') || 'WEB';

    if (!book || !chapterStr) {
      return NextResponse.json(
        { error: 'Book and chapter are required' },
        { status: 400 }
      );
    }

    const chapter = parseInt(chapterStr, 10);
    if (isNaN(chapter) || chapter < 1) {
      return NextResponse.json(
        { error: 'Invalid chapter number' },
        { status: 400 }
      );
    }

    // Fetch chapter
    const passage = await bibleService.getChapter(book, chapter, translation);

    if (!passage) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(passage);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
