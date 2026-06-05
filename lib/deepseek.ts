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
