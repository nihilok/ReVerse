import { BibleVerse } from "@/domain/bible.types";
import { cn } from "@/lib/utils/cn";

interface VerseDisplayProps {
  verse: BibleVerse;
  onSelect?: (verse: BibleVerse) => void;
  isSelected?: boolean;
}

export function VerseDisplay({ verse, onSelect, isSelected }: VerseDisplayProps) {
  return (
    <span
      className={cn(
        "inline",
        onSelect && "cursor-pointer hover:bg-accent/50 transition-colors",
        isSelected && "bg-accent"
      )}
      onClick={() => onSelect?.(verse)}
    >
      <sup className="text-xs text-muted-foreground mr-1">{verse.verse}</sup>
      {verse.text}{" "}
    </span>
  );
}
