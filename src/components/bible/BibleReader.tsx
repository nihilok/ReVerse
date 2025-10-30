"use client";

import { BiblePassage } from "@/domain/bible.types";
import { VerseDisplay } from "./VerseDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BibleReaderProps {
  passage: BiblePassage | null;
  onVerseSelect?: (verseNumber: number) => void;
  selectedVerse?: number;
  isLoading?: boolean;
}

export function BibleReader({
  passage,
  onVerseSelect,
  selectedVerse,
  isLoading,
}: BibleReaderProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!passage) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Bible Reader</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a passage to begin reading
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{passage.reference}</CardTitle>
        <p className="text-sm text-muted-foreground">{passage.translation}</p>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <p className="leading-relaxed text-base">
            {passage.verses.map((verse) => (
              <VerseDisplay
                key={`${verse.chapter}-${verse.verse}`}
                verse={verse}
                onSelect={onVerseSelect ? () => onVerseSelect(verse.verse) : undefined}
                isSelected={selectedVerse === verse.verse}
              />
            ))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
