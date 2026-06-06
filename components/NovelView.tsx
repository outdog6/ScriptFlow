"use client";
import { useState, useEffect, useRef } from "react";
import { NovelChapter } from "@/lib/types";

interface Props {
  chapters: NovelChapter[];
  activeChapter: number;
  onSelectChapter: (id: number) => void;
  onUpdateContent: (id: number, content: string) => void;
}

export default function NovelView({
  chapters,
  activeChapter,
  onSelectChapter,
  onUpdateContent,
}: Props) {
  const chapter = chapters.find((c) => c.id === activeChapter);
  const [localText, setLocalText] = useState(chapter?.content || "");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalText(chapter?.content || "");
  }, [chapter?.id]);

  const handleChange = (value: string) => {
    setLocalText(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onUpdateContent(activeChapter, value);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-8 pt-4 pb-2 overflow-x-auto">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSelectChapter(ch.id)}
            className={`px-4 py-2 text-[13px] font-medium rounded-lg whitespace-nowrap transition-all ${
              ch.id === activeChapter
                ? "bg-[var(--apple-blue)] text-white"
                : "bg-[var(--apple-white)] text-[var(--apple-text)] hover:bg-[var(--apple-bg)]"
            }`}
          >
            {ch.title}
          </button>
        ))}
        <span className="text-[11px] text-[var(--apple-secondary)] ml-2 flex-shrink-0">
          可直接编辑原文
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <textarea
          value={localText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="请选择章节或粘贴文本..."
          className="w-full h-full max-w-[720px] mx-auto block resize-none border-0 outline-none bg-transparent text-[15px] leading-relaxed font-sans text-[var(--apple-text)] placeholder-[var(--apple-secondary)]"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
