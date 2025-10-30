import { NextRequest, NextResponse } from 'next/server';
import { bibleService } from '@/lib/services/bible-service';
import { passageQuerySchema } from '@/domain/bible.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const params = {
      book: searchParams.get('book'),
      chapter: searchParams.get('chapter') ? parseInt(searchParams.get('chapter')!, 10) : undefined,
      verseStart: searchParams.get('verseStart') ? parseInt(searchParams.get('verseStart')!, 10) : undefined,
      verseEnd: searchParams.get('verseEnd') ? parseInt(searchParams.get('verseEnd')!, 10) : undefined,
      translation: searchParams.get('translation') || 'WEB',
    };

    if (!params.book || !params.chapter) {
      return NextResponse.json(
        { error: 'Book and chapter are required' },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const validatedParams = passageQuerySchema.parse(params);

    // Fetch passage
    const passage = await bibleService.getPassage(validatedParams);

    if (!passage) {
      return NextResponse.json(
        { error: 'Passage not found' },
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
