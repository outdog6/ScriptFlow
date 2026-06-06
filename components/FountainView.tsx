// components/FountainView.tsx
import { ScriptData } from "@/lib/types";
import { exportFountain } from "@/lib/fountain-exporter";

interface Props {
  script: ScriptData;
}

export default function FountainView({ script }: Props) {
  const fountain = exportFountain(script);

  return (
    <pre className="bg-[var(--apple-text)] rounded-xl p-5 font-mono text-[12px] leading-[1.8] text-[var(--apple-bg)] whitespace-pre-wrap overflow-x-auto">
      {fountain}
    </pre>
  );
}
