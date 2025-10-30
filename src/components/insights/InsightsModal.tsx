"use client";

import { InsightData } from "@/domain/bible.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star } from "lucide-react";

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: InsightData | null;
  reference?: string;
  isFavorite?: boolean;
  onChat?: () => void;
  onToggleFavorite?: () => void;
}

export function InsightsModal({
  isOpen,
  onClose,
  insight,
  reference,
  isFavorite,
  onChat,
  onToggleFavorite,
}: InsightsModalProps) {
  if (!insight) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Insights: {reference}</DialogTitle>
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
                  Chat
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="historical" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="historical">Historical Context</TabsTrigger>
            <TabsTrigger value="theological">Theological Significance</TabsTrigger>
            <TabsTrigger value="practical">Practical Application</TabsTrigger>
          </TabsList>

          <TabsContent value="historical" className="prose dark:prose-invert max-w-none mt-4">
            <p className="whitespace-pre-wrap">{insight.historicalContext}</p>
          </TabsContent>

          <TabsContent value="theological" className="prose dark:prose-invert max-w-none mt-4">
            <p className="whitespace-pre-wrap">{insight.theologicalSignificance}</p>
          </TabsContent>

          <TabsContent value="practical" className="prose dark:prose-invert max-w-none mt-4">
            <p className="whitespace-pre-wrap">{insight.practicalApplication}</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
