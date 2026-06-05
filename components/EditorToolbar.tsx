import { Sparkles } from "lucide-react";

interface Props {
  editorTab: "novel" | "script";
  onTabChange: (tab: "novel" | "script") => void;
  onConvert: () => void;
  converting: boolean;
}

export default function EditorToolbar({
  editorTab,
  onTabChange,
  onConvert,
  converting,
}: Props) {
  return (
    <div className="glass flex items-center justify-between px-6 py-3 border-b border-[rgba(0,0,0,0.06)]">
      <div className="flex gap-1 bg-[rgba(0,0,0,0.04)] p-0.5 rounded-lg">
        {(["novel", "script"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
              editorTab === tab
                ? "bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {tab === "novel" ? "原文" : "剧本"}
          </button>
        ))}
      </div>

      <button
        onClick={onConvert}
        disabled={converting}
        className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0077ed] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className={`w-4 h-4 ${converting ? "animate-spin" : ""}`} strokeWidth={1.5} />
        {converting ? "转换中..." : "AI 转换"}
      </button>
    </div>
  );
}
