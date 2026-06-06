"use client";
import { Project } from "@/lib/types";
import { Plus, FileText, Trash2 } from "lucide-react";

interface Props {
  projects: Project[];
  activeProjectId: string | null;
  onCreate: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProjectsView({
  projects,
  activeProjectId,
  onCreate,
  onSwitch,
  onDelete,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[720px] mx-auto py-8 px-8 space-y-3">
        <button
          onClick={onCreate}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] hover:border-[var(--apple-blue)] hover:bg-[rgba(0,113,227,0.03)] transition-all text-[var(--apple-secondary)] hover:text-[var(--apple-blue)]"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-[14px] font-medium">新建项目</span>
        </button>

        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => onSwitch(p.id)}
            className={`bg-[var(--apple-white)] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all ${
              p.id === activeProjectId ? "ring-2 ring-[var(--apple-blue)]" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FileText className="w-5 h-5 text-[var(--apple-blue)] flex-shrink-0" strokeWidth={1.5} />
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-[var(--apple-text)] truncate">
                  {p.title}
                </h3>
                <p className="text-[12px] text-[var(--apple-secondary)] mt-0.5">
                  {p.author} · {p.chapters.length} 章 · {p.updatedAt}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(p.id);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,59,48,0.08)] transition-all text-[var(--apple-secondary)] hover:text-[#ff3b30] ml-4 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-12 text-[var(--apple-secondary)] text-[14px]">
            还没有项目，点击上方按钮创建
          </div>
        )}
      </div>
    </div>
  );
}
