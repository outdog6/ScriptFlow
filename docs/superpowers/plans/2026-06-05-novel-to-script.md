# AI 小说转剧本工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app that converts 3+ chapters of novel text into structured screenplay (YAML + Fountain) using DeepSeek API.

**Architecture:** Next.js 14 App Router single-page app with three-column Apple-style UI. Frontend handles text parsing/chapter splitting. Backend API route calls DeepSeek per-chapter, assembles YAML, validates, returns structured data. Right panel shows live YAML/Fountain preview.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, js-yaml, openai SDK, lucide-react

---

## Phase 1: Project Scaffold

### Task 1: Create Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Run create-next-app**

```bash
cd d:/Tools/AI_job/7yun && npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-git
```

Expected: Scaffolded Next.js 14 project in current directory.

- [ ] **Step 2: Install dependencies**

```bash
cd d:/Tools/AI_job/7yun && npm install js-yaml openai lucide-react
npm install -D @types/js-yaml
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server on http://localhost:3000

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js project with dependencies"
```

---

## Phase 2: Types and Core Libraries

### Task 2: Define TypeScript types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write types file**

```typescript
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

export interface AppState {
  mode: "upload" | "editing";
  chapters: NovelChapter[];
  activeChapter: number;
  yaml: string;
  script: ScriptData | null;
  editorTab: "novel" | "script";
  previewTab: "yaml" | "fountain";
  converting: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts && git commit -m "feat: add TypeScript type definitions"
```

### Task 3: Chapter parser

**Files:**
- Create: `lib/parser.ts`

- [ ] **Step 1: Write parser with tests**

```typescript
// lib/parser.ts
import { NovelChapter } from "./types";

export function parseChapters(text: string): NovelChapter[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  const patterns = [
    /(?:第[零一二三四五六七八九十百千万\d]+章)\s*(.*?)(?:\n|$)/g,
    /(?:Chapter\s+\d+).*?(?:\n|$)/gi,
    /(?:#[#]?\s*第[零一二三四五六七八九十百千万\d]+章)/g,
  ];

  for (const pattern of patterns) {
    const matches = [...cleaned.matchAll(pattern)];
    if (matches.length >= 3) {
      const chapters: NovelChapter[] = [];
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index!;
        const end = i < matches.length - 1 ? matches[i + 1].index! : cleaned.length;
        chapters.push({
          id: i + 1,
          title: matches[i][1] || matches[i][0],
          content: cleaned.slice(start, end).trim(),
        });
      }
      return chapters;
    }
  }

  return [
    { id: 1, title: "全文", content: cleaned },
  ];
}

export function countChapters(text: string): number {
  return parseChapters(text).length;
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/parser.ts && git commit -m "feat: add chapter parser"
```

### Task 4: DeepSeek API wrapper

**Files:**
- Create: `lib/deepseek.ts`
- Create: `.env.local`

- [ ] **Step 1: Write API wrapper**

```typescript
// lib/deepseek.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com/v1",
});

export interface LLMResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

const SYSTEM_PROMPT = `你是一位专业编剧，擅长将小说文本转换为标准剧本格式。

请严格按照以下 JSON Schema 输出，包裹在 \`\`\`json 代码块中：

{
  "dramatis_personae": [
    { "id": "角色英文ID", "name": "角色名", "role": "主角/配角/反派/路人", "archetype": "原型", "voice": "说话风格", "traits": ["特征1"] }
  ],
  "scenes": [
    {
      "scene": 1,
      "heading": "INT./EXT. 地点 — 时间",
      "characters": ["角色ID"],
      "mood": "氛围",
      "visual": "视觉描述",
      "conflict_status": "铺垫|升级|转折|暂停|爆发|收束",
      "plot_function": "叙事功能",
      "emotion_arc": { "start": "开始情绪", "end": "结束情绪", "shifts": ["情绪变化"] },
      "beats": [
        { "type": "action", "text": "动作描述" },
        { "type": "dialogue", "character": "角色ID", "parenthetical": "动作", "line": "台词", "subtext": "潜台词" }
      ],
      "transition": "CUT TO:"
    }
  ]
}

规则：
1. heading 必须用 INT./EXT. 标准格式
2. 每句角色台词都带 parenthetical（动作说明）和 subtext（潜台词）
3. conflict_status 只用枚举值
4. 对话的 character 字段用 dramatis_personae 中定义的 id
5. 准确提取小说中的场景、动作和对话，不要遗漏`;

