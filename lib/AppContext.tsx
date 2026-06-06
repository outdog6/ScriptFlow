// lib/AppContext.tsx
"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { AppState, NovelChapter, ScriptData, Draft } from "./types";
import { parseChapters } from "./parser";
import { loadDrafts, saveDraft, deleteDraft } from "./drafts";

interface AppContextType extends AppState {
  drafts: Draft[];
  theme: "light" | "dark";
  toggleTheme: () => void;
  loadText: (text: string) => void;
  updateChapterContent: (id: number, content: string) => void;
  setEditorTab: (tab: "novel" | "script") => void;
  setPreviewTab: (tab: "yaml" | "fountain") => void;
  setActiveChapter: (id: number) => void;
  setScript: (yaml: string, data: ScriptData) => void;
  autoSaveDraft: (title: string, yaml: string, data: ScriptData, chapters: NovelChapter[]) => void;
  removeDraft: (id: string) => void;
  restoreDraft: (draft: Draft) => void;
  setConverting: (v: boolean) => void;
  setActiveNav: (id: string) => void;
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    return (localStorage.getItem("scriptflow-theme") as "light" | "dark") || "light";
  } catch {
    return "light";
  }
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
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try { localStorage.setItem("scriptflow-theme", next); } catch {}
      return next;
    });
  }, []);

  const mode = chapters.length > 0 ? "editing" : "upload";

  const loadText = useCallback((text: string) => {
    const parsed = parseChapters(text);
    setChapters(parsed);
    setActiveChapter(1);
    setEditorTab("novel");
    setActiveNav("project");
  }, []);

  const setScript = useCallback((y: string, d: ScriptData) => {
    setYaml(y);
    setScriptData(d);
  }, []);

  const autoSaveDraft = useCallback((title: string, y: string, data: ScriptData, chs: NovelChapter[]) => {
    const updated = saveDraft(title, data.meta.source_chapters, y, data, chs);
    setDrafts(updated);
  }, []);

  const removeDraft = useCallback((id: string) => {
    const updated = deleteDraft(id);
    setDrafts(updated);
  }, []);

  const restoreDraft = useCallback((draft: Draft) => {
    if (draft.chapters?.length) setChapters(draft.chapters);
    setYaml(draft.yaml);
    setScriptData(draft.script);
    setEditorTab("script");
    setActiveNav("project");
  }, []);

  const updateChapterContent = useCallback((id: number, content: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, content } : ch))
    );
  }, []);

  const handleSetActiveNav = useCallback((id: string) => {
    if (id === "drafts") setDrafts(loadDrafts());
    setActiveNav(id);
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
        drafts,
        theme,
        toggleTheme,
        loadText,
        updateChapterContent,
        setEditorTab,
        setPreviewTab,
        setActiveChapter,
        setScript,
        autoSaveDraft,
        removeDraft,
        restoreDraft,
        setConverting,
        setActiveNav: handleSetActiveNav,
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
