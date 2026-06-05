// app/page.tsx
"use client";
import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import Toast from "@/components/Toast";
import Sidebar from "@/components/Sidebar";
import EditorPanel from "@/components/EditorPanel";
import PreviewPanel from "@/components/PreviewPanel";
import DraftsView from "@/components/DraftsView";

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
    setEditorTab,
    setPreviewTab,
    setActiveChapter,
    setScript,
    autoSaveDraft,
    removeDraft,
    restoreDraft,
    setConverting,
    setActiveNav,
  } = useApp();

  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const handleConvert = async () => {
    setConverting(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "未命名作品",
          author: "未知",
          chapters,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setToast({ message: "转换失败：" + data.error, type: "error" });
      } else {
        setScript(data.yaml, data.script);
        setEditorTab("script");
        autoSaveDraft(data.script.meta.title, data.yaml, data.script);
        setToast({ message: "剧本已自动保存到草稿", type: "success" });
      }
    } catch (err) {
      setToast({ message: "请求失败：" + String(err), type: "error" });
    } finally {
      setConverting(false);
    }
  };

  const showMainWorkspace = activeNav === "project" || chapters.length > 0;

  return (
    <div className="flex h-screen bg-[#f5f5f7]">
      <Sidebar
        chapters={chapters}
        activeChapter={activeChapter}
        converting={converting}
        yaml={yaml}
        scriptTitle={script?.meta?.title || ""}
        activeNav={activeNav}
        onNavigate={setActiveNav}
        onSelectChapter={setActiveChapter}
      />

      {activeNav === "drafts" || activeNav === "exports" ? (
        <div className="flex flex-col flex-1 min-w-0">
          <div className="glass flex items-center px-6 py-3 border-b border-[rgba(0,0,0,0.06)]">
            <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
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
            onTextLoaded={loadText}
            onTabChange={setEditorTab}
            onConvert={handleConvert}
            onSelectChapter={setActiveChapter}
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
