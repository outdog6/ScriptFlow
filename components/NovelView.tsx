import { NovelChapter } from "@/lib/types";

interface Props {
  chapters: NovelChapter[];
  activeChapter: number;
  onSelectChapter: (id: number) => void;
}

export default function NovelView({ chapters, activeChapter, onSelectChapter }: Props) {
  const chapter = chapters.find((c) => c.id === activeChapter);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 px-8 pt-4 pb-2 overflow-x-auto">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSelectChapter(ch.id)}
            className={`px-4 py-2 text-[13px] font-medium rounded-lg whitespace-nowrap transition-all ${
              ch.id === activeChapter
                ? "bg-[#0071e3] text-white"
                : "bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
            }`}
          >
            {ch.title}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[720px] mx-auto">
          <pre className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans text-[#1d1d1f]">
            {chapter?.content || "请选择章节"}
          </pre>
        </div>
      </div>
    </div>
  );
}
