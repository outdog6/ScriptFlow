// components/ExportButton.tsx
import { Download } from "lucide-react";

interface Props {
  yaml: string;
  scriptTitle: string;
}

export default function ExportButton({ yaml, scriptTitle }: Props) {
  const handleExportYaml = () => {
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scriptTitle || "script"}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!yaml) return null;

  return (
    <button
      onClick={handleExportYaml}
      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-white text-[14px] font-semibold transition-all duration-200 shadow-[0_2px_8px_rgba(0,113,227,0.25)] bg-[#0071e3] hover:bg-[#0077ed] hover:shadow-[0_4px_16px_rgba(0,113,227,0.4)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
    >
      <Download className="w-4 h-4" strokeWidth={2} />
      导出 YAML
    </button>
  );
}
