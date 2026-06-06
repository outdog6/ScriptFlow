import { Download } from "lucide-react";
import { ScriptData } from "@/lib/types";
import { exportFountain } from "@/lib/fountain-exporter";

interface Props {
  yaml: string;
  scriptTitle: string;
  script: ScriptData | null;
}

export default function ExportButton({ yaml, scriptTitle, script }: Props) {
  const download = (content: string, ext: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scriptTitle || "script"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportYaml = () => {
    const fixed = yaml.replace(/title:\s*".*?"/, `title: "${scriptTitle}"`);
    download(fixed, "yaml", "text/yaml");
  };

  const handleExportFountain = () => {
    if (!script) return;
    const fountain = exportFountain(script);
    download(fountain, "fountain", "text/plain");
  };

  if (!yaml) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={handleExportYaml}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-white text-[14px] font-semibold transition-all duration-200 shadow-[0_2px_8px_rgba(0,113,227,0.25)] bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-hover)] hover:shadow-[0_4px_16px_rgba(0,113,227,0.4)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
      >
        <Download className="w-4 h-4" strokeWidth={2} />
        导出 YAML
      </button>
      {script && (
        <button
          onClick={handleExportFountain}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)] text-[var(--apple-text)] hover:bg-[rgba(0,0,0,0.04)]"
        >
          <Download className="w-4 h-4" strokeWidth={1.5} />
          导出 Fountain
        </button>
      )}
    </div>
  );
}
