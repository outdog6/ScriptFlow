# AI 小说转剧本工具 — 设计文档

**日期**: 2026-06-05
**项目**: 七牛云 × XEngineer 暑期实训营 第三批次 · 题目三
**开发者**: 单人

---

## 1. 产品概述

将 3 章以上小说文本自动转换为结构化剧本。支持上传小说、AI 分段理解、输出 YAML 格式剧本 + Fountain 格式导出、可视化预览。

### 用户流程

1. 打开工具 → 看到上传区（拖拽文件 / 粘贴文本）
2. 上传后自动按章节分段，左侧显示章节列表
3. 点击「AI 转换」→ 逐章调用 DeepSeek → 生成结构化剧本
4. 中间栏查看格式化剧本，右侧面板看 YAML / Fountain 预览
5. 导出 YAML 或 Fountain 文件

---

## 2. 技术栈

| 层 | 选型 | 原因 |
|----|------|------|
| 框架 | Next.js 14 (App Router) | 前后端一体，API Routes 无需额外服务 |
| 语言 | TypeScript | 类型安全，Schema 与 TS 类型对应 |
| 样式 | Tailwind CSS + CSS Variables | Apple 风格定制，无第三方组件库 |
| 图标 | lucide-react | 轻量、Apple SF Symbols 风格 |
| YAML | js-yaml | 成熟稳定，load + dump 校验 |
| LLM SDK | openai (npm) | DeepSeek API 兼容 OpenAI 协议 |
| 部署 | Vercel / 七牛云静态托管 | 一键部署 |

---

## 3. 架构

```
┌─────────────────────────────────────────────────────┐
│              Next.js 14 App Router                    │
│                                                       │
│  Frontend (React + TypeScript)                        │
│  ├─ Sidebar      章节导航 · 项目列表 · 导出           │
│  ├─ Editor       小说原文 / 剧本预览 / AI 转换按钮     │
│  └─ Preview      深色 YAML 面板 · Fountain 切换       │
│                                                       │
│  Backend (API Routes)                                 │
│  ├─ POST /api/convert   分段 → 调 DeepSeek → 拼 YAML │
│  └─ POST /api/validate  校验 & 修复 YAML 格式         │
│                                                       │
│  External: DeepSeek API (OpenAI 兼容协议)              │
│  Libraries: js-yaml, openai SDK                       │
└─────────────────────────────────────────────────────┘
```

### 数据流

```
用户上传文本
  → 前端正则分段（第X章 / Chapter X）
  → POST /api/convert { chapters: [{id, title, content}] }
  → 后端逐章并发调 DeepSeek
  → 每章返回结构化 JSON → 后端拼装完整 YAML
  → js-yaml 校验 → 失败则自动修复重试
  → 返回 { yaml, scriptData } 给前端
  → 前端渲染卡片式剧本 + 代码高亮 YAML
```

---

## 4. UI 设计

- **风格**: Apple 极简美学（SF 字体体系、毛玻璃、大圆角、克制的 #0071e3 蓝）
- **布局**: 三栏式（左 260px / 中自适应 / 右 360px）
- **左栏**: 毛玻璃侧边栏，项目导航 + 章节列表（状态圆点）+ 导出按钮
- **中栏**: 工具栏（原文/剧本 Tab + AI 转换按钮）+ 内容区（可编辑卡片式剧本）
- **右栏**: 深色 YAML / Fountain 预览面板，语法高亮

---

## 5. YAML Schema

吸收 **Fountain 格式标准** + **DramaBench 六维评估框架**：

```yaml
meta:
  title: string
  author: string
  source_chapters: int
  format: "fountain"

dramatis_personae:
  - id: string
    name: string
    role: string
    archetype: string
    voice: string
    traits: [string]

acts:
  - act: int
    title: string
    summary: string
    source_chapter: int
    dramatic_function: string

    scenes:
      - scene: int
        heading: "INT./EXT. LOCATION — TIME"    # Fountain 标准场景头
        characters: [character_id]
        mood: string                             # Fountain+ 氛围
        visual: string
        conflict_status: "铺垫|升级|转折|暂停|爆发|收束"
        plot_function: string
        emotion_arc:
          start: string
          end: string
          shifts: [string]

        beats:
          - type: action | dialogue
            text: string                         # (action only)
            character: character_id              # (dialogue only)
            parenthetical: string                # Fountain 括号动作
            line: string                         # 台词
            subtext: string                      # 潜台词

        transition: "CUT TO:" | null
```

详见独立 Schema 文档 `docs/script-yaml-schema.md`。

---

## 6. 组件树

```
app/
├── layout.tsx                   # 全局 Layout + 三栏
├── page.tsx                     # 主页面
├── globals.css
│
├── components/
│   ├── Sidebar.tsx
│   │   ├── ProjectNav.tsx
│   │   ├── ChapterList.tsx
│   │   └── ExportButton.tsx
│   ├── EditorPanel.tsx
│   │   ├── EditorToolbar.tsx
│   │   ├── Dropzone.tsx
│   │   ├── NovelView.tsx
│   │   └── ScriptView.tsx
│   │       ├── ActBlock.tsx
│   │       ├── SceneCard.tsx
│   │       └── BeatLine.tsx
│   └── PreviewPanel.tsx
│       ├── YamlView.tsx
│       └── FountainView.tsx
│
├── lib/
│   ├── parser.ts                # 章节分段
│   ├── yaml-builder.ts          # 拼装 YAML
│   ├── yaml-validator.ts        # 校验 + 修复
│   ├── fountain-exporter.ts     # YAML → Fountain
│   └── deepseek.ts              # API 封装
│
└── app/api/
    ├── convert/route.ts         # 调 LLM 转换
    └── validate/route.ts        # YAML 校验
```

### 核心状态（React Context）

```ts
interface AppState {
  mode: 'upload' | 'editing'
  chapters: Chapter[]
  activeChapter: number
  yaml: string
  script: ScriptData | null
  editorTab: 'novel' | 'script'
  previewTab: 'yaml' | 'fountain'
  converting: boolean
}
```

---

## 7. DeepSeek Prompt 策略

### System Prompt 核心约束

- 角色定位：专业编剧 + 剧本格式专家
- 输出格式：严格的 JSON（按 Schema 结构），包裹在 ```json 代码块中
- 关键规则：场景头用 INT./EXT. 格式、角色用 id 引用、冲突状态用枚举值、每句台词带 parenthetical 和 subtext

### 分段策略

- 每章独立发给 DeepSeek（避免单次 token 过大，提高质量）
- 后端用 `Promise.all` 并发请求（DeepSeek 价格低，不担心费用）
- 第一次运行先发 dramatis_personae 提取请求，拿到人物表后再逐章处理场景

### 容错

- YAML 输出前用 `js-yaml.load()` 校验
- 失败则把错误信息反馈给 DeepSeek 重试一次
- 再失败则用 `js-yaml.dump()` 做 normalize 兜底

---

## 8. 交付物

1. **可运行 Web 应用**（Next.js 部署链接）
2. **YAML Schema 设计文档** `docs/script-yaml-schema.md`
3. **Demo 视频**（展示完整流程：上传 → 转换 → 预览 → 导出）
4. **源代码**（GitHub 公开仓库）
