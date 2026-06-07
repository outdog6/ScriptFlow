# ScriptFlow —— 电影化写作桌面 × AI 剧本转化

### 🎬 [▶ 演示视频（Bilibili）](https://www.bilibili.com/video/BV1vpEb6REKY/)

导入小说，AI 自动拆章、识别人物、生成结构化剧本。界面不是表单——是一张**作家的桌子**。

七牛云 × XEngineer 暑期实训营 第三批次 · 题目三

## 为什么不是按钮

| 桌面物件 | 功能 | 交互 |
|---------|------|------|
| 🪔 台灯 | AI 转化 | 拖拽拉绳 >50px 触发，松手弹力回弹 |
| 📖 书本 | 编辑器+预览 | 左页=原文/剧本，右页=YAML/Fountain |
| 🎀 丝绸书签 | 导航 | 右上角丝带，点击切换项目/草稿/章节 |
| 🪶 羽毛笔+墨水瓶 | 导出 | 点击选格式→笔飞向羊皮纸→画出墨迹→下载 |
| 🔮 灯珠 | 主题 | 台灯底座小灯珠，循环 5 组电影调色板 |

**首次访问有完整仪式**：暗桌 → 拖绳开灯 → 光束扩散 → 尘粒漂浮 → 书本翻开 → 丝带浮现。

## 功能

- **智能拆章** — 自动识别中文章节标记（"第X章"/"Chapter X" 等）
- **AI 转化** — 调用 DeepSeek API 将小说转成结构化剧本（人物/场景/对白/潜台词）
- **双栏编辑** — 左页原文可手动修改，右页实时预览转化结果
- **项目+草稿** — localStorage 持久化，多项目管理，自动存档
- **双格式导出** — YAML（结构化数据）+ Fountain（电影工业标准剧本格式）

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 动画 | GSAP |
| LLM | DeepSeek API (OpenAI 兼容) |
| 存储 | localStorage |

## 快速开始

```bash
npm install
# 将 .env.example 重命名为 .env.local，填入 DeepSeek API Key
npm run dev
# http://localhost:3000
```

## 使用流程

1. 导入小说 TXT 文件（拖拽或粘贴）
2. 拉下台灯链绳，AI 开始转化
3. 左页编辑原文/查看剧本，右页预览 YAML/Fountain
4. 点墨水瓶→选格式→羽毛笔蘸墨导出

## 项目结构

```
├── app/
│   ├── api/convert/route.ts         # 核心转换 API
│   ├── globals.css                  # 样式变量 + 电影化主题层
│   ├── layout.tsx
│   └── page.tsx                     # 电影化主页面
├── components/
│   ├── cinematic/                   # 电影化体验组件
│   │   ├── CinematicShell.tsx       # GSAP 编排 + 墨水瓶导出
│   │   ├── DeskLamp.tsx             # 台灯 SVG + 拖拽拉绳
│   │   ├── LightBeam.tsx            # 光束锥形
│   │   ├── DustParticles.tsx        # 尘粒漂浮
│   │   ├── OpenBook.tsx             # 书本容器 + 书脊阴影
│   │   └── SilkBookmarks.tsx        # 丝绸书签导航
│   ├── NovelView.tsx                # 章节编辑
│   ├── ScriptView.tsx               # 剧本视图
│   ├── YamlView.tsx / FountainView.tsx
│   └── ...
├── lib/
│   ├── deepseek.ts                  # DeepSeek API 封装
│   ├── parser.ts                    # 章节分段
│   ├── fountain-exporter.ts        # Fountain 格式导出
│   ├── AppContext.tsx               # 全局状态
│   └── useFirstVisit.ts            # 首次访问检测
└── docs/
    └── script-yaml-schema.md        # YAML Schema 设计文档
```

## 布局切换

电影化布局在 `feat/cinematic-desk-lamp` 分支。切回 `dev` 分支恢复标准三栏界面，所有原有组件未改动。
