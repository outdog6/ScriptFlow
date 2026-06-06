# ScriptFlow — AI 小说转剧本工具

将 3 章以上小说文本自动转换为结构化剧本，支持 YAML + Fountain 双格式输出。

> 七牛云 × XEngineer 暑期实训营 第三批次 · 题目三

## 功能

- **小说上传** — 支持拖拽 .txt 文件或粘贴文本
- **智能分章** — 自动识别「第X章」/「Chapter X」等章节标记
- **AI 转换** — 调用 DeepSeek API 将小说逐章转为标准剧本
- **人物提取** — 自动生成人物表（dramatis personae），包含性格、说话风格
- **剧本预览** — 卡片式场景展示，对话高亮，情绪曲线标注
- **双格式导出** — YAML（结构化数据）+ Fountain（专业剧本标记语言）

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS + Apple Design System |
| 图标 | lucide-react |
| LLM | DeepSeek API (OpenAI 兼容) |
| 格式 | js-yaml / Fountain |

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key
# 将 .env.example 重命名为 .env.local，填入你的 DeepSeek API Key

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
# http://localhost:3000
```

## 使用流程

1. 打开页面，拖拽小说 .txt 文件或点击「从剪贴板粘贴」
2. 左侧自动列出解析出的章节
3. 点击右上角「✨ AI 转换」
4. 等待逐章处理完成（DeepSeek 并发处理）
5. 中间栏查看格式化剧本，右栏预览 YAML / Fountain
6. 点击左下角「导出 YAML」下载

## 项目结构

```
├── app/
│   ├── api/convert/route.ts    # 核心转换 API
│   ├── globals.css             # Apple 设计系统
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 主页面
├── components/
│   ├── Sidebar/                # 侧边栏（章节列表 + 导出）
│   ├── EditorPanel/            # 主编辑区（上传 + 剧本视图）
│   ├── PreviewPanel/           # 预览面板（YAML + Fountain）
│   └── Toast.tsx               # 通知组件
├── lib/
│   ├── types.ts                # TypeScript 类型定义
│   ├── parser.ts               # 章节分段解析器
│   ├── deepseek.ts             # DeepSeek API 封装
│   ├── yaml-builder.ts         # YAML 构建器
│   ├── yaml-validator.ts       # YAML 校验器
│   ├── fountain-exporter.ts    # Fountain 格式导出
│   └── AppContext.tsx           # 全局状态管理
└── docs/
    └── script-yaml-schema.md   # YAML Schema 设计文档
```

## YAML Schema

详细 Schema 设计文档见 [docs/script-yaml-schema.md](docs/script-yaml-schema.md)。

Schema 融合以下业界标准：
- **Fountain** — 剧本界 Markdown，场景头 INT./EXT. 标准格式
- **DramaBench** — 2025 年 AI 剧本质量评估六维框架
