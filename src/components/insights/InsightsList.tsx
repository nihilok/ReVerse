"use client";

import { InsightCard } from "./InsightCard";

interface Insight {
  id: string;
  passageReference: string;
  translation: string;
  createdAt: Date;
  isFavorite: boolean;
}

interface InsightsListProps {
  insights: Insight[];
  onViewInsight: (id: string) => void;
  onStartChat?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function InsightsList({
  insights,
  onViewInsight,
  onStartChat,
  onToggleFavorite,
  onDelete,
  isLoading,
}: InsightsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No insights yet</p>
        <p className="text-sm mt-2">Start reading and generate insights from passages</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          reference={insight.passageReference}
          translation={insight.translation}
          createdAt={insight.createdAt}
          isFavorite={insight.isFavorite}
          onView={() => onViewInsight(insight.id)}
          onChat={onStartChat ? () => onStartChat(insight.id) : undefined}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(insight.id) : undefined}
          onDelete={onDelete ? () => onDelete(insight.id) : undefined}
        />
      ))}
    </div>
  );
}
