// lib/parser.ts
import { NovelChapter } from "./types";

const MAX_TEXT_LENGTH = 500_000; // 500KB limit for chapter parsing

export function parseChapters(text: string): NovelChapter[] {
  const cleaned = text.replace(/\r\n/g, "\n").trim();

  // For very large texts, only process the first 500KB for chapter detection
  const sample = cleaned.slice(0, MAX_TEXT_LENGTH);

  const patterns: RegExp[] = [
    /(?:第[零一二三四五六七八九十百千万\d]+章)\s*([^\n]*)/g,
    /(?:Chapter\s+\d+)[^\n]*/gi,
    /(?:#[#]?\s*第[零一二三四五六七八九十百千万\d]+章)[^\n]*/g,
  ];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    const matches = Array.from(sample.matchAll(pattern));
    if (matches.length >= 3) {
      const chapters: NovelChapter[] = [];
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index!;
        const end = i < matches.length - 1 ? matches[i + 1].index! : cleaned.length;
        const title = (matches[i][1] || matches[i][0]).trim();
        // For very large texts, truncate individual chapter content for display
        const content = cleaned.slice(start, end).trim();
        chapters.push({
          id: i + 1,
          title: title || `第${i + 1}章`,
          content,
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
