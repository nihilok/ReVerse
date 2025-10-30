"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut } from "lucide-react";

interface AppHeaderProps {
  user?: {
    name: string;
    email: string;
  } | null;
  onSignOut?: () => void;
}

export function AppHeader({ user, onSignOut }: AppHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold text-xl">ReVerse</span>
        </Link>

        <div className="ml-auto flex items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Reader
              </Button>
            </Link>
            <Link href="/history/insights">
              <Button variant="ghost" size="sm">
                Insights
              </Button>
            </Link>
            <Link href="/history/chats">
              <Button variant="ghost" size="sm">
                Chats
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </Link>
          </nav>

          <ThemeToggle />

          {user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              {onSignOut && (
                <Button variant="ghost" size="sm" onClick={onSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
