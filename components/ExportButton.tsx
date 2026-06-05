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
      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#0071e3] text-white text-[14px] font-medium hover:bg-[#0077ed] transition-all"
    >
      <Download className="w-4 h-4" strokeWidth={1.5} />
      导出 YAML
    </button>
  );
}
