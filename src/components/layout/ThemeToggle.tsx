"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(() => {
    // Initialize from localStorage or system preference on client side only
    if (typeof window === "undefined") return null;
    
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (storedTheme) return storedTheme;
    
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // When theme changes, update DOM and localStorage
  useEffect(() => {
    if (!theme) return;
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Don't render anything until theme is loaded to avoid hydration mismatch
  if (!theme) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
