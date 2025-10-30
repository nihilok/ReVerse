"use client";

import { InsightData } from "@/domain/bible.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star } from "lucide-react";

interface InsightsPanelProps {
  insight: InsightData | null;
  reference?: string;
  isFavorite?: boolean;
  isLoading?: boolean;
  onChat?: () => void;
  onToggleFavorite?: () => void;
}

export function InsightsPanel({
  insight,
  reference,
  isFavorite,
  isLoading,
  onChat,
  onToggleFavorite,
}: InsightsPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Generating Insights...</CardTitle>
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

  if (!insight) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select text to generate insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Insights: {reference}</CardTitle>
          <div className="flex gap-2">
            {onToggleFavorite && (
              <Button variant="ghost" size="sm" onClick={onToggleFavorite}>
                <Star
                  className={`h-4 w-4 ${isFavorite ? "text-yellow-500 fill-yellow-500" : ""}`}
                />
              </Button>
            )}
            {onChat && (
              <Button variant="ghost" size="sm" onClick={onChat}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="historical" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="historical">Historical</TabsTrigger>
            <TabsTrigger value="theological">Theological</TabsTrigger>
            <TabsTrigger value="practical">Practical</TabsTrigger>
          </TabsList>

          <TabsContent value="historical" className="prose dark:prose-invert max-w-none mt-4">
            <p className="text-sm whitespace-pre-wrap">{insight.historicalContext}</p>
          </TabsContent>

          <TabsContent value="theological" className="prose dark:prose-invert max-w-none mt-4">
            <p className="text-sm whitespace-pre-wrap">{insight.theologicalSignificance}</p>
          </TabsContent>

          <TabsContent value="practical" className="prose dark:prose-invert max-w-none mt-4">
            <p className="text-sm whitespace-pre-wrap">{insight.practicalApplication}</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
