"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { InsightsList } from "@/components/insights/InsightsList";
import { InsightsModal } from "@/components/insights/InsightsModal";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { InsightData } from "@/domain/bible.types";

interface Insight {
  id: string;
  passageReference: string;
  translation: string;
  createdAt: string;
  isFavorite: boolean;
  historicalContext: string;
  theologicalSignificance: string;
  practicalApplication: string;
}

export default function InsightsHistoryPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "50",
        ...(showFavoritesOnly && { favoriteOnly: "true" }),
      });

      const response = await fetch(`/api/insights?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFavoritesOnly]);

  const handleViewInsight = async (id: string) => {
    try {
      const response = await fetch(`/api/insights/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedInsight(data);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Failed to load insight:", error);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const response = await fetch(`/api/insights/${id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        loadInsights();
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this insight?")) {
      return;
    }

    try {
      const response = await fetch(`/api/insights/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadInsights();
      }
    } catch (error) {
      console.error("Failed to delete insight:", error);
    }
  };

  const insightData: InsightData | null = selectedInsight ? {
    historicalContext: selectedInsight.historicalContext,
    theologicalSignificance: selectedInsight.theologicalSignificance,
    practicalApplication: selectedInsight.practicalApplication,
  } : null;

  return (
    <div className="flex flex-col h-screen">
      <AppHeader user={null} />

      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Insights History</h1>
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className="h-4 w-4 mr-2" />
              Favorites Only
            </Button>
          </div>

          <InsightsList
            insights={insights.map(i => ({
              ...i,
              createdAt: new Date(i.createdAt),
            }))}
            onViewInsight={handleViewInsight}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </main>

      <InsightsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        insight={insightData}
        reference={selectedInsight?.passageReference}
        isFavorite={selectedInsight?.isFavorite}
        onToggleFavorite={() => selectedInsight && handleToggleFavorite(selectedInsight.id)}
      />
    </div>
  );
}
