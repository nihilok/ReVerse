"use client";

import { useEffect, useRef, useState } from "react";
import { BiblePassage } from "@/domain/bible.types";
import { VerseDisplay } from "./VerseDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle } from "lucide-react";

interface BibleReaderProps {
  passage: BiblePassage | null;
  onVerseSelect?: (verseNumber: number) => void;
  selectedVerse?: number;
  isLoading?: boolean;
  onTextSelected?: (text: string, reference: string) => void;
  onAskQuestion?: (text: string, reference: string) => void;
}

export function BibleReader({
  passage,
  onVerseSelect,
  selectedVerse,
  isLoading,
  onTextSelected,
  onAskQuestion,
}: BibleReaderProps) {
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let selectionTimeout: ReturnType<typeof setTimeout>;

    const updateSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (
        text &&
        text.length > 0 &&
        selection &&
        selection.rangeCount > 0 &&
        readerRef.current?.contains(selection.anchorNode)
      ) {
        setSelectedText(text);

        // Get selection position for tooltip
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const scrollingContainer = contentRef.current;
        if (!scrollingContainer) return;

        const containerRect = scrollingContainer.getBoundingClientRect();
        const scrollTop = scrollingContainer.scrollTop || 0;
        const scrollLeft = scrollingContainer.scrollLeft || 0;

        setSelectionPosition({
          x: rect.left - containerRect.left + scrollLeft + rect.width / 2,
          y: rect.bottom - containerRect.top + scrollTop + 32,
        });
      } else if (!text) {
        setSelectedText("");
        setSelectionPosition(null);
      }
    };

    const handleSelectionChange = () => {
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
      selectionTimeout = setTimeout(updateSelection, 100);
    };

    const handlePointerUp = () => {
      setTimeout(updateSelection, 50);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("pointerup", handlePointerUp);
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
    };
  }, []);

  const handleGetInsights = () => {
    if (selectedText && passage && onTextSelected) {
      onTextSelected(selectedText, passage.reference);
      setSelectedText("");
      setSelectionPosition(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleAskQuestionClick = () => {
    if (selectedText && passage && onAskQuestion) {
      onAskQuestion(selectedText, passage.reference);
      setSelectedText("");
      setSelectionPosition(null);
      window.getSelection()?.removeAllRanges();
    }
  };
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
    <Card className="h-full flex flex-col" ref={readerRef}>
      <CardHeader className="flex-shrink-0">
        <CardTitle>{passage.reference}</CardTitle>
        <p className="text-sm text-muted-foreground">{passage.translation}</p>
      </CardHeader>
      <CardContent ref={contentRef} className="relative overflow-y-auto flex-1">
        <div className="max-w-3xl mx-auto">
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
        </div>

        {/* Text selection tooltip */}
        {selectedText && selectionPosition && (
          <div
            className="absolute z-50 flex gap-2 bg-card border border-border rounded-lg shadow-lg p-2"
            style={{
              left: `${selectionPosition.x}px`,
              top: `${selectionPosition.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            <Button
              size="sm"
              variant="default"
              onClick={handleGetInsights}
              className="flex items-center gap-1"
            >
              <Sparkles className="h-4 w-4" />
              Get Insights
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAskQuestionClick}
              className="flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              Ask a question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
