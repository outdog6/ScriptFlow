// components/EditorPanel.tsx
import { NovelChapter, ScriptData } from "@/lib/types";
import EditorToolbar from "./EditorToolbar";
import Dropzone from "./Dropzone";
import NovelView from "./NovelView";
import ScriptView from "./ScriptView";

interface Props {
  mode: "upload" | "editing";
  chapters: NovelChapter[];
  activeChapter: number;
  script: ScriptData | null;
  editorTab: "novel" | "script";
  converting: boolean;
  onTextLoaded: (text: string) => void;
  onTabChange: (tab: "novel" | "script") => void;
  onConvert: () => void;
  onSelectChapter: (id: number) => void;
  onUpdateContent: (id: number, content: string) => void;
}

export default function EditorPanel({
  mode,
  chapters,
  activeChapter,
  script,
  editorTab,
  converting,
  onTextLoaded,
  onTabChange,
  onConvert,
  onSelectChapter,
  onUpdateContent,
}: Props) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <EditorToolbar
        editorTab={editorTab}
        onTabChange={onTabChange}
        onConvert={onConvert}
        converting={converting}
      />

      <div className="flex-1 overflow-y-auto">
        {mode === "upload" ? (
          <Dropzone onTextLoaded={onTextLoaded} />
        ) : editorTab === "novel" ? (
          <NovelView
            chapters={chapters}
            activeChapter={activeChapter}
            onSelectChapter={onSelectChapter}
            onUpdateContent={onUpdateContent}
          />
        ) : script ? (
          <ScriptView script={script} />
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--apple-secondary)] text-[14px]">
            点击右上角「AI 转换」生成剧本
          </div>
        )}
      </div>
    </div>
  );
}
