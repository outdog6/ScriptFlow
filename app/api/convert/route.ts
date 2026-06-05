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
