// lib/AppContext.tsx
"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AppState, NovelChapter, ScriptData, Draft } from "./types";
import { parseChapters } from "./parser";
import { loadDrafts, saveDraft, deleteDraft } from "./drafts";

interface AppContextType extends AppState {
  drafts: Draft[];
  loadText: (text: string) => void;
  setEditorTab: (tab: "novel" | "script") => void;
  setPreviewTab: (tab: "yaml" | "fountain") => void;
  setActiveChapter: (id: number) => void;
  setScript: (yaml: string, data: ScriptData) => void;
  autoSaveDraft: (title: string, yaml: string, data: ScriptData) => void;
  removeDraft: (id: string) => void;
  restoreDraft: (draft: Draft) => void;
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
  const [drafts, setDrafts] = useState<Draft[]>([]);

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

  const autoSaveDraft = useCallback((title: string, y: string, data: ScriptData) => {
    const updated = saveDraft(title, data.meta.source_chapters, y, data);
    setDrafts(updated);
  }, []);

  const removeDraft = useCallback((id: string) => {
    const updated = deleteDraft(id);
    setDrafts(updated);
  }, []);

  const restoreDraft = useCallback((draft: Draft) => {
    setYaml(draft.yaml);
    setScriptData(draft.script);
    setEditorTab("script");
    setActiveNav("project");
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
        loadText,
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
