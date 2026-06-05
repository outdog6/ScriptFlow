// lib/types.ts

export interface NovelChapter {
  id: number;
  title: string;
  content: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  archetype: string;
  voice: string;
  traits: string[];
}

export interface EmotionArc {
  start: string;
  end: string;
  shifts: string[];
}

export type BeatType = "action" | "dialogue";

export interface ActionBeat {
  type: "action";
  text: string;
}

export interface DialogueBeat {
  type: "dialogue";
  character: string;
  parenthetical: string | null;
  line: string;
  subtext: string;
}

export type Beat = ActionBeat | DialogueBeat;

export interface Scene {
  scene: number;
  heading: string;
  characters: string[];
  mood: string;
  visual: string;
  conflict_status: "铺垫" | "升级" | "转折" | "暂停" | "爆发" | "收束";
  plot_function: string;
  emotion_arc: EmotionArc;
  beats: Beat[];
  transition: string | null;
}

export interface Act {
  act: number;
  title: string;
  summary: string;
  source_chapter: number;
  dramatic_function: string;
  scenes: Scene[];
}

export interface ScriptMeta {
  title: string;
  author: string;
  source_chapters: number;
  format: "fountain";
  exported_at: string;
}

export interface ScriptData {
  meta: ScriptMeta;
  dramatis_personae: CharacterProfile[];
  acts: Act[];
}

export interface Draft {
  id: string;
  title: string;
  createdAt: string;
  chapterCount: number;
  yaml: string;
  script: ScriptData;
}

export interface AppState {
  mode: "upload" | "editing";
  chapters: NovelChapter[];
  activeChapter: number;
  yaml: string;
  script: ScriptData | null;
  editorTab: "novel" | "script";
  previewTab: "yaml" | "fountain";
  converting: boolean;
  activeNav: string;
  drafts: Draft[];
}
