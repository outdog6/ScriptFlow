"use client";
import { useState, useCallback, DragEvent } from "react";
import { Upload, ClipboardPaste } from "lucide-react";

interface Props {
  onTextLoaded: (text: string) => void;
}

export default function Dropzone({ onTextLoaded }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          onTextLoaded(ev.target?.result as string);
        };
        reader.readAsText(file);
      }
    },
    [onTextLoaded]
  );

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) onTextLoaded(text);
    } catch {
      alert("无法读取剪贴板，请手动粘贴");
    }
  }, [onTextLoaded]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-[360px] h-[220px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-white ${
          dragging
            ? "border-[#0071e3] bg-[rgba(0,113,227,0.03)]"
            : "border-[rgba(0,0,0,0.15)] hover:border-[#0071e3] hover:bg-[rgba(0,113,227,0.03)]"
        }`}
      >
        <Upload className="w-10 h-10 text-[#86868b]" strokeWidth={1.5} />
        <p className="text-[15px] font-medium text-[#1d1d1f]">拖拽小说文件到此处</p>
        <p className="text-[12px] text-[#86868b]">支持 .txt 文件，UTF-8 编码</p>
      </div>

      <span className="text-[13px] text-[#86868b]">或</span>

      <button
        onClick={handlePaste}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(0,0,0,0.15)] bg-white text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all"
      >
        <ClipboardPaste className="w-4 h-4" strokeWidth={1.5} />
        从剪贴板粘贴
      </button>
    </div>
  );
}
