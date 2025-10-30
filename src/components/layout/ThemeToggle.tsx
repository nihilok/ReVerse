"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="h-5 w-5 hidden dark:block" />
    </Button>
  );
}
