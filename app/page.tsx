// app/page.tsx
"use client";
import { useApp } from "@/lib/AppContext";
import Sidebar from "@/components/Sidebar";
import EditorPanel from "@/components/EditorPanel";
import PreviewPanel from "@/components/PreviewPanel";

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
    loadText,
    setEditorTab,
    setPreviewTab,
    setActiveChapter,
    setScript,
    setConverting,
  } = useApp();

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
        alert("转换失败：" + data.error);
      } else {
        setScript(data.yaml, data.script);
        setEditorTab("script");
      }
    } catch (err) {
      alert("请求失败：" + String(err));
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5f7]">
      <Sidebar
        chapters={chapters}
        activeChapter={activeChapter}
        converting={converting}
        yaml={yaml}
        scriptTitle={script?.meta?.title || ""}
        activeNav="project"
        onNavigate={() => {}}
        onSelectChapter={setActiveChapter}
      />

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
    </div>
  );
}
