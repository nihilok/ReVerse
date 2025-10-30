"use client";

import { useState } from "react";
import { BIBLE_BOOKS } from "@/lib/utils/bible-structure";
import { BIBLE_TRANSLATIONS } from "@/domain/bible.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface PassageSearchProps {
  onSearch: (params: {
    book: string;
    chapter: number;
    verseStart?: number;
    verseEnd?: number;
    translation: string;
  }) => void;
  defaultBook?: string;
  defaultChapter?: number;
  defaultTranslation?: string;
}

export function PassageSearch({
  onSearch,
  defaultBook = "John",
  defaultChapter = 3,
  defaultTranslation = "WEB",
}: PassageSearchProps) {
  const [book, setBook] = useState(defaultBook);
  const [chapter, setChapter] = useState(defaultChapter.toString());
  const [verseStart, setVerseStart] = useState("");
  const [verseEnd, setVerseEnd] = useState("");
  const [translation, setTranslation] = useState(defaultTranslation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const chapterNum = parseInt(chapter, 10);
    if (isNaN(chapterNum) || chapterNum < 1) {
      return;
    }

    const params: {
      book: string;
      chapter: number;
      verseStart?: number;
      verseEnd?: number;
      translation: string;
    } = {
      book,
      chapter: chapterNum,
      translation,
    };

    if (verseStart) {
      const verseStartNum = parseInt(verseStart, 10);
      if (!isNaN(verseStartNum) && verseStartNum > 0) {
        params.verseStart = verseStartNum;
      }
    }

    if (verseEnd) {
      const verseEndNum = parseInt(verseEnd, 10);
      if (!isNaN(verseEndNum) && verseEndNum > 0) {
        params.verseEnd = verseEndNum;
      }
    }

    onSearch(params);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="book">Book</Label>
        <Select value={book} onValueChange={setBook}>
          <SelectTrigger id="book">
            <SelectValue placeholder="Select a book" />
          </SelectTrigger>
          <SelectContent>
            {BIBLE_BOOKS.map((b) => (
              <SelectItem key={b.name} value={b.name}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="chapter">Chapter</Label>
        <Input
          id="chapter"
          type="number"
          min="1"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="verseStart">Verse Start</Label>
          <Input
            id="verseStart"
            type="number"
            min="1"
            value={verseStart}
            onChange={(e) => setVerseStart(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verseEnd">Verse End</Label>
          <Input
            id="verseEnd"
            type="number"
            min="1"
            value={verseEnd}
            onChange={(e) => setVerseEnd(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="translation">Translation</Label>
        <Select value={translation} onValueChange={setTranslation}>
          <SelectTrigger id="translation">
            <SelectValue placeholder="Select translation" />
          </SelectTrigger>
          <SelectContent>
            {BIBLE_TRANSLATIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
