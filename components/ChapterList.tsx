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
      <p className="px-5 pt-4 pb-2 text-[11px] font-semibold text-[var(--apple-secondary)] uppercase tracking-wider">
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
                  ? "bg-[rgba(0,113,227,0.1)] text-[var(--apple-blue)]"
                  : "text-[var(--apple-text)] hover:bg-[rgba(0,0,0,0.04)]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  isConverting ? "bg-[#ff9f0a] animate-pulse" : isActive ? "bg-[var(--apple-blue)]" : "bg-[var(--apple-secondary)]"
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
