// components/Sidebar.tsx
import { NovelChapter } from "@/lib/types";
import { Sun, Moon } from "lucide-react";
import ProjectNav from "./ProjectNav";
import ChapterList from "./ChapterList";
import ExportButton from "./ExportButton";

interface Props {
  chapters: NovelChapter[];
  activeChapter: number;
  converting: boolean;
  yaml: string;
  scriptTitle: string;
  activeNav: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onNavigate: (id: string) => void;
  onSelectChapter: (id: number) => void;
}

export default function Sidebar({
  chapters,
  activeChapter,
  converting,
  yaml,
  scriptTitle,
  activeNav,
  theme,
  onToggleTheme,
  onNavigate,
  onSelectChapter,
}: Props) {
  return (
    <div className="w-[260px] border-r border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] flex flex-col bg-gradient-to-b from-[rgba(0,113,227,0.03)] to-[var(--apple-white)]">
      <div className="px-5 py-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.3px] text-[var(--apple-text)]">
            Script<span className="text-[var(--apple-blue)] font-extrabold">Flow</span>
          </h1>
          <p className="text-[11px] text-[var(--apple-secondary)] mt-0.5">AI 小说转剧本</p>
        </div>
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.08)] transition-all text-[var(--apple-secondary)]"
          title={theme === "light" ? "切换暗夜模式" : "切换日间模式"}
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Sun className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>
      </div>

      <div className="py-2">
        <ProjectNav activeItem={activeNav} onNavigate={onNavigate} />
      </div>

      {chapters.length > 0 && (
        <ChapterList
          chapters={chapters}
          activeChapter={activeChapter}
          converting={converting}
          onSelectChapter={onSelectChapter}
        />
      )}

      <div className="mt-auto p-4 border-t border-[rgba(0,0,0,0.06)]">
        <ExportButton yaml={yaml} scriptTitle={scriptTitle} />
      </div>
    </div>
  );
}
