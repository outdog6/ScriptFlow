// lib/AppContext.tsx
"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AppState, NovelChapter, ScriptData } from "./types";
import { parseChapters } from "./parser";

interface AppContextType extends AppState {
  loadText: (text: string) => void;
  setEditorTab: (tab: "novel" | "script") => void;
  setPreviewTab: (tab: "yaml" | "fountain") => void;
  setActiveChapter: (id: number) => void;
  setScript: (yaml: string, data: ScriptData) => void;
  setConverting: (v: boolean) => void;
  setActiveNav: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [activeChapter, setActiveChapter] = useState(1);
  const [yaml, setYaml] = useState("");
  const [script, setScriptData] = useState<ScriptData | null>(null);
  const [editorTab, setEditorTab] = useState<"novel" | "script">("novel");
  const [previewTab, setPreviewTab] = useState<"yaml" | "fountain">("yaml");
  const [converting, setConverting] = useState(false);
  const [activeNav, setActiveNav] = useState("project");

  const mode = chapters.length > 0 ? "editing" : "upload";

  const loadText = useCallback((text: string) => {
    const parsed = parseChapters(text);
    setChapters(parsed);
    setActiveChapter(1);
    setEditorTab("novel");
  }, []);

  const setScript = useCallback((y: string, d: ScriptData) => {
    setYaml(y);
    setScriptData(d);
  }, []);

  return (
    <AppContext.Provider
      value={{
        mode,
        chapters,
        activeChapter,
        yaml,
        script,
        editorTab,
        previewTab,
        converting,
        activeNav,
        loadText,
        setEditorTab,
        setPreviewTab,
        setActiveChapter,
        setScript,
        setConverting,
        setActiveNav,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
