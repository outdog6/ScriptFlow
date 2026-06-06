// components/PreviewPanel.tsx
import { ScriptData } from "@/lib/types";
import YamlView from "./YamlView";
import FountainView from "./FountainView";
import { Copy } from "lucide-react";

interface Props {
  yaml: string;
  script: ScriptData | null;
  previewTab: "yaml" | "fountain";
  onTabChange: (tab: "yaml" | "fountain") => void;
}

export default function PreviewPanel({ yaml, script, previewTab, onTabChange }: Props) {
  const handleCopy = () => {
    const content = previewTab === "yaml" ? yaml : "";
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  if (!yaml && !script) {
    return (
      <div className="w-[360px] bg-white border-l border-[rgba(0,0,0,0.08)] flex items-center justify-center">
        <p className="text-[14px] text-[#636366]">生成剧本后将在此预览</p>
      </div>
    );
  }

  return (
    <div className="w-[360px] bg-white border-l border-[rgba(0,0,0,0.08)] flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex gap-4">
          {(["yaml", "fountain"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`text-[12px] pb-2 -mb-[1px] font-medium transition-all ${
                previewTab === tab
                  ? "text-[#0071e3] border-b-2 border-[#0071e3]"
                  : "text-[#636366] hover:text-[#1d1d1f]"
              }`}
            >
              {tab === "yaml" ? "YAML" : "Fountain"}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(0,0,0,0.04)] transition-all text-[#636366]"
          title="复制"
        >
          <Copy className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {previewTab === "yaml" ? (
          <YamlView yaml={yaml} />
        ) : script ? (
          <FountainView script={script} />
        ) : null}
      </div>
    </div>
  );
}
