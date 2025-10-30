"use client";

import { useState, useEffect } from "react";
import { BibleReader } from "@/components/bible/BibleReader";
import { ChapterNavigation } from "@/components/bible/ChapterNavigation";
import { PassageSearch } from "@/components/bible/PassageSearch";
import { InsightsList } from "@/components/insights/InsightsList";
import { InsightsModal } from "@/components/insights/InsightsModal";
import { ChatList } from "@/components/chat/ChatList";
import { ChatModal } from "@/components/chat/ChatModal";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import type { BiblePassage, InsightData } from "@/domain/bible.types";

export default function ReaderPage() {
  const [passage, setPassage] = useState<BiblePassage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentBook, setCurrentBook] = useState("John");
  const [currentChapter, setCurrentChapter] = useState(3);
  const [currentTranslation, setCurrentTranslation] = useState("WEB");

  // Insights state
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [currentInsight] = useState<InsightData | null>(null);
  const [insights] = useState<Array<{
    id: string;
    passageReference: string;
    translation: string;
    createdAt: Date;
    isFavorite: boolean;
  }>>([]);

  // Chat state
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chats] = useState<Array<{
    id: string;
    title: string;
    passageReference?: string;
    createdAt: Date;
    messageCount: number;
  }>>([]);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load initial passage
  useEffect(() => {
    handleSearch({
      book: currentBook,
      chapter: currentChapter,
      translation: currentTranslation,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (params: {
    book: string;
    chapter: number;
    verseStart?: number;
    verseEnd?: number;
    translation: string;
  }) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        book: params.book,
        chapter: params.chapter.toString(),
        translation: params.translation,
        ...(params.verseStart && { verseStart: params.verseStart.toString() }),
        ...(params.verseEnd && { verseEnd: params.verseEnd.toString() }),
      });

      const response = await fetch(`/api/bible/passage?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setPassage(data);
        setCurrentBook(params.book);
        setCurrentChapter(params.chapter);
        setCurrentTranslation(params.translation);
      }
    } catch (error) {
      console.error("Failed to fetch passage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (book: string, chapter: number) => {
    handleSearch({ book, chapter, translation: currentTranslation });
  };

  const handleViewInsight = () => {
    // Fetch and display insight - will be implemented when insights are loaded
    setShowInsightsModal(true);
  };

  const handleStartChat = (id: string) => {
    setCurrentChatId(id);
    setShowChatModal(true);
  };

  const handleOpenChat = (id: string) => {
    setCurrentChatId(id);
    setShowChatModal(true);
  };

  const handleSendMessage = async (message: string) => {
    // Message sending - will be implemented when chat is properly loaded
    console.log("Sending message:", message, "chatId:", currentChatId);
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader user={null} />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          searchPanel={
            <PassageSearch
              onSearch={handleSearch}
              defaultBook={currentBook}
              defaultChapter={currentChapter}
              defaultTranslation={currentTranslation}
            />
          }
          insightsPanel={
            <InsightsList
              insights={insights}
              onViewInsight={handleViewInsight}
              onStartChat={handleStartChat}
            />
          }
          chatsPanel={
            <ChatList
              chats={chats}
              onOpenChat={handleOpenChat}
            />
          }
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {passage && (
            <ChapterNavigation
              book={currentBook}
              chapter={currentChapter}
              onNavigate={handleNavigate}
            />
          )}

          <BibleReader passage={passage} isLoading={isLoading} />

          {passage && (
            <ChapterNavigation
              book={currentBook}
              chapter={currentChapter}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>

      <InsightsModal
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
        insight={currentInsight}
        reference={passage?.reference}
      />

      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        title="Chat"
      />
    </div>
  );
}
