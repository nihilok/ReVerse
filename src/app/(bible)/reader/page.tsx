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
  const [currentInsight, setCurrentInsight] = useState<InsightData | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
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
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [currentPassageText, setCurrentPassageText] = useState<string>("");
  const [currentPassageReference, setCurrentPassageReference] = useState<string>("");
  const [chats] = useState<Array<{
    id: string;
    title: string;
    passageReference?: string;
    createdAt: Date;
    messageCount: number;
  }>>([]);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  /**
   * Load initial passage on mount using default state values.
   * This effect runs only once on mount. Subsequent passage loads are triggered by user actions
   * (e.g., via handleSearch), not by changes to state variables. The empty dependency array
   * prevents unnecessary re-runs and infinite loops.
   */
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

  const handleViewInsight = (id: string) => {
    // Fetch and display insight - will be implemented when insights are loaded
    console.log("View insight:", id);
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
    if (isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      // If no chat ID exists, this is the first message - create the chat
      if (!currentChatId) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstMessage: message,
            passageText: currentPassageText,
            passageReference: currentPassageReference,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setCurrentChatId(result.data.chat.id);
          setChatMessages([
            { role: 'user', content: message },
            { role: 'assistant', content: result.data.response },
          ]);
        } else {
          console.error('Failed to create chat:', await response.text());
        }
      } else {
        // Existing chat - send message
        const response = await fetch(`/api/chat/${currentChatId}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });

        if (response.ok) {
          const result = await response.json();
          setChatMessages((prev) => [
            ...prev,
            { role: 'user', content: message },
            { role: 'assistant', content: result.response },
          ]);
        } else {
          console.error('Failed to send message:', await response.text());
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleTextSelected = async (text: string, reference: string) => {
    if (!passage || isLoadingInsight) return;

    setIsLoadingInsight(true);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passageText: text,
          passageReference: reference,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentInsight(result.data);
        setShowInsightsModal(true);
      } else {
        console.error('Failed to fetch insight:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching insight:', error);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handleAskQuestion = (text: string, reference: string) => {
    // Store the passage context for the chat
    setCurrentPassageText(text);
    setCurrentPassageReference(reference);
    // Reset chat state for new conversation
    setCurrentChatId(null);
    setChatMessages([]);
    // Open the chat modal - user will type their question
    setShowChatModal(true);
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

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {passage && (
              <ChapterNavigation
                book={currentBook}
                chapter={currentChapter}
                onNavigate={handleNavigate}
              />
            )}

            <BibleReader
              passage={passage}
              isLoading={isLoading}
              onTextSelected={handleTextSelected}
              onAskQuestion={handleAskQuestion}
            />

            {passage && (
              <ChapterNavigation
                book={currentBook}
                chapter={currentChapter}
                onNavigate={handleNavigate}
              />
            )}
          </div>
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
        isLoading={isSendingMessage}
        title="Chat"
        reference={currentPassageReference}
        passageText={currentPassageText}
      />
    </div>
  );
}