export async function extractCharacters(
  chapterTitle: string,
  chapterContent: string
): Promise<LLMResponse> {
  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `请提取以下小说章节中的人物表（dramatis_personae）：\n\n## ${chapterTitle}\n\n${chapterContent.slice(0, 8000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });
    const content = response.choices[0]?.message?.content || "";
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function convertChapterToScenes(
  chapterTitle: string,
  chapterContent: string,
  characters: string
): Promise<LLMResponse> {
  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `已知人物表：${characters}\n\n请将以下小说章节转换为剧本场景：\n\n## ${chapterTitle}\n\n${chapterContent.slice(0, 16000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 8192,
    });
    const content = response.choices[0]?.message?.content || "";
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

- [ ] **Step 2: Create environment file**

`.env.local`:
```
DEEPSEEK_API_KEY=your_api_key_here
```

- [ ] **Step 3: Commit**

```bash
git add lib/deepseek.ts .env.local && git commit -m "feat: add DeepSeek API wrapper"
```

### Task 5: YAML utilities

**Files:**
- Create: `lib/yaml-builder.ts`
- Create: `lib/yaml-validator.ts`

- [ ] **Step 1: Write YAML builder**

```typescript
// lib/yaml-builder.ts
import yaml from "js-yaml";
import { ScriptData, Act, Scene, CharacterProfile } from "./types";

export function buildYaml(script: ScriptData): string {
  return yaml.dump(script, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  });
}

export function createEmptyScriptData(title: string, author: string): ScriptData {
  return {
    meta: {
      title,
      author,
      source_chapters: 0,
      format: "fountain",
      exported_at: "",
    },
    dramatis_personae: [],
    acts: [],
  };
}

export function assembleScriptData(
  meta: ScriptData["meta"],
  personae: CharacterProfile[],
  acts: Act[]
): ScriptData {
  return {
    meta,
    dramatis_personae: personae,
    acts,
  };
}
```

- [ ] **Step 2: Write YAML validator**

```typescript
// lib/yaml-validator.ts
import yaml from "js-yaml";
import { ScriptData } from "./types";

export interface ValidationResult {
  valid: boolean;
  data?: ScriptData;
  error?: string;
}

export function validateYaml(yamlString: string): ValidationResult {
  try {
    const data = yaml.load(yamlString) as ScriptData;

    if (!data.meta) return { valid: false, error: "Missing meta section" };
    if (!data.acts || !Array.isArray(data.acts)) {
      return { valid: false, error: "Missing or invalid acts array" };
    }

    for (const act of data.acts) {
      if (!act.scenes || !Array.isArray(act.scenes)) {
        return { valid: false, error: `Act ${act.act}: missing scenes array` };
      }
      for (const scene of act.scenes) {
        if (!scene.heading) {
          return { valid: false, error: `Act ${act.act} Scene ${scene.scene}: missing heading` };
        }
        if (!scene.beats || !Array.isArray(scene.beats)) {
          return { valid: false, error: `Act ${act.act} Scene ${scene.scene}: missing beats` };
        }
      }
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: String(error) };
  }
}

export function normalizeYaml(yamlString: string): string {
  try {
    const data = yaml.load(yamlString);
    return yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      quotingType: '"',
      forceQuotes: false,
    });
  } catch {
    return yamlString;
  }
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add lib/yaml-builder.ts lib/yaml-validator.ts && git commit -m "feat: add YAML build and validation utilities"
```

### Task 6: Fountain exporter

**Files:**
- Create: `lib/fountain-exporter.ts`

- [ ] **Step 1: Write Fountain exporter**

