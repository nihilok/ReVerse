"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getNextChapter, getPreviousChapter } from "@/lib/utils/bible-structure";

interface ChapterNavigationProps {
  book: string;
  chapter: number;
  onNavigate: (book: string, chapter: number) => void;
}

export function ChapterNavigation({
  book,
  chapter,
  onNavigate,
}: ChapterNavigationProps) {
  const prevChapter = getPreviousChapter(book, chapter);
  const nextChapter = getNextChapter(book, chapter);

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="outline"
        onClick={() => prevChapter && onNavigate(prevChapter.book, prevChapter.chapter)}
        disabled={!prevChapter}
        className="flex-1"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <div className="text-sm font-medium text-center min-w-[150px]">
        {book} {chapter}
      </div>

      <Button
        variant="outline"
        onClick={() => nextChapter && onNavigate(nextChapter.book, nextChapter.chapter)}
        disabled={!nextChapter}
        className="flex-1"
      >
        Next
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
