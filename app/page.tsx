// app/page.tsx
"use client";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import Toast from "@/components/Toast";
import Sidebar from "@/components/Sidebar";
import EditorPanel from "@/components/EditorPanel";
import PreviewPanel from "@/components/PreviewPanel";
import DraftsView from "@/components/DraftsView";
import ProjectsView from "@/components/ProjectsView";

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
    theme,
    toggleTheme,
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
        body: JSON.stringify({
          title,
          author,
          chapters,
        }),
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

  return (
    <div className="flex h-screen bg-[var(--apple-bg)]">
      <Sidebar
        chapters={chapters}
        activeChapter={activeChapter}
        converting={converting}
        yaml={yaml}
        scriptTitle={title}
        script={script}
        activeNav={activeNav}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={setActiveNav}
        onSelectChapter={setActiveChapter}
      />

      {activeNav === "project" ? (
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center px-6 py-3 border-b border-[rgba(0,0,0,0.06)] bg-[var(--apple-white)]">
            <h2 className="text-[15px] font-semibold text-[var(--apple-text)]">我的项目</h2>
          </div>
          <ProjectsView
            projects={projects}
            activeProjectId={activeProjectId}
            onCreate={createNewProject}
            onSwitch={switchProject}
            onDelete={removeProject}
          />
        </div>
      ) : activeNav === "drafts" || activeNav === "exports" ? (
        <div className="flex flex-col flex-1 min-w-0">
          <div className="glass flex items-center px-6 py-3 border-b border-[rgba(0,0,0,0.06)]">
            <h2 className="text-[15px] font-semibold text-[var(--apple-text)]">
              {activeNav === "drafts" ? "草稿" : "导出记录"}
            </h2>
          </div>
          <DraftsView
            drafts={drafts}
            onRestore={restoreDraft}
            onDelete={removeDraft}
          />
        </div>
      ) : (
        <>
          <EditorPanel
            mode={mode}
            chapters={chapters}
            activeChapter={activeChapter}
            script={script}
            editorTab={editorTab}
            converting={converting}
            title={title}
            author={author}
            onTitleChange={setTitle}
            onAuthorChange={setAuthor}
            onTextLoaded={loadText}
            onTabChange={setEditorTab}
            onConvert={handleConvert}
            onSelectChapter={setActiveChapter}
            onUpdateContent={updateChapterContent}
          />

          <PreviewPanel
            yaml={yaml}
            script={script}
            previewTab={previewTab}
            onTabChange={setPreviewTab}
          />
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
