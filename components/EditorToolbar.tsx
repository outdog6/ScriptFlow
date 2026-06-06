import { Sparkles } from "lucide-react";

interface Props {
  editorTab: "novel" | "script";
  title: string;
  author: string;
  onTitleChange: (v: string) => void;
  onAuthorChange: (v: string) => void;
  onTabChange: (tab: "novel" | "script") => void;
  onConvert: () => void;
  converting: boolean;
}

export default function EditorToolbar({
  editorTab,
  title,
  author,
  onTitleChange,
  onAuthorChange,
  onTabChange,
  onConvert,
  converting,
}: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)] bg-[var(--apple-white)]">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.04)] p-0.5 rounded-lg">
          {(["novel", "script"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${
                editorTab === tab
                  ? "bg-[var(--apple-white)] text-[var(--apple-text)] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "text-[var(--apple-secondary)] hover:text-[var(--apple-text)]"
              }`}
            >
              {tab === "novel" ? "原文" : "剧本"}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />

        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="作品标题"
          className="w-28 bg-transparent text-[13px] font-medium text-[var(--apple-text)] placeholder-[var(--apple-secondary)] outline-none border-b border-transparent hover:border-[rgba(0,0,0,0.15)] focus:border-[var(--apple-blue)] transition-colors"
        />
        <input
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
          placeholder="作者"
          className="w-16 bg-transparent text-[12px] text-[var(--apple-secondary)] placeholder-[var(--apple-secondary)] outline-none border-b border-transparent hover:border-[rgba(0,0,0,0.15)] focus:border-[var(--apple-blue)] transition-colors"
        />
      </div>

      <button
        onClick={onConvert}
        disabled={converting}
        className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-[13px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(0,113,227,0.3)] bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-hover)] hover:shadow-[0_4px_16px_rgba(0,113,227,0.4)] hover:-translate-y-px active:translate-y-0"
      >
        <Sparkles className={`w-4 h-4 ${converting ? "animate-spin" : ""}`} strokeWidth={1.5} />
        {converting ? "转换中..." : "AI 转换"}
      </button>
    </div>
  );
}
