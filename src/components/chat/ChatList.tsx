"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";

interface Chat {
  id: string;
  title: string;
  passageReference?: string;
  createdAt: Date;
  messageCount: number;
}

interface ChatListProps {
  chats: Chat[];
  onOpenChat: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function ChatList({ chats, onOpenChat, onDelete, isLoading }: ChatListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No chats yet</p>
        <p className="text-sm mt-2">Start a conversation from insights or passages</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onOpenChat(chat.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{chat.title}</CardTitle>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(chat.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{chat.messageCount} messages</span>
              {chat.passageReference && (
                <span className="font-medium">{chat.passageReference}</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {chat.createdAt.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
