import { ScriptData, Draft } from "./types";

const DRAFTS_KEY = "scriptflow_drafts";
const MAX_DRAFTS = 20;

export function loadDrafts(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDraft(
  title: string,
  chapterCount: number,
  yaml: string,
  script: ScriptData
): Draft[] {
  const drafts = loadDrafts();
  const draft: Draft = {
    id: Date.now().toString(36),
    title,
    chapterCount,
    createdAt: new Date().toLocaleString("zh-CN"),
    yaml,
    script,
  };
  drafts.unshift(draft);
  if (drafts.length > MAX_DRAFTS) drafts.pop();
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return drafts;
}

export function deleteDraft(id: string): Draft[] {
  const drafts = loadDrafts().filter((d) => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return drafts;
}
