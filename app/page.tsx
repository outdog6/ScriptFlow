// app/page.tsx
"use client";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import Toast from "@/components/Toast";
import Dropzone from "@/components/Dropzone";
import NovelView from "@/components/NovelView";
import ScriptView from "@/components/ScriptView";
import YamlView from "@/components/YamlView";
import FountainView from "@/components/FountainView";
import DraftsView from "@/components/DraftsView";
import ProjectsView from "@/components/ProjectsView";
import CinematicShell from "@/components/cinematic/CinematicShell";

export default function Home() {
  const {
    mode,
    chapters,
    activeChapter,
    yaml,
    script,
    editorTab,
    previewTab,
    converting,
    drafts,
    activeNav,
    loadText,
    updateChapterContent,
    setEditorTab,
    setPreviewTab,
    setActiveChapter,
    setScript,
    autoSaveDraft,
    removeDraft,
    restoreDraft,
    setConverting,
    setActiveNav,
    projects,
    activeProjectId,
    createNewProject,
    switchProject,
    removeProject,
  } = useApp();

  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [title, setTitle] = useState("未命名作品");
  const [author, setAuthor] = useState("未知");

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, chapters }),
      });
      const data = await res.json();
      if (data.error) {
        setToast({ message: "转换失败：" + data.error, type: "error" });
      } else {
        setScript(data.yaml, data.script);
        setEditorTab("script");
        autoSaveDraft(data.script.meta.title, data.yaml, data.script, chapters);
        setToast({ message: "剧本已自动保存到草稿", type: "success" });
      }
    } catch (err) {
      setToast({ message: "请求失败：" + String(err), type: "error" });
    } finally {
      setConverting(false);
    }
  };

  // Show editor pages by default when empty (no projects, no chapters)
  // so first-time visitors see the book, not an empty list
  const isEmpty = projects.length === 0 && chapters.length === 0;
  const isEditing = isEmpty || (activeNav !== "project" && activeNav !== "drafts" && activeNav !== "exports");

  return (
    <CinematicShell
      converting={converting}
      activeNav={activeNav}
      yaml={yaml}
      scriptTitle={title}
      script={script}
      onNavigate={setActiveNav}
      onConvert={handleConvert}
    >
      {isEditing ? (
        <>
          {/* ===== LEFT PAGE: Editor content ===== */}
          <div className="flex-1 cine-page cine-page-texture flex flex-col min-w-0 rounded-l-md overflow-hidden border-r border-[rgba(139,119,90,0.15)]">
            {/* Page header: title, author, tab toggle */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(139,119,90,0.12)]">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5 bg-[rgba(139,119,90,0.08)] p-0.5 rounded-md">
                  {(["novel", "script"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEditorTab(tab)}
                      className={`px-4 py-1.5 text-[12px] font-medium rounded transition-all duration-200 ${
                        editorTab === tab
                          ? "bg-[var(--cine-book-page)] text-[var(--cine-page-text)] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                          : "text-[var(--cine-page-secondary)] hover:text-[var(--cine-page-text)]"
                      }`}
                    >
                      {tab === "novel" ? "原文" : "剧本"}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-[rgba(139,119,90,0.15)]" />

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="作品标题"
                  className="w-28 bg-transparent text-[13px] font-medium text-[var(--cine-page-text)] placeholder-[var(--cine-page-secondary)] outline-none border-b border-transparent hover:border-[rgba(139,119,90,0.3)] focus:border-[var(--cine-accent)] transition-colors"
                />
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="作者"
                  className="w-16 bg-transparent text-[12px] text-[var(--cine-page-secondary)] placeholder-[var(--cine-page-secondary)] outline-none border-b border-transparent hover:border-[rgba(139,119,90,0.3)] focus:border-[var(--cine-accent)] transition-colors"
                />
              </div>

              <span className="text-[10px] text-[var(--cine-page-secondary)] tracking-wider uppercase">
                ScriptFlow
              </span>
            </div>

            {/* Page content */}
            <div className="flex-1 overflow-y-auto">
              {mode === "upload" ? (
                <Dropzone onTextLoaded={loadText} />
              ) : editorTab === "novel" ? (
                <NovelView
                  chapters={chapters}
                  activeChapter={activeChapter}
                  onSelectChapter={setActiveChapter}
                  onUpdateContent={updateChapterContent}
                />
              ) : script ? (
                <ScriptView script={script} />
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--cine-page-secondary)] text-[14px]">
                  拉动台灯链绳开始 AI 转换
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT PAGE: Preview content ===== */}
          <div className="flex-1 cine-page cine-page-texture flex flex-col min-w-0 rounded-r-md overflow-hidden">
            {!yaml && !script ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[14px] text-[var(--cine-page-secondary)]">
                  生成剧本后将在此预览
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(139,119,90,0.12)]">
                  <div className="flex gap-4">
                    {(["yaml", "fountain"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setPreviewTab(tab)}
                        className={`text-[12px] pb-2 -mb-[1px] font-medium transition-all ${
                          previewTab === tab
                            ? "text-[var(--cine-accent)] border-b-2 border-[var(--cine-accent)]"
                            : "text-[var(--cine-page-secondary)] hover:text-[var(--cine-page-text)]"
                        }`}
                      >
                        {tab === "yaml" ? "YAML" : "Fountain"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  {previewTab === "yaml" ? (
                    <YamlView yaml={yaml} />
                  ) : script ? (
                    <FountainView script={script} />
                  ) : null}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        /* ===== Overlay views for project/drafts/exports ===== */
        <div className="flex-1 cine-page cine-page-texture flex flex-col rounded-md overflow-hidden mx-1">
          <div className="flex items-center px-6 py-3 border-b border-[rgba(139,119,90,0.12)]">
            <h2 className="text-[14px] font-semibold text-[var(--cine-page-text)]">
              {activeNav === "project" ? "我的项目" : activeNav === "drafts" ? "草稿" : "导出记录"}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeNav === "project" ? (
              <ProjectsView
                projects={projects}
                activeProjectId={activeProjectId}
                onCreate={createNewProject}
                onSwitch={switchProject}
                onDelete={removeProject}
              />
            ) : (
              <DraftsView
                drafts={drafts}
                onRestore={restoreDraft}
                onDelete={removeDraft}
              />
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </CinematicShell>
  );
}