```typescript
// lib/fountain-exporter.ts
import { ScriptData, ActionBeat, DialogueBeat } from "./types";

export function exportFountain(script: ScriptData): string {
  const lines: string[] = [];

  // Title page
  lines.push(`Title: ${script.meta.title}`);
  lines.push(`Author: ${script.meta.author}`);
  lines.push(`Source Chapters: ${script.meta.source_chapters}`);
  lines.push("");
  lines.push("===");
  lines.push("");

  for (const act of script.acts) {
    lines.push(`# ${act.title}`);
    lines.push("");
    lines.push(`// ${act.summary}`);
    lines.push("");

    for (const scene of act.scenes) {
      // Scene heading
      lines.push(scene.heading);
      lines.push("");

      // Visual description
      if (scene.visual) {
        lines.push(scene.visual);
        lines.push("");
      }

      // Beats
      for (const beat of scene.beats) {
        if (beat.type === "action") {
          lines.push((beat as ActionBeat).text);
          lines.push("");
        } else {
          const d = beat as DialogueBeat;
          const char = script.dramatis_personae.find((p) => p.id === d.character);
          lines.push(`          ${char?.name || d.character}`);
          if (d.parenthetical) {
            lines.push(`    (${d.parenthetical})`);
          }
          lines.push(d.line);
          lines.push("");
        }
      }

      // Transition
      if (scene.transition) {
        lines.push(scene.transition);
        lines.push("");
      }

      lines.push("");
    }
  }

  return lines.join("\n");
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/fountain-exporter.ts && git commit -m "feat: add Fountain format exporter"
```

---

## Phase 3: API Routes

### Task 7: Convert API route

**Files:**
- Create: `app/api/convert/route.ts`

- [ ] **Step 1: Write convert route**

```typescript
// app/api/convert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractCharacters, convertChapterToScenes } from "@/lib/deepseek";
import { NovelChapter, CharacterProfile, Act, Scene } from "@/lib/types";
import { assembleScriptData, buildYaml } from "@/lib/yaml-builder";
import { validateYaml, normalizeYaml } from "@/lib/yaml-validator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, chapters } = body as {
      title: string;
      author: string;
      chapters: NovelChapter[];
    };

    if (!chapters || chapters.length < 3) {
      return NextResponse.json(
        { error: "需要至少 3 个章节" },
        { status: 400 }
      );
    }

    // Step 1: Extract characters from all chapters
    const allContent = chapters.map((c) => c.content).join("\n\n");
    const charResult = await extractCharacters("全篇人物提取", allContent);

    if (!charResult.success) {
      return NextResponse.json(
        { error: "人物提取失败", detail: charResult.error },
        { status: 500 }
      );
    }

    // Parse character list from first response
    const personae = extractPersonaeFromResponse(charResult.data as string);

    // Step 2: Convert each chapter concurrently
    const charSummary = personae
      .map((p) => `${p.id} (${p.name}, ${p.role}): ${p.voice}`)
      .join("\n");

    const sceneResults = await Promise.all(
      chapters.map((ch) =>
        convertChapterToScenes(ch.title, ch.content, charSummary)
      )
    );

    // Step 3: Parse scenes from each chapter
    const acts: Act[] = [];
    let sceneCounter = 1;

    for (let i = 0; i < sceneResults.length; i++) {
      const result = sceneResults[i];
      if (!result.success) {
        return NextResponse.json(
          { error: `章节 ${chapters[i].title} 转换失败`, detail: result.error },
          { status: 500 }
        );
      }

      const chapterScenes = parseScenesFromResponse(
        result.data as string,
        i + 1,
        chapters[i].title,
        chapters[i].id,
        sceneCounter
      );
      sceneCounter += chapterScenes.length;

      acts.push({
        act: i + 1,
        title: chapters[i].title,
        summary: `源自小说第${chapters[i].id}章`,
        source_chapter: chapters[i].id,
        dramatic_function: "",
        scenes: chapterScenes,
      });
    }

    // Step 4: Assemble and validate
    const scriptData = assembleScriptData(
      {
        title,
        author,
        source_chapters: chapters.length,
        format: "fountain",
        exported_at: new Date().toISOString(),
      },
      personae,
      acts
    );

    let yamlString = buildYaml(scriptData);
    const validation = validateYaml(yamlString);

    if (!validation.valid) {
      yamlString = normalizeYaml(yamlString);
      const retry = validateYaml(yamlString);
      if (!retry.valid) {
        return NextResponse.json(
          { error: "YAML 校验失败", detail: validation.error },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      yaml: yamlString,
      script: scriptData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "服务器内部错误", detail: String(error) },
      { status: 500 }
    );
  }
}

function extractPersonaeFromResponse(response: string): CharacterProfile[] {
  try {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      return data.dramatis_personae || [];
    }
  } catch {}
  return [];
}

function parseScenesFromResponse(
  response: string,
  actNumber: number,
  actTitle: string,
  sourceChapter: number,
  startScene: number
): Scene[] {
  try {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      const scenes: Scene[] = (data.scenes || []).map((s: Scene, i: number) => ({
        ...s,
        scene: startScene + i,
      }));
      return scenes;
    }
  } catch {}
  return [];
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/api/convert/route.ts && git commit -m "feat: add convert API route"
```

---

## Phase 4: UI Components (Bottom-Up)

### Task 8: Apple-style globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace globals.css with Apple theme**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --apple-bg: #f5f5f7;
  --apple-white: #ffffff;
  --apple-text: #1d1d1f;
  --apple-secondary: #86868b;
  --apple-blue: #0071e3;
  --apple-blue-hover: #0077ed;
  --apple-border: rgba(0, 0, 0, 0.08);
  --apple-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  --apple-green: #34c759;
  --sidebar-width: 260px;
  --preview-width: 360px;
}

* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  background: var(--apple-bg);
  color: var(--apple-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

/* Frosted glass */
.glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css && git commit -m "style: add Apple design system CSS variables"
```

