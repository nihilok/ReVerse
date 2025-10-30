import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, Trash2 } from "lucide-react";

interface InsightCardProps {
  reference: string;
  translation: string;
  createdAt: Date;
  isFavorite?: boolean;
  onView: () => void;
  onChat?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

export function InsightCard({
  reference,
  translation,
  createdAt,
  isFavorite,
  onView,
  onChat,
  onToggleFavorite,
  onDelete,
}: InsightCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onView}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{reference}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {translation}
            </Badge>
          </div>
          {isFavorite && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {createdAt.toLocaleDateString()}
          </span>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {onChat && (
              <Button variant="ghost" size="sm" onClick={onChat}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
            {onToggleFavorite && (
              <Button variant="ghost" size="sm" onClick={onToggleFavorite}>
                <Star className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
