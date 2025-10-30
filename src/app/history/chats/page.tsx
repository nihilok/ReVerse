"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ChatList } from "@/components/chat/ChatList";
import { ChatModal } from "@/components/chat/ChatModal";

interface Chat {
  id: string;
  title: string;
  passageReference?: string;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatsHistoryPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat?limit=50");
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedChat(data.chat);
        setChatMessages(data.messages);
        setSelectedChatId(id);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedChatId) return;

    setIsSendingMessage(true);
    try {
      const response = await fetch(`/api/chat/${selectedChatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages([...chatMessages, data.userMessage, data.aiMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadChats();
        if (selectedChatId === id) {
          setShowModal(false);
          setSelectedChatId(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader user={null} />

      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl py-8">
          <h1 className="text-3xl font-bold mb-6">Chat History</h1>

          <ChatList
            chats={chats.map(c => ({
              ...c,
              createdAt: new Date(c.createdAt),
              messageCount: 0, // Message count not included in API response - could be added as enhancement
            }))}
            onOpenChat={handleOpenChat}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </main>

      <ChatModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        messages={chatMessages.map(m => ({
          role: m.role,
          content: m.content,
        }))}
        onSendMessage={handleSendMessage}
        isLoading={isSendingMessage}
        title={selectedChat?.title || "Chat"}
        reference={selectedChat?.passageReference}
      />
    </div>
  );
}
