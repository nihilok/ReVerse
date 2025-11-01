"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ChatList } from "@/components/chat/ChatList";
import { ChatModal } from "@/components/chat/ChatModal";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface Chat {
  id: string;
  title: string;
  passageReference?: string;
  createdAt: string;
  messageCount: number;
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

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
      const response = await fetch(`/api/chat/${id}`, {
        credentials: 'include',
      });
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
        credentials: 'include',
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

  const handleDelete = (id: string) => {
    setChatToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;

    try {
      const response = await fetch(`/api/chat/${chatToDelete}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (response.ok) {
        loadChats();
        if (selectedChatId === chatToDelete) {
          setShowModal(false);
          setSelectedChatId(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setChatToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader user={null} />

      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto py-8 px-6">
          <h1 className="text-3xl font-bold mb-6">Chat History</h1>

          <ChatList
            chats={chats.map(c => ({
              ...c,
              createdAt: new Date(c.createdAt),
              messageCount: c.messageCount,
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

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Chat"
        description="Are you sure you want to delete this chat? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
