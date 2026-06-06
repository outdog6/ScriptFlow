"use client";
import { Draft } from "@/lib/types";
import { Trash2, Eye } from "lucide-react";

interface Props {
  drafts: Draft[];
  onRestore: (draft: Draft) => void;
  onDelete: (id: string) => void;
}

export default function DraftsView({ drafts, onRestore, onDelete }: Props) {
  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 text-[#636366]">
        <Eye className="w-10 h-10" strokeWidth={1.5} />
        <p className="text-[15px] font-medium text-[#1d1d1f]">暂无草稿</p>
        <p className="text-[13px]">转换剧本后将自动保存到这里</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[720px] mx-auto py-8 px-8 space-y-3">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] truncate">
                {draft.title}
              </h3>
              <p className="text-[12px] text-[#636366] mt-0.5">
                {draft.createdAt} · {draft.chapterCount} 章
              </p>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => onRestore(draft)}
                className="px-3 py-1.5 text-[13px] font-medium text-[#0071e3] hover:bg-[rgba(0,113,227,0.08)] rounded-lg transition-all"
              >
                恢复
              </button>
              <button
                onClick={() => onDelete(draft.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,59,48,0.08)] transition-all text-[#636366] hover:text-[#ff3b30]"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
