"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { BIBLE_TRANSLATIONS } from "@/domain/bible.types";

export default function SettingsPage() {
  const [defaultTranslation, setDefaultTranslation] = useState("WEB");
  const [fontSize, setFontSize] = useState("medium");
  const [theme, setTheme] = useState("system");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/preferences', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setDefaultTranslation(data.defaultTranslation || "WEB");
        setFontSize(data.fontSize || "medium");
        setTheme(data.theme || "system");
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
        credentials: 'include',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          defaultTranslation,
          fontSize,
          theme,
        }),
      });

      if (response.ok) {
        setToastMessage("Settings saved successfully!");
        setToastType("success");
        setShowToast(true);
      } else {
        const error = await response.json();
        setToastMessage(error.error || "Failed to save settings");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setToastMessage("An error occurred while saving settings");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <AppHeader user={null} />

      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto py-8 px-6">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bible Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="translation">Default Translation</Label>
                  <Select value={defaultTranslation} onValueChange={setDefaultTranslation} disabled={isLoading}>
                    <SelectTrigger id="translation">
                      <SelectValue placeholder="Select translation" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIBLE_TRANSLATIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize} disabled={isLoading}>
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme} disabled={isLoading}>
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} className="w-full" disabled={isLoading || isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </main>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
