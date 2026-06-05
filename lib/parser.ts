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
    const matches = Array.from(cleaned.matchAll(pattern));
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
