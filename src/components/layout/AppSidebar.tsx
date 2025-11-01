"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, History, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AppSidebarProps {
  searchPanel?: React.ReactNode;
  insightsPanel?: React.ReactNode;
  chatsPanel?: React.ReactNode;
  defaultTab?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({
  searchPanel,
  insightsPanel,
  chatsPanel,
  defaultTab = "search",
  isCollapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <aside
      className={cn(
        "relative h-full border-r bg-background transition-all duration-300",
        isCollapsed ? "w-0" : "w-80"
      )}
    >
      {onToggleCollapse && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-4 top-4 z-10 h-8 w-8 rounded-full border bg-background shadow-md"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      )}

      {!isCollapsed && (
        <Card className="h-full rounded-none border-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-3 rounded-none">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="chats" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="flex-1 overflow-y-auto p-4">
              {searchPanel ?? <p className="text-muted-foreground">Search panel</p>}
            </TabsContent>

            <TabsContent value="insights" className="flex-1 overflow-y-auto p-4">
              {insightsPanel ?? <p className="text-muted-foreground">Insights history</p>}
            </TabsContent>

            <TabsContent value="chats" className="flex-1 overflow-y-auto p-4">
              {chatsPanel ?? <p className="text-muted-foreground">Chat history</p>}
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </aside>
  );
}
