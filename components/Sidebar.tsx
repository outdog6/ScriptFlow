// components/Sidebar.tsx
import { NovelChapter } from "@/lib/types";
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
  onNavigate,
  onSelectChapter,
}: Props) {
  return (
    <div className="glass w-[260px] border-r border-[rgba(0,0,0,0.08)] flex flex-col">
      <div className="px-5 py-6 border-b border-[rgba(0,0,0,0.06)]">
        <h1 className="text-[20px] font-bold tracking-[-0.3px] text-[#1d1d1f]">
          Script<span className="text-[#0071e3]">Flow</span>
        </h1>
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