### Task 9: BeatLine component

**Files:**
- Create: `components/BeatLine.tsx`

- [ ] **Step 1: Write BeatLine**

```tsx
// components/BeatLine.tsx
import { Beat, ActionBeat, DialogueBeat } from "@/lib/types";

interface Props {
  beat: Beat;
  characterName?: (id: string) => string;
}

export default function BeatLine({ beat, characterName }: Props) {
  if (beat.type === "action") {
    return (
      <p className="py-1 text-sm text-[#636366] italic leading-relaxed">
        {(beat as ActionBeat).text}
      </p>
    );
  }

  const d = beat as DialogueBeat;
  return (
    <div className="py-1.5">
      <p className="text-[15px] leading-relaxed">
        <span className="font-semibold text-[#0071e3] mr-2">
          {characterName ? characterName(d.character) : d.character}
        </span>
        {d.parenthetical && (
          <span className="text-[#86868b] text-sm">（{d.parenthetical}）</span>
        )}
        <span className="ml-1">{d.line}</span>
      </p>
      {d.subtext && (
        <p className="text-xs text-[#aeaeb2] mt-0.5 ml-1 italic">
          {'// ' + d.subtext}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/BeatLine.tsx && git commit -m "feat: add BeatLine component"
```

### Task 10: SceneCard component

**Files:**
- Create: `components/SceneCard.tsx`

- [ ] **Step 1: Write SceneCard**

```tsx
// components/SceneCard.tsx
import { Scene } from "@/lib/types";
import BeatLine from "./BeatLine";

interface Props {
  scene: Scene;
  characterName: (id: string) => string;
}

export default function SceneCard({ scene, characterName }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
          第 {scene.scene} 场
        </span>
        <span className="w-1 h-1 rounded-full bg-[#86868b]" />
        <span className="text-[13px] text-[#86868b]">{scene.heading}</span>
        {scene.mood && (
          <>
            <span className="w-1 h-1 rounded-full bg-[#86868b]" />
            <span className="text-[12px] text-[#aeaeb2]">{scene.mood}</span>
          </>
        )}
      </div>

      {scene.visual && (
        <p className="text-[13px] text-[#86868b] italic mb-4 pl-0.5">
          {scene.visual}
        </p>
      )}

      {scene.plot_function && (
        <p className="text-[11px] text-[#aeaeb2] mb-4 uppercase tracking-wider">
          叙事功能：{scene.plot_function}
        </p>
      )}

      <div className="space-y-0.5">
        {scene.beats.map((beat, i) => (
          <BeatLine key={i} beat={beat} characterName={characterName} />
        ))}
      </div>

      {scene.transition && (
        <p className="text-center pt-4 text-xs font-medium uppercase tracking-wider text-[#86868b]">
          {scene.transition}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/SceneCard.tsx && git commit -m "feat: add SceneCard component"
```

### Task 11: ActBlock component

**Files:**
- Create: `components/ActBlock.tsx`

- [ ] **Step 1: Write ActBlock**

```tsx
// components/ActBlock.tsx
import { Act } from "@/lib/types";
import SceneCard from "./SceneCard";

interface Props {
  act: Act;
  characterName: (id: string) => string;
}

export default function ActBlock({ act, characterName }: Props) {
  return (
    <div className="mb-8">
      <div className="mb-1">
        <span className="text-[11px] font-semibold text-[#0071e3] uppercase tracking-wider">
          第 {act.act} 幕
        </span>
      </div>
      <h2 className="text-[28px] font-bold tracking-[-0.5px] text-[#1d1d1f] mb-1">
        {act.title}
      </h2>
      {act.summary && (
        <p className="text-[14px] text-[#86868b] mb-6">{act.summary}</p>
      )}

      <div>
        {act.scenes.map((scene) => (
          <SceneCard key={scene.scene} scene={scene} characterName={characterName} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/ActBlock.tsx && git commit -m "feat: add ActBlock component"
```

### Task 12: ScriptView component

**Files:**
- Create: `components/ScriptView.tsx`

- [ ] **Step 1: Write ScriptView**

```tsx
// components/ScriptView.tsx
import { ScriptData } from "@/lib/types";
import ActBlock from "./ActBlock";

interface Props {
  script: ScriptData;
}

export default function ScriptView({ script }: Props) {
  const getName = (id: string): string => {
    const person = script.dramatis_personae.find((p) => p.id === id);
    return person?.name || id;
  };

  return (
    <div className="max-w-[720px] mx-auto py-8">
      {script.acts.map((act) => (
        <ActBlock key={act.act} act={act} characterName={getName} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/ScriptView.tsx && git commit -m "feat: add ScriptView component"
```

