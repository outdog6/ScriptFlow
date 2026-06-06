# ScriptFlow YAML Schema 设计文档

**项目**: 七牛云 x XEngineer 暑期实训营 第三批次 -- AI 小说转剧本工具
**日期**: 2026-06-05
**版本**: 1.0

---

## 目录

1. [Schema 概述与设计哲学](#1-schema-概述与设计哲学)
2. [YAML + Fountain 混合方案](#2-yaml--fountain-混合方案)
3. [字段逐项参考](#3-字段逐项参考)
4. [设计原理与 DramaBench 六维评估](#4-设计原理与-dramabench-六维评估)
5. [Fountain 兼容性说明](#5-fountain-兼容性说明)
6. [扩展性考虑](#6-扩展性考虑)
7. [完整 Schema 示例](#7-完整-schema-示例)

---

## 1. Schema 概述与设计哲学

### 1.1 概述

ScriptFlow YAML Schema 是一种专为 AI 辅助小说转剧本工作流设计的结构化剧本表示格式。它在 YAML 的机器可读性之上嵌入了 Fountain 格式的编剧行业标准惯例，形成一套既适合程序处理、也便于人类阅读和编辑的剧本描述语言。

### 1.2 设计哲学

本 Schema 遵循三个核心原则：

**原则一：机器可读优先，人类可写兼顾**

YAML 作为结构化承载层，提供类型安全、字段校验、程序化生成与转换的能力。每个字段都有明确类型约束和语义边界，使 AI（大语言模型）能够精准输出，程序能够无歧义解析。同时，YAML 本身简洁的缩进语法也让人类可以直接在文本编辑器中修改剧本数据。

**原则二：吸收行业标准，而非重新发明**

剧本格式领域存在一个被广泛认可的行业标准 -- Fountain。它是纯文本剧本标记语言，如同 Markdown 之于文档。本 Schema 在场景标题（heading）、对话括号动作（parenthetical）、转场（transition）等关键字段上直接沿用 Fountain 的语法惯例。这意味着从 YAML 导出到 Fountain 格式是近乎无损的映射，而非复杂的转译。

**原则三：结构化为 AI 评估服务**

本 Schema 不仅描述剧本的 "外观"（格式），更捕捉其 "内在"（叙事结构、情感弧线、冲突状态）。每一个非格式字段的引入都是为了服务于 AI 生成质量的量化评估。这一设计的理论基础来自 DramaBench（2025）提出的六维剧本评估框架，详见第 4 节。

---

## 2. YAML + Fountain 混合方案

### 2.1 行业背景

在 AI 辅助内容创作领域，剧本格式呈现两极化趋势：

| 方向 | 代表格式 | 优势 | 劣势 |
|------|---------|------|------|
| 纯文本标准 | **Fountain** | 人类可读、行业通行、工具链丰富 | 无结构约束、难以程序校验 |
| 结构化数据 | JSON / XML / 自定义 DSL | 机器可读、类型安全、易于查询 | 人类编写成本高、与现有工具脱节 |

Fountain 格式由 John August 和 Nima Yousefshahi 于 2012 年发布，现已被 Highland、Slugline、Final Draft 等主流编剧工具支持。它用纯文本约定（大写场景头、缩进对话、括号动作说明）描述剧本，是行业内 "轻量级剧本标记语言" 的事实标准。

YAML 则是软件工程领域最广泛使用的结构化配置 / 数据序列化格式之一，兼具人类可读性和类型表达能力（字符串、整数、布尔、数组、对象）。

### 2.2 我们的选择：YAML 为壳，Fountain 为核

我们选择 **YAML 作为外层包装格式**，并在其内部嵌入 **Fountain 格式的语义约定**。具体来说：

- **顶层结构**（`meta`、`dramatis_personae`、`acts` 及其嵌套）使用纯 YAML 结构，提供类型安全、数组化管理、键值校验。
- **场景层关键字段** 直接使用 Fountain 语法：
  - `heading` 字段采用 `"INT./EXT. LOCATION -- TIME"` 格式，即 Fountain 场景头标准格式。
  - `parenthetical` 字段对应 Fountain 中用括号包裹的动作说明。
  - `transition` 字段对应 Fountain 中的转场标记（如 `CUT TO:`、`FADE OUT.`）。

这种混合方案的核心优势是：**YAML 提供框架和约束，Fountain 提供行业兼容的 "叶子字段" 语义**。两者各司其职，没有语义重叠或冲突。

### 2.3 与其他方案的对比

| 方案 | 结构化 | 行业兼容 | AI 可生成性 | 人类可编辑性 |
|------|--------|---------|-----------|------------|
| 纯 Fountain | 弱 | 强 | 中（无 Schema 约束） | 强 |
| 纯 JSON Schema | 强 | 弱（需转换） | 强 | 弱（括号嵌套冗长） |
| 纯 YAML | 强 | 弱 | 强 | 中 |
| **本方案（YAML + Fountain）** | **强** | **强** | **强** | **中-强** |

---

## 3. 字段逐项参考

### 3.1 顶层结构

```yaml
meta:                # 元信息
dramatis_personae:   # 人物表
acts:                # 幕列表
```

### 3.2 `meta` -- 元信息

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `title` | `string` | 是 | 剧本标题 | `"沧海剑歌"` |
| `author` | `string` | 是 | 作者 / 改编者 | `"佚名"` |
| `source_chapters` | `int` | 是 | 源小说章节数 | `12` |
| `format` | `string` | 是 | 固定值 `"fountain"`，标识输出格式标准 | `"fountain"` |
| `exported_at` | `string` | 否 | ISO 8601 导出时间戳，由程序自动填充 | `"2026-06-05T10:30:00.000Z"` |

`format` 字段为固定值 `"fountain"`。未来如果支持其他输出格式（如 Final Draft XML），此字段将作为格式标识符，确保向后兼容。

### 3.3 `dramatis_personae` -- 人物表

数组类型，每个元素为一个角色对象。

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `id` | `string` | 是 | 角色唯一标识符，建议英文 snake_case，用于 `beats` 中引用 | `"lin_feng"` |
| `name` | `string` | 是 | 角色中文名 | `"林风"` |
| `role` | `string` | 是 | 角色类型，枚举范围：主角 / 配角 / 反派 / 路人 | `"主角"` |
| `archetype` | `string` | 是 | 角色原型（叙事学概念），描述角色的叙事功能模板 | `"流浪剑客"` |
| `voice` | `string` | 是 | 说话风格描述，用于 AI 生成台词时保持角色声线一致 | `"寡言、锋利、偶有诗意"` |
| `traits` | `string[]` | 是 | 性格特征列表 | `["冷静", "警觉", "重情义"]` |

#### 设计要点

- `id` 是全局引用的关键。所有 `beats` 中对话的 `character` 字段都使用此 `id` 而非角色名，这样在角色改名时只需修改一处，且避免了名字重复导致的歧义。
- `voice` 字段直接服务于 DramaBench 的 **Character Consistency** 维度（见第 4 节），它向 AI 提供了一个 "发声指南"，确保角色在全篇中的台词风格统一。
- `traits` 数组为 AI 提供了角色行为的约束性描述。例如当模型需要生成该角色的动作 Beat 时，应体现列表中的特征。

### 3.4 `acts` -- 幕列表

数组类型，每个元素为一个幕（Act）对象。

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `act` | `int` | 是 | 幕序号，从 1 开始 | `1` |
| `title` | `string` | 是 | 幕标题，通常取自源章节标题 | `"第一章 风雨欲来"` |
| `summary` | `string` | 是 | 幕的叙事摘要 | `"源自小说第1章：流浪剑客林风在雨夜投宿荒野客栈..."` |
| `source_chapter` | `int` | 是 | 源小说章节编号，用于溯源 | `1` |
| `dramatic_function` | `string` | 是 | 戏剧功能描述，说明此幕在整体叙事中的位置 | `"建立世界观与主角动机"` |
| `scenes` | `Scene[]` | 是 | 该幕包含的场景列表 | (见下) |

#### 设计要点

- 本系统的幕（Act）与小说章节一一对应（1 章 = 1 幕），但 Schema 支持一个幕包含多个场景（scene），因为一个小说章节可能包含多个地点 / 时间切换。
- `source_chapter` 保留了与源文本的可追溯性，在需要人工审核或对比改编效果时至关重要。
- `dramatic_function` 为每幕赋予明确的戏剧功能，这对 AI 整体叙事结构的评估（DramaBench 的 Narrative Efficiency 维度）提供基础数据。

### 3.5 `scenes` -- 场景列表

数组类型，每个元素为一个场景（Scene）对象。

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `scene` | `int` | 是 | 场景序号，全局递增 | `1` |
| `heading` | `string` | 是 | **Fountain 标准场景头**，格式：`INT./EXT. 地点 -- 时间` | `"EXT. 荒野客栈 -- 深夜"` |
| `characters` | `string[]` | 是 | 出场角色 ID 列表（引用 `dramatis_personae` 中的 `id`） | `["lin_feng", "wang_lao_ban"]` |
| `mood` | `string` | 是 | 场景氛围 / 基调，Fountain+ 扩展字段 | `"诡谲、压抑"` |
| `visual` | `string` | 是 | 视觉描述（场景建立镜头描述） | `"暴雨倾盆，破旧木招牌在风中摇晃，一盏孤灯在柜台后摇曳"` |
| `conflict_status` | `string` | 是 | **冲突状态**，固定枚举值（见下表） | `"铺垫"` |
| `plot_function` | `string` | 是 | 叙事功能，描述此场景对情节推进的作用 | `"引入主角、埋设伏笔"` |
| `emotion_arc` | `EmotionArc` | 是 | 本场景的情感弧线 | (见 3.5.1) |
| `beats` | `Beat[]` | 是 | 场景内的节拍序列 | (见 3.6) |
| `transition` | `string` 或 `null` | 是 | 转场标记，Fountain 标准格式。`null` 表示无特定转场 | `"CUT TO:"` |

#### `conflict_status` 枚举值

本枚举吸收了麦基（Robert McKee）《故事》中的冲突理论，并对其做了可操作化的编码：

| 枚举值 | 含义 | 叙事位置 |
|--------|------|---------|
| `铺垫` | 建立情境、引入冲突要素 | 场景序列开端 |
| `升级` | 冲突加剧、张力上升 | 发展段落 |
| `转折` | 情境发生方向性改变（reversal） | 关键节点 |
| `暂停` | 冲突暂时缓和，提供喘息空间 | 节奏调节 |
| `爆发` | 冲突到达顶点（climax） | 场景高潮 |
| `收束` | 冲突解决或暂时平息 | 场景结尾 |

这六个枚举值构成一个完整的冲突生命周期，对应戏剧理论中的 "起承转合" 范式。

#### 3.5.1 `emotion_arc` -- 情感弧线

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `start` | `string` | 是 | 场景开始时的情绪基调 | `"压抑"` |
| `end` | `string` | 是 | 场景结束时的情绪基调 | `"警觉"` |
| `shifts` | `string[]` | 是 | 情绪变化节点序列，按时间顺序排列 | `["压抑→好奇", "好奇→不安", "不安→警觉"]` |

情感弧线字段捕获场景内情绪的微观变化轨迹，这是 DramaBench **Emotional Depth** 维度评估的关键数据源。

### 3.6 `beats` -- 节拍序列

数组类型，每个元素为联合类型：或为动作节拍（action），或为对话节拍（dialogue）。

#### 3.6.1 动作节拍 (type: "action")

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `type` | `string` | 是 | 固定值 `"action"` | `"action"` |
| `text` | `string` | 是 | 动作 / 舞台指示 | `"林风推门而入，雨水从斗笠边沿不断滴落。他扫视了一眼空荡的店堂。"` |

#### 3.6.2 对话节拍 (type: "dialogue")

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `type` | `string` | 是 | 固定值 `"dialogue"` | `"dialogue"` |
| `character` | `string` | 是 | 说话角色 ID，引用 `dramatis_personae` 中的 `id` | `"lin_feng"` |
| `parenthetical` | `string` | 是 | **Fountain 括号动作说明**，描述说话时的动作或语气 | `"低声，手按在剑柄上"` |
| `line` | `string` | 是 | 台词正文 | `"掌柜的，还有空房吗？"` |
| `subtext` | `string` | 是 | 潜台词 -- 角色真正想表达但未明说的意思 | `"我不是普通路过的，给我一个留下来的理由"` |

#### 设计要点

- `parenthetical` 直接沿用 Fountain 术语。在 Fountain 标准中，括号内容紧跟在角色名下方，表示说话时的行为或语气修饰（如 `(whispering)`、`(to the door)`）。我们的 Schema 中提取为独立字段，便于 AI 生成和后续分析。
- `subtext` 是本 Schema 最具创新性的字段之一。它要求 AI 为每一句台词推导潜台词（角色真正的意图、情感状态、隐藏动机），这在传统编剧格式中从来不是显式表示的。潜台词字段直接服务于 DramaBench 的 **Emotional Depth** 维度评估。

---

## 4. 设计原理与 DramaBench 六维评估

### 4.1 DramaBench 概述

[DramaBench](https://arxiv.org/abs/2512.19012)（arXiv: 2512.19012）是 2025 年发布的一个系统性的 AI 剧本生成质量评估基准。该论文定义了评估 AI 生成剧本的六个维度：

| 维度 | 英文名 | 核心评估内容 |
|------|--------|------------|
| 格式规范 | Format Standards | 剧本是否符合行业标准格式（场景头、角色名、对话排版等） |
| 叙事效率 | Narrative Efficiency | 每个场景 / 节拍对情节推进是否有明确功能，冗余叙事比例 |
| 角色一致性 | Character Consistency | 角色在全篇中的性格、声线、行为逻辑是否统一 |
| 情感深度 | Emotional Depth | 台词和动作中蕴含的情感层次、潜台词、情绪变化 |
| 逻辑一致性 | Logic Consistency | 情节因果链是否自洽，场景衔接是否合理 |
| 冲突处理 | Conflict Handling | 冲突的建立、发展、转折、化解是否符合戏剧规律 |

本 Schema 的设计在每一个维度上都有针对性的字段映射。

### 4.2 逐维映射

#### 4.2.1 Format Standards（格式规范） -- `heading` Fountain 标准字段

我们的 `heading` 字段要求严格遵循 `"INT./EXT. LOCATION -- TIME"` 的 Fountain 标准格式。这是行业公认的场景头格式惯例。

**Schema 贡献**：
- 场景头的格式约束（`INT.` / `EXT.` / `INT./EXT.` 前缀 + 地点 + `--` + 时间）在 AI prompt 中明确声明，确保 AI 输出的格式正确性。
- `transition` 字段使用 Fountain 标准转场标记（`CUT TO:`、`FADE OUT.` 等），保证输出可直接转换为标准格式。

**评估方式**：程序可自动校验 heading 是否匹配正则 `/^(INT\.|EXT\.|INT\.\/EXT\.)\s+.+\s+--\s+.+$/`，计算格式合规率。

#### 4.2.2 Narrative Efficiency（叙事效率） -- `plot_function` 字段

每个场景携带一个 `plot_function` 字段，声明该场景对整体叙事的贡献（如 "引入主角"、"揭示真相"、"制造悬念"）。

**Schema 贡献**：
- 为每个场景显式标注叙事功能，使评估系统能够判断是否存在 "无功能叙事"（不推进情节的场景）。
- 结合 `beats` 数量与 `plot_function` 的匹配度，可量化 "每单位情节功能所需的节拍数"，从而评估叙事效率。

**评估方式**：检查所有 `plot_function` 的覆盖面（是否每个场景都有明确功能），统计功能种类分布。

#### 4.2.3 Character Consistency（角色一致性） -- `dramatis_personae.voice` 字段

`voice` 字段为每个角色定义了一个 "发声指南"，这是 AI 保持角色一致性的最重要约束。

**Schema 贡献**：
- `voice` 被注入到 DeepSeek 的 system prompt 中，作为生成台词时的风格约束。
- `traits` 数组确保角色的性格特征在全局可用，AI 在生成动作 Beat 时也需参考。
- `id` 引用机制使角色一致性能够被自动检查（例如：检测同一角色在不同场景中的台词是否与其 `voice` 描述一致）。

**评估方式**：可用嵌入向量（embedding）计算同一角色在不同场景中的台词风格相似度，量化一致性得分。

#### 4.2.4 Emotional Depth（情感深度） -- `emotion_arc` 字段

`emotion_arc` 在场景级别捕捉情感的宏观变化（start、end、shifts），`subtext` 在台词级别捕捉情感的微观层次。

**Schema 贡献**：
- `emotion_arc.start` 和 `emotion_arc.end` 提供了场景级别的情感变化轨迹。
- `shifts` 数组细化了情感变化的路径，揭示了情绪不是一步到位的而是渐进的。
- `subtext` 是 DramaBench 特别强调的评估维度 -- 一句台词可以表面说 A 而实际表达 B，这是情感深度的核心指标。

**评估方式**：
- 统计 `shifts` 数组的长度（情绪变化节点数），越多表示情感描写越细腻。
- 检测 `subtext` 是否与 `line` 存在语义差异（有差异 = 有情感层次，无差异 = 单调）。
- 跨场景追踪角色情绪的连续变化，评估情感弧线的完整性。

#### 4.2.5 Logic Consistency（逻辑一致性） -- `beats` 序列 + `conflict_status` 序列

逻辑一致性主要体现在两个层面：微观层面（场景内 beat 之间的因果逻辑）和宏观层面（场景间冲突状态的递进逻辑）。

**Schema 贡献**：
- Beats 的序列结构使评估系统可以检查：动作→反应的因果链是否完整。
- `conflict_status` 枚举值序列（从铺垫到收束）提供了可验证的冲突发展轨迹。
- `characters` 出场列表确保了角色出场 / 退场的一致性（一个角色不能在没有引入的情况下突然出现）。

**评估方式**：
- 检查跨场景的角色出场一致性（某角色在场景 A 出场但之前未在人物表中声明则视为错误）。
- 分析 `conflict_status` 的序列模式（如 "铺垫→升级→转折→爆发→收束" 是否符合叙事逻辑）。

#### 4.2.6 Conflict Handling（冲突处理） -- `conflict_status` 枚举

`conflict_status` 是本 Schema 中唯一使用严格枚举值的字段（共 6 个值），体现了对冲突处理的重视。

**Schema 贡献**：
- 强制 AI 在生成每个场景时为冲突状态 "贴标签"，这本身就是对 AI 的一种 "元认知提示"（metacognitive prompt）-- 迫使 AI 在生成内容前先判断冲突阶段。
- 枚举值的命名吸收了麦基（Robert McKee）和菲尔德（Syd Field）的经典编剧理论：
  - `铺垫`（Setup）→ 菲尔德 "建置" 范式
  - `升级`（Escalation）→ 麦基 "进展纠葛" 范式
  - `转折`（Turning Point）→ 麦基 "幕高潮" 范式
  - `暂停`（Pause）→ 叙事节奏调节
  - `爆发`（Climax）→ 经典高潮概念
  - `收束`（Resolution）→ 经典结局概念

**评估方式**：
- 检查 `conflict_status` 枚举值的分布是否合理（是否每个故事都有完整的冲突弧线）。
- 检测枚举值序列是否存在非理性跳变（如直接从"铺垫"跳到"收束"而没有中间阶段），这类跳变是冲突处理不当的信号。

### 4.3 映射总览

```
DramaBench 维度          Schema 关键字段                    评估方法
═════════════════════════════════════════════════════════════════════════
Format Standards    ←   heading, transition              正则校验
Narrative Efficiency←   plot_function                    功能覆盖率统计
Character Consistency←  dramatis_personae.voice, traits   嵌入相似度
Emotional Depth     ←   emotion_arc, subtext             情绪轨迹分析
Logic Consistency   ←   beats 序列, conflict_status 序列   因果链校验
Conflict Handling   ←   conflict_status 枚举              弧线完整性检测
```

---

## 5. Fountain 兼容性说明

### 5.1 字段映射表

从 YAML Schema 到 Fountain 格式的转换已在 `lib/fountain-exporter.ts` 中实现。以下是映射关系：

| YAML Schema 字段 | Fountain 输出 | 说明 |
|-----------------|---------------|------|
| `meta.title` | `Title: ...` | Fountain 标题页元数据 |
| `meta.author` | `Author: ...` | 同上 |
| `act.title` | `# Chapter Title` | Fountain 中的 `#` 是章节标题 |
| `act.summary` | `// summary` | Fountain 中的 `//` 是注释 / 概要 |
| `scene.heading` | 直接输出 | 大写场景头，后跟空行 |
| `scene.visual` | 直接输出为段落 | 场景动作描述 |
| `Beat (action).text` | 直接输出为段落 | 动作 / 舞台指示 |
| `Beat (dialogue).character` | 通过 `id` 查找 `name` 输出 | 角色名居中 / 缩进 |
| `Beat (dialogue).parenthetical` | `(text)` | 括号包裹，紧跟角色名 |
| `Beat (dialogue).line` | 直接输出 | 台词正文 |
| `scene.transition` | `> CUT TO:` 或直接输出 | 右对齐转场标记 |

### 5.2 导出为纯 Fountain 文本

```fountain
Title: 沧海剑歌
Author: 佚名
Source Chapters: 3

===

# 第一章 风雨欲来

// 源自小说第1章

EXT. 荒野客栈 -- 深夜

暴雨倾盆，破旧木招牌在风中摇晃，一盏孤灯在柜台后摇曳。

          林风
    （低声，手按在剑柄上）
    掌柜的，还有空房吗？

          王老板
    （抬头，眯眼打量）
    这天气还有人赶路……楼上最后一间。

CUT TO:
```

### 5.3 不兼容部分与扩展

以下 YAML 字段在标准 Fountain 格式中**没有直接对应**，导出时会被忽略或作为注释处理：

| YAML 字段 |  Fountain 处理方式 |
|-----------|-------------------|
| `dramatis_personae` 完整对象 | 不作为正文输出（可考虑输出为注释 `// dramatis_personae: ...`） |
| `scene.mood` | 可以 `// mood: ...` 注释形式保留 |
| `scene.conflict_status` | 可输出为 `// conflict: ...` 注释 |
| `scene.emotion_arc` | 可输出为 `// emotion: start -> end` 注释 |
| `Beat.subtext` | 可输出为 `// subtext: ...` 注释 |
| `scene.plot_function` | 可输出为注释 |

这些字段属于 "Fountain+ 扩展"，它们在 YAML 中提供 AI 评估所需的结构化数据，在导出为纯 Fountain 时为保持格式兼容性而注释化处理。这一设计遵循了 **"结构化字段不破坏纯格式兼容性"** 的原则。

---

## 6. 扩展性考虑

### 6.1 设计原则

本 Schema 在设计时预留了多个扩展维度。扩展遵循以下原则：

1. **向后兼容**: 新增字段均为可选，旧 Schema 数据可被新版本无错误解析。
2. **命名空间隔离**: 扩展字段使用前缀或独立区块，避免与核心字段命名冲突。
3. **渐进增强**: 扩展从可选字段开始，被广泛验证后可提升为必填。

### 6.2 已规划的扩展方向

#### 6.2.1 分镜/故事板生成 (Storyboard)

在 `scene` 对象中添加 `storyboard` 可选字段，为 AI 图像生成提供结构化引导：

```yaml
scenes:
  - scene: 1
    # ... 现有字段 ...
    storyboard:              # 可选扩展
      shot_count: 3
      shots:
        - angle: "wide"      # 远景 / 中景 / 特写
          camera: "static"   # 固定 / 推轨 / 摇镜
          composition: "林风推门而入，背光剪影"
          lighting: "low-key, 单一光源（柜台油灯）"
          duration: 4        # 预估秒数
```

#### 6.2.2 AI 图像提示词 (AI Image Prompts)

为每个场景 / Beat 生成 Midjourney / Stable Diffusion 兼容的 prompt：

```yaml
scenes:
  - scene: 1
    # ...
    image_prompt:           # 可选扩展
      midjourney: "ancient Chinese inn at night, heavy rain, single flickering oil lamp, cinematic lighting, 8K --ar 16:9 --style raw"
      sd: "masterpiece, best quality, ancient Chinese inn, night, rain storm, warm interior light, by Wlop and Feng Zhu"
```

#### 6.2.3 字幕导出 (Subtitle Export)

在 `dialogue` beat 中添加时间码相关字段：

```yaml
beats:
  - type: dialogue
    # ... 现有字段 ...
    subtitle:               # 可选扩展
      start: "00:01:23.500"
      end: "00:01:26.200"
      style: "italic"       # 字幕样式提示（内心独白可斜体）
```

#### 6.2.4 多语言 / 本地化

在顶层添加 `translations` 块：

```yaml
meta:
  # ...
  language: "zh-CN"

translations:               # 可选扩展
  en:
    title: "Sword Song of the Sea"
    dramatis_personae:
      - id: "lin_feng"
        name: "Lin Feng"
```

#### 6.2.5 协同创作与版本控制

在 `meta` 中添加协作元数据：

```yaml
meta:
  # ...
  version: 3
  history:                  # 可选扩展
    - version: 1
      date: "2026-06-01"
      author: "AI (DeepSeek)"
      changes: "初始生成"
    - version: 2
      date: "2026-06-03"
      author: "human"
      changes: "修改第3幕冲突转折"
```

#### 6.2.6 音效与配乐指导 (Sound Design)

在 `scene` 中添加音频引导：

```yaml
scenes:
  - scene: 1
    # ...
    sound_design:           # 可选扩展
      ambient: "暴雨声、远处滚雷"
      music: "二胡独奏，哀婉"
      sfx: ["门轴吱呀声", "脚步声（湿鞋踩木地板）"]
```

### 6.3 向后兼容策略

扩展字段全部设为可选，类型定义中使用 TypeScript 的 `?` 修饰符：

```typescript
interface Scene {
  // ... 现有必填字段 ...
  storyboard?: Storyboard;     // v2 可选扩展
  image_prompt?: ImagePrompt;  // v2 可选扩展
  sound_design?: SoundDesign;  // v2 可选扩展
}
```

YAML 解析器（js-yaml）天然支持忽略未声明的字段，因此旧版数据不会因新增可选字段而解析失败。

---

## 7. 完整 Schema 示例

以下是一个完整的剧本示例，包含 2 个角色和 1 个场景。所有字段均有实际值展示：

```yaml
meta:
  title: "沧海剑歌"
  author: "改编自同名网络小说"
  source_chapters: 12
  format: "fountain"
  exported_at: "2026-06-05T10:30:00.000Z"

dramatis_personae:
  - id: "lin_feng"
    name: "林风"
    role: "主角"
    archetype: "流浪剑客"
    voice: "寡言、锋利、偶有诗意。面对敌人时每个字都像刀锋，独处时却会对着雨自言自语。"
    traits:
      - "冷静"
      - "警觉"
      - "重情义"
      - "内心孤独"

  - id: "wang_lao_ban"
    name: "王老板"
    role: "配角"
    archetype: "精明客栈掌柜"
    voice: "油滑、语速快、表面热情实则算计。喜欢用反问句。"
    traits:
      - "精明"
      - "势利"
      - "消息灵通"

acts:
  - act: 1
    title: "第一章 风雨欲来"
    summary: "源自小说第1章：流浪剑客林风在雨夜投宿荒野客栈，与掌柜王老板的一场暗藏玄机的对话。"
    source_chapter: 1
    dramatic_function: "建立世界观、引入主角、埋设核心伏笔（追杀令）"

    scenes:
      - scene: 1
        heading: "EXT. 荒野客栈 -- 深夜"
        characters:
          - "lin_feng"
          - "wang_lao_ban"
        mood: "诡谲、压抑、暗藏杀机"
        visual: "暴雨如注，荒野中一座孤零零的两层木楼。破旧的木招牌在风中吱呀作响，上面的'悦来客栈'四字已斑驳难辨。楼上窗户透出微弱的油灯光，是方圆数十里唯一的亮光。"
        conflict_status: "铺垫"
        plot_function: "引入主角、建立悬疑氛围、暗示即将到来的冲突"

        emotion_arc:
          start: "压抑"
          end: "警觉"
          shifts:
            - "压抑→疲惫（冒雨赶路的体力消耗）"
            - "疲惫→警觉（察觉客栈气氛不对）"
            - "警觉→试探（与掌柜对话中收集信息）"

        beats:
          - type: "action"
            text: "林风推开客栈木门，一阵冷风裹着雨雾卷入堂内。他站在门口，抖落斗笠上的雨水，目光快速扫过整个店堂——三个角落，两个出口，一个楼梯。"

          - type: "action"
            text: "柜台后的王老板抬头，手中的算盘珠子停在半空。"

          - type: "dialogue"
            character: "wang_lao_ban"
            parenthetical: "放下算盘，挤出职业笑容"
            line: "客官这天气还赶路？快请进请进——"
            subtext: "这鬼天气还有人出门，不是逃命就是追命的，得小心伺候着。"

          - type: "dialogue"
            character: "lin_feng"
            parenthetical: "站在原地未动，声音低沉"
            line: "掌柜的，还有空房吗？"
            subtext: "我需要一个能观察到所有角落的位置，先确认这里安不安全。"

          - type: "dialogue"
            character: "wang_lao_ban"
            parenthetical: "上下打量林风，目光在腰间佩剑上多停了半秒"
            line: "有，有——楼上最后一间。不过客官来得不巧，今晚小店还住了几位……做生意的朋友。"
            subtext: "这人带剑，不是普通路人。我先提一句有其他人在，探探他的反应——要是他紧张了，搞不好就是被追杀的那个。"

          - type: "dialogue"
            character: "lin_feng"
            parenthetical: "微微侧头，语气不变"
            line: "做生意的人，雨夜赶路？"
            subtext: "你在试探我，我也在试探你。雨夜的客栈里住着'生意人'——这帮人怕是来者不善。"

          - type: "action"
            text: "王老板的笑容僵了半秒，随即恢复如常。他指了指楼上，做了个'请'的手势。"

          - type: "dialogue"
            character: "wang_lao_ban"
            parenthetical: "压低声音，身体前倾"
            line: "客官说得是……这年头生意难做，连老天爷都不给面子。不过话说回来，今晚小店还有位客人，留了个东西给后来投宿的人——"
            subtext: "楼上那几位不是善茬，我得站好队。先把那人留的东西转交出去，万一出事跟我也没关系。"

          - type: "action"
            text: "王老板从柜台下取出一封用油纸包裹的信，推到林风面前。信封上只写了四个字：林风亲启。"

          - type: "dialogue"
            character: "lin_feng"
            parenthetical: "盯着信封看了三秒，没有立刻伸手"
            line: "……谁留的？"
            subtext: "有人知道我会经过这里，提前留信。要么是陷阱，要么是旧识——不管是哪种，我的行踪已经暴露了。"

          - type: "action"
            text: "楼上突然传来一声木板的轻微响动，像是有人踩在不结实的地板上。林风的手按上了剑柄。"

        transition: "CUT TO:"
```

### 7.1 示例数据统计

| 指标 | 数值 |
|------|------|
| 角色数 | 2 |
| 幕数 | 1 |
| 场景数 | 1 |
| 动作 Beat 数 | 4 |
| 对话 Beat 数 | 6 |
| 冲突状态 | 铺垫 |
| 情绪变化节点 | 3 |
| 出场角色 | lin_feng, wang_lao_ban |

---

## 附录 A: TypeScript 类型对照

本 Schema 在项目中的 TypeScript 类型定义参见 `lib/types.ts`：

```typescript
export interface ScriptData {
  meta: ScriptMeta;
  dramatis_personae: CharacterProfile[];
  acts: Act[];
}

export interface ScriptMeta {
  title: string;
  author: string;
  source_chapters: number;
  format: "fountain";
  exported_at: string;         // ISO 8601 timestamp
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: "主角" | "配角" | "反派" | "路人";
  archetype: string;
  voice: string;
  traits: string[];
}

export interface Act {
  act: number;
  title: string;
  summary: string;
  source_chapter: number;
  dramatic_function: string;
  scenes: Scene[];
}

export interface Scene {
  scene: number;
  heading: string;                                           // Fountain: "INT./EXT. LOCATION -- TIME"
  characters: string[];                                      // Ref to CharacterProfile.id
  mood: string;
  visual: string;
  conflict_status: "铺垫" | "升级" | "转折" | "暂停" | "爆发" | "收束";
  plot_function: string;
  emotion_arc: EmotionArc;
  beats: Beat[];
  transition: string | null;                                 // Fountain: "CUT TO:" etc.
}

export interface EmotionArc {
  start: string;
  end: string;
  shifts: string[];
}

export type Beat = ActionBeat | DialogueBeat;

export interface ActionBeat {
  type: "action";
  text: string;
}

export interface DialogueBeat {
  type: "dialogue";
  character: string;                                         // Ref to CharacterProfile.id
  parenthetical: string | null;                              // Fountain parenthetical
  line: string;
  subtext: string;
}
```

## 附录 B: 技术栈

| 组件 | 选型 | 用途 |
|------|------|------|
| YAML 解析 | js-yaml | YAML dump / load / validate |
| 类型系统 | TypeScript (strict) | Schema 类型定义与编译期校验 |
| LLM 后端 | DeepSeek API (openai SDK) | AI 驱动的章节转剧本 |
| 格式导出 | lib/fountain-exporter.ts | YAML → Fountain 纯文本 |
| 前端框架 | Next.js 14 (App Router) | Web 应用 |
| 样式 | Tailwind CSS + CSS Variables | Apple 风格 UI |

---

## 附录 C: 参考文献

1. **DramaBench** -- "DramaBench: A Benchmark for Evaluating AI-Generated Drama Scripts", 2025. arXiv: 2512.19012. 定义了 AI 剧本评估的六个维度（Format Standards, Narrative Efficiency, Character Consistency, Emotional Depth, Logic Consistency, Conflict Handling）。
2. **Fountain** -- "Fountain: A Markup Language for Screenwriting", John August & Nima Yousefshahi, 2012. [https://fountain.io](https://fountain.io)。纯文本剧本标记语言标准。
3. **Robert McKee, _Story: Substance, Structure, Style, and the Principles of Screenwriting_**, 1997. 冲突理论的经典来源。
4. **Syd Field, _Screenplay: The Foundations of Screenwriting_**, 1979. 三幕剧结构范式。
