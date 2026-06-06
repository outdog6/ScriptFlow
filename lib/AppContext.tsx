// lib/AppContext.tsx
"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { AppState, NovelChapter, ScriptData, Draft, Project } from "./types";
import { parseChapters } from "./parser";
import { loadDrafts, saveDraft, deleteDraft } from "./drafts";
import { loadProjects, loadActiveProjectId, saveActiveProjectId, createProject, updateProject, deleteProject } from "./projects";

interface AppContextType extends AppState {
  drafts: Draft[];
  projects: Project[];
  activeProjectId: string | null;
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
  createNewProject: () => void;
  switchProject: (id: string) => void;
  removeProject: (id: string) => void;
  setConverting: (v: boolean) => void;
  setActiveNav: (id: string) => void;
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    return (localStorage.getItem("scriptflow-theme") as "light" | "dark") || "light";
  } catch { return "light"; }
}

const AppContext = createContext<AppContextType | null>(null);

function loadProjectState(id: string): Partial<{
  chapters: NovelChapter[]; yaml: string; script: ScriptData | null;
}> {
  const projects = loadProjects();
  const p = projects.find((pr) => pr.id === id);
  if (!p) return {};
  return { chapters: p.chapters, yaml: p.yaml, script: p.script };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
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

  // Init theme + active project
  useEffect(() => { setTheme(getInitialTheme()); }, []);
  useEffect(() => {
    const pid = loadActiveProjectId();
    if (pid) {
      setActiveProjectId(pid);
      const state = loadProjectState(pid);
      if (state.chapters?.length) { setChapters(state.chapters); setActiveChapter(1); setActiveNav("edit"); }
      if (state.yaml) setYaml(state.yaml);
      if (state.script) setScriptData(state.script);
    }
    setProjects(loadProjects());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Auto-save to active project when data changes
  useEffect(() => {
    if (!activeProjectId || chapters.length === 0) return;
    const timer = setTimeout(() => {
      updateProject(activeProjectId, {
        chapters: JSON.parse(JSON.stringify(chapters)),
        yaml,
        script: script ? JSON.parse(JSON.stringify(script)) : null,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [chapters, yaml, script, activeProjectId]);

  const mode = chapters.length > 0 ? "editing" : "upload";

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try { localStorage.setItem("scriptflow-theme", next); } catch {}
      return next;
    });
  }, []);

  const loadText = useCallback((text: string) => {
    const parsed = parseChapters(text);
    const project = createProject("未命名作品", "未知");
    setActiveProjectId(project.id);
    setProjects(loadProjects());
    setChapters(parsed);
    setYaml("");
    setScriptData(null);
    setActiveChapter(1);
    setEditorTab("novel");
    setActiveNav("edit");
  }, []);

  const setScript = useCallback((y: string, d: ScriptData) => {
    setYaml(y);
    setScriptData(d);
    if (activeProjectId) {
      updateProject(activeProjectId, {
        title: d.meta.title,
        yaml: y,
        script: JSON.parse(JSON.stringify(d)),
      });
      setProjects(loadProjects());
    }
  }, [activeProjectId]);

  const autoSaveDraft = useCallback((title: string, y: string, data: ScriptData, chs: NovelChapter[]) => {
    const updated = saveDraft(title, data.meta.source_chapters, y, data, chs);
    setDrafts(updated);
  }, []);

  const removeDraft = useCallback((id: string) => {
    setDrafts(deleteDraft(id));
  }, []);

  const restoreDraft = useCallback((draft: Draft) => {
    if (draft.chapters?.length) setChapters(draft.chapters);
    setYaml(draft.yaml);
    setScriptData(draft.script);
    setEditorTab("script");
    setActiveNav("edit");
  }, []);

  const updateChapterContent = useCallback((id: number, content: string) => {
    setChapters((prev) => prev.map((ch) => (ch.id === id ? { ...ch, content } : ch)));
  }, []);

  const createNewProject = useCallback(() => {
    setChapters([]);
    setYaml("");
    setScriptData(null);
    setActiveChapter(1);
    setEditorTab("novel");
    setActiveNav("edit");
    setActiveProjectId(null);
    saveActiveProjectId(null);
  }, []);

  const switchProject = useCallback((id: string) => {
    setActiveProjectId(id);
    saveActiveProjectId(id);
    const state = loadProjectState(id);
    setChapters(state.chapters || []);
    setYaml(state.yaml || "");
    setScriptData(state.script || null);
    setActiveChapter(1);
    setEditorTab(state.script ? "script" : "novel");
    setActiveNav("edit");
  }, []);

  const removeProject = useCallback((id: string) => {
    const remaining = deleteProject(id);
    setProjects(remaining);
    if (id === activeProjectId) {
      setChapters([]);
      setYaml("");
      setScriptData(null);
      setActiveProjectId(null);
    }
  }, [activeProjectId]);

  const handleSetActiveNav = useCallback((id: string) => {
    if (id === "drafts") setDrafts(loadDrafts());
    if (id === "project") setProjects(loadProjects());
    setActiveNav(id);
  }, []);

  return (
    <AppContext.Provider
      value={{
        mode, chapters, activeChapter, yaml, script,
        editorTab, previewTab, converting, activeNav,
        drafts, projects, activeProjectId, theme,
        toggleTheme, loadText, updateChapterContent,
        setEditorTab, setPreviewTab, setActiveChapter, setScript,
        autoSaveDraft, removeDraft, restoreDraft,
        createNewProject, switchProject, removeProject,
        setConverting, setActiveNav: handleSetActiveNav,
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