### Task 13: NovelView and Dropzone components

**Files:**
- Create: `components/NovelView.tsx`
- Create: `components/Dropzone.tsx`

- [ ] **Step 1: Write NovelView**

```tsx
// components/NovelView.tsx
import { NovelChapter } from "@/lib/types";

interface Props {
  chapters: NovelChapter[];
  activeChapter: number;
  onSelectChapter: (id: number) => void;
}

export default function NovelView({ chapters, activeChapter, onSelectChapter }: Props) {
  const chapter = chapters.find((c) => c.id === activeChapter);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 px-8 pt-4 pb-2 overflow-x-auto">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSelectChapter(ch.id)}
            className={`px-4 py-2 text-[13px] font-medium rounded-lg whitespace-nowrap transition-all ${
              ch.id === activeChapter
                ? "bg-[#0071e3] text-white"
                : "bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
            }`}
          >
            {ch.title}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[720px] mx-auto">
          <pre className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans text-[#1d1d1f]">
            {chapter?.content || "请选择章节"}
          </pre>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write Dropzone**

```tsx
// components/Dropzone.tsx
"use client";
import { useState, useCallback, DragEvent } from "react";
import { Upload, ClipboardPaste } from "lucide-react";

interface Props {
  onTextLoaded: (text: string) => void;
}

export default function Dropzone({ onTextLoaded }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          onTextLoaded(ev.target?.result as string);
        };
        reader.readAsText(file);
      }
    },
    [onTextLoaded]
  );

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) onTextLoaded(text);
    } catch {
      alert("无法读取剪贴板，请手动粘贴");
    }
  }, [onTextLoaded]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-[360px] h-[220px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-white ${
          dragging
            ? "border-[#0071e3] bg-[rgba(0,113,227,0.03)]"
            : "border-[rgba(0,0,0,0.15)] hover:border-[#0071e3] hover:bg-[rgba(0,113,227,0.03)]"
        }`}
      >
        <Upload className="w-10 h-10 text-[#86868b]" strokeWidth={1.5} />
        <p className="text-[15px] font-medium text-[#1d1d1f]">拖拽小说文件到此处</p>
        <p className="text-[12px] text-[#86868b]">支持 .txt 文件，UTF-8 编码</p>
      </div>

      <span className="text-[13px] text-[#86868b]">或</span>

      <button
        onClick={handlePaste}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(0,0,0,0.15)] bg-white text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all"
      >
        <ClipboardPaste className="w-4 h-4" strokeWidth={1.5} />
        从剪贴板粘贴
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/NovelView.tsx components/Dropzone.tsx && git commit -m "feat: add NovelView and Dropzone components"
```

### Task 14: EditorToolbar component

**Files:**
- Create: `components/EditorToolbar.tsx`

- [ ] **Step 1: Write EditorToolbar**

```tsx
// components/EditorToolbar.tsx
import { Undo2, Redo2, Sparkles } from "lucide-react";

interface Props {
  editorTab: "novel" | "script";
  onTabChange: (tab: "novel" | "script") => void;
  onConvert: () => void;
  converting: boolean;
}

export default function EditorToolbar({
  editorTab,
  onTabChange,
  onConvert,
  converting,
}: Props) {
  return (
    <div className="glass flex items-center justify-between px-6 py-3 border-b border-[rgba(0,0,0,0.06)]">
      <div className="flex gap-1 bg-[rgba(0,0,0,0.04)] p-0.5 rounded-lg">
        {(["novel", "script"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
              editorTab === tab
                ? "bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {tab === "novel" ? "原文" : "剧本"}
          </button>
        ))}
      </div>

      <button
        onClick={onConvert}
        disabled={converting}
        className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0077ed] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className={`w-4 h-4 ${converting ? "animate-spin" : ""}`} strokeWidth={1.5} />
        {converting ? "转换中..." : "AI 转换"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/EditorToolbar.tsx && git commit -m "feat: add EditorToolbar component"
```

### Task 15: EditorPanel component

**Files:**
- Create: `components/EditorPanel.tsx`

- [ ] **Step 1: Write EditorPanel**

```tsx
// components/EditorPanel.tsx
import { NovelChapter, ScriptData } from "@/lib/types";
import EditorToolbar from "./EditorToolbar";
import Dropzone from "./Dropzone";
import NovelView from "./NovelView";
import ScriptView from "./ScriptView";

interface Props {
  mode: "upload" | "editing";
  chapters: NovelChapter[];
  activeChapter: number;
  script: ScriptData | null;
  editorTab: "novel" | "script";
  converting: boolean;
  onTextLoaded: (text: string) => void;
  onTabChange: (tab: "novel" | "script") => void;
  onConvert: () => void;
  onSelectChapter: (id: number) => void;
}

export default function EditorPanel({
  mode,
  chapters,
  activeChapter,
  script,
  editorTab,
  converting,
  onTextLoaded,
  onTabChange,
  onConvert,
  onSelectChapter,
}: Props) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <EditorToolbar
        editorTab={editorTab}
        onTabChange={onTabChange}
        onConvert={onConvert}
        converting={converting}
      />

      <div className="flex-1 overflow-y-auto">
        {mode === "upload" ? (
          <Dropzone onTextLoaded={onTextLoaded} />
        ) : editorTab === "novel" ? (
          <NovelView
            chapters={chapters}
            activeChapter={activeChapter}
            onSelectChapter={onSelectChapter}
          />
        ) : script ? (
          <ScriptView script={script} />
        ) : (
          <div className="flex items-center justify-center h-full text-[#86868b] text-[14px]">
            点击右上角「AI 转换」生成剧本
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/EditorPanel.tsx && git commit -m "feat: add EditorPanel component"
```

### Task 16: YAML and Fountain preview views

**Files:**
- Create: `components/YamlView.tsx`
- Create: `components/FountainView.tsx`

- [ ] **Step 1: Write YamlView**

```tsx
// components/YamlView.tsx
interface Props {
  yaml: string;
}

function highlightYaml(yaml: string): string {
  return yaml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^(\s*)([\w-]+)(:)/gm, '$1<span style="color:#5e9cf7">$2</span>$3')
    .replace(/:\s*"([^"]*)"/g, ': <span style="color:#7ecb6e">"$1"</span>')
    .replace(/:\s*(\d+)/gm, ': <span style="color:#ee9d5c">$1</span>')
    .replace(/^(\s*#.*)$/gm, '<span style="color:#636366">$1</span>');
}

export default function YamlView({ yaml }: Props) {
  return (
    <pre
      className="bg-[#1d1d1f] rounded-xl p-5 font-mono text-[12px] leading-[1.8] text-[#f5f5f7] whitespace-pre-wrap overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: highlightYaml(yaml) }}
    />
  );
}
```

- [ ] **Step 2: Write FountainView**

```tsx
// components/FountainView.tsx
import { ScriptData } from "@/lib/types";
import { exportFountain } from "@/lib/fountain-exporter";

interface Props {
  script: ScriptData;
}

export default function FountainView({ script }: Props) {
  const fountain = exportFountain(script);

  return (
    <pre className="bg-[#1d1d1f] rounded-xl p-5 font-mono text-[12px] leading-[1.8] text-[#f5f5f7] whitespace-pre-wrap overflow-x-auto">
      {fountain}
    </pre>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/YamlView.tsx components/FountainView.tsx && git commit -m "feat: add YAML and Fountain preview views"
```

### Task 17: PreviewPanel component

**Files:**
- Create: `components/PreviewPanel.tsx`

- [ ] **Step 1: Write PreviewPanel**

```tsx
// components/PreviewPanel.tsx
import { ScriptData } from "@/lib/types";
import YamlView from "./YamlView";
import FountainView from "./FountainView";
import { Copy } from "lucide-react";

interface Props {
  yaml: string;
  script: ScriptData | null;
  previewTab: "yaml" | "fountain";
  onTabChange: (tab: "yaml" | "fountain") => void;
}

export default function PreviewPanel({ yaml, script, previewTab, onTabChange }: Props) {
  const handleCopy = () => {
    const content = previewTab === "yaml" ? yaml : "";
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  if (!yaml && !script) {
    return (
      <div className="w-[360px] bg-white border-l border-[rgba(0,0,0,0.08)] flex items-center justify-center">
        <p className="text-[14px] text-[#86868b]">生成剧本后将在此预览</p>
      </div>
    );
  }

  return (
    <div className="w-[360px] bg-white border-l border-[rgba(0,0,0,0.08)] flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex gap-4">
          {(["yaml", "fountain"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`text-[12px] pb-2 -mb-[1px] font-medium transition-all ${
                previewTab === tab
                  ? "text-[#0071e3] border-b-2 border-[#0071e3]"
                  : "text-[#86868b] hover:text-[#1d1d1f]"
              }`}
            >
              {tab === "yaml" ? "YAML" : "Fountain"}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(0,0,0,0.04)] transition-all text-[#86868b]"
          title="复制"
        >
          <Copy className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {previewTab === "yaml" ? (
          <YamlView yaml={yaml} />
        ) : script ? (
          <FountainView script={script} />
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/PreviewPanel.tsx && git commit -m "feat: add PreviewPanel component"
```

### Task 18: Sidebar components

**Files:**
- Create: `components/ProjectNav.tsx`
- Create: `components/ChapterList.tsx`
- Create: `components/ExportButton.tsx`
- Create: `components/Sidebar.tsx`

- [ ] **Step 1: Write ProjectNav**

```tsx
// components/ProjectNav.tsx
import { BookOpen, FileText, Download } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

interface Props {
  activeItem: string;
  onNavigate: (id: string) => void;
}

const items: NavItem[] = [
  { id: "project", label: "我的项目", icon: <BookOpen className="w-[18px]" strokeWidth={1.5} /> },
  { id: "drafts", label: "草稿", icon: <FileText className="w-[18px]" strokeWidth={1.5} /> },
  { id: "exports", label: "导出记录", icon: <Download className="w-[18px]" strokeWidth={1.5} /> },
];

export default function ProjectNav({ activeItem, onNavigate }: Props) {
  return (
    <div className="space-y-0.5 px-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-[14px] rounded-lg transition-all ${
            activeItem === item.id
              ? "bg-[rgba(0,113,227,0.1)] text-[#0071e3] font-medium"
              : "text-[#1d1d1f] hover:bg-[rgba(0,0,0,0.04)]"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write ChapterList**

```tsx
// components/ChapterList.tsx
import { NovelChapter } from "@/lib/types";

interface Props {
  chapters: NovelChapter[];
  activeChapter: number;
  converting: boolean;
  onSelectChapter: (id: number) => void;
}

export default function ChapterList({ chapters, activeChapter, converting, onSelectChapter }: Props) {
  return (
    <div>
      <p className="px-5 pt-4 pb-2 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
        章节列表
      </p>
      <div className="px-2">
        {chapters.map((ch) => {
          const isActive = ch.id === activeChapter;
          const isConverting = converting && isActive;
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className={`flex items-center gap-2 w-full px-3 py-2 text-[13px] rounded-lg transition-all ${
                isActive
                  ? "bg-[rgba(0,113,227,0.1)] text-[#0071e3]"
                  : "text-[#1d1d1f] hover:bg-[rgba(0,0,0,0.04)]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  isConverting ? "bg-[#ff9f0a] animate-pulse" : isActive ? "bg-[#0071e3]" : "bg-[#86868b]"
                }`}
              />
              <span className="truncate text-left">{ch.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write ExportButton**

```tsx
// components/ExportButton.tsx
import { Download } from "lucide-react";

interface Props {
  yaml: string;
  scriptTitle: string;
}

export default function ExportButton({ yaml, scriptTitle }: Props) {
  const handleExportYaml = () => {
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scriptTitle || "script"}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!yaml) return null;

  return (
    <button
      onClick={handleExportYaml}
      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] transition-all"
    >
      <Download className="w-4 h-4" strokeWidth={1.5} />
      导出 YAML
    </button>
  );
}
```

- [ ] **Step 4: Write Sidebar**

```tsx
// components/Sidebar.tsx
import { NovelChapter } from "@/lib/types";
import ProjectNav from "./ProjectNav";
import ChapterList from "./ChapterList";
import ExportButton from "./ExportButton";

interface Props {
  chapters: NovelChapter[];
  activeChapter: number;
  converting: boolean;
  yaml: string;
  scriptTitle: string;
  activeNav: string;
  onNavigate: (id: string) => void;
  onSelectChapter: (id: number) => void;
}

export default function Sidebar({
  chapters,
  activeChapter,
  converting,
  yaml,
  scriptTitle,
  activeNav,
  onNavigate,
  onSelectChapter,
}: Props) {
  return (
    <div className="glass w-[260px] border-r border-[rgba(0,0,0,0.08)] flex flex-col">
      <div className="px-5 py-6 border-b border-[rgba(0,0,0,0.06)]">
        <h1 className="text-[20px] font-bold tracking-[-0.3px] text-[#1d1d1f]">
          Script<span className="text-[#0071e3]">Flow</span>
        </h1>
      </div>

      <div className="py-2">
        <ProjectNav activeItem={activeNav} onNavigate={onNavigate} />
      </div>

      {chapters.length > 0 && (
        <ChapterList
          chapters={chapters}
          activeChapter={activeChapter}
          converting={converting}
          onSelectChapter={onSelectChapter}
        />
      )}

      <div className="mt-auto p-4 border-t border-[rgba(0,0,0,0.06)]">
        <ExportButton yaml={yaml} scriptTitle={scriptTitle} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add components/ProjectNav.tsx components/ChapterList.tsx components/ExportButton.tsx components/Sidebar.tsx && git commit -m "feat: add Sidebar and sub-components"
```

---

## Phase 5: Integration

### Task 19: App context provider

**Files:**
- Create: `lib/AppContext.tsx`

- [ ] **Step 1: Write context**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/AppContext.tsx && git commit -m "feat: add AppContext state management"
```

### Task 20: Root layout and page

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write layout**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { AppProvider } from "@/lib/AppContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScriptFlow - AI 小说转剧本",
  description: "将小说自动转换为结构化剧本",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="h-screen overflow-hidden">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write page**

```tsx
// app/page.tsx
"use client";
import { useApp } from "@/lib/AppContext";
import Sidebar from "@/components/Sidebar";
import EditorPanel from "@/components/EditorPanel";
import PreviewPanel from "@/components/PreviewPanel";

export default function Home() {
  const {
    mode,
    chapters,
    activeChapter,
    yaml,
    script,
    editorTab,
    previewTab,
    converting,
    loadText,
    setEditorTab,
    setPreviewTab,
    setActiveChapter,
    setScript,
    setConverting,
  } = useApp();

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "未命名作品",
          author: "未知",
          chapters,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert("转换失败：" + data.error);
      } else {
        setScript(data.yaml, data.script);
        setEditorTab("script");
      }
    } catch (err) {
      alert("请求失败：" + String(err));
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5f7]">
      <Sidebar
        chapters={chapters}
        activeChapter={activeChapter}
        converting={converting}
        yaml={yaml}
        scriptTitle={script?.meta?.title || ""}
        activeNav="project"
        onNavigate={() => {}}
        onSelectChapter={setActiveChapter}
      />

      <EditorPanel
        mode={mode}
        chapters={chapters}
        activeChapter={activeChapter}
        script={script}
        editorTab={editorTab}
        converting={converting}
        onTextLoaded={loadText}
        onTabChange={setEditorTab}
        onConvert={handleConvert}
        onSelectChapter={setActiveChapter}
      />

      <PreviewPanel
        yaml={yaml}
        script={script}
        previewTab={previewTab}
        onTabChange={setPreviewTab}
      />
    </div>
  );
}
```

- [ ] **Step 3: Start dev server and verify**

```bash
npm run dev
```

Open http://localhost:3000 — verify the three-column layout renders with upload dropzone.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx && git commit -m "feat: integrate AppContext with layout and page"
```

---

## Phase 6: Polish & Documentation

### Task 21: Error handling and loading states

**Files:**
- Create: `components/Toast.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write Toast component**

```tsx
// components/Toast.tsx
"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface Props {
  message: string;
  type?: "error" | "success";
  onClose: () => void;
}

export default function Toast({ message, type = "error", onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${
        type === "success"
          ? "bg-[#34c759] text-white"
          : "bg-[#ff3b30] text-white"
      }`}
    >
      <span className="text-[14px] font-medium">{message}</span>
      <button onClick={onClose} className="hover:opacity-70">
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Add Toast to page.tsx** — Replace the `alert()` calls with Toast state management in `page.tsx`. Add `useState` for `toast` and wrap handleConvert errors to set toast message. Render `<Toast>` at top of Home component.

- [ ] **Step 3: Commit**

```bash
git add components/Toast.tsx app/page.tsx && git commit -m "feat: add Toast notifications for error handling"
```

### Task 22: Schema documentation

**Files:**
- Create: `docs/script-yaml-schema.md`

- [ ] **Step 1: Write schema documentation**

Write `docs/script-yaml-schema.md` covering:
1. Schema overview and design philosophy
2. Why YAML + Fountain hybrid approach
3. Field-by-field reference with types and examples
4. Design rationale linking to DramaBench six dimensions
5. Fountain compatibility notes
6. Extensibility considerations

- [ ] **Step 2: Commit**

```bash
git add docs/script-yaml-schema.md && git commit -m "docs: add YAML schema design documentation"
```

---

## Task Order Dependency Graph

```
Phase 1: Task 1 (scaffold)
  └─> Phase 2: Task 2 (types) → Task 3,4,5,6 (libs, in parallel)
        └─> Phase 3: Task 7 (API route)
              └─> Phase 4: Task 8 (CSS) → Task 9-12 → Task 13 → Task 14-15 → Task 16-17 → Task 18
                    └─> Phase 5: Task 19 → Task 20
                          └─> Phase 6: Task 21 → Task 22

Estimated total: ~22 commits, ~4 hours of focused work
```
