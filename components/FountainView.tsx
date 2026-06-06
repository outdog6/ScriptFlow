// components/FountainView.tsx
import { ScriptData } from "@/lib/types";
import { exportFountain } from "@/lib/fountain-exporter";

interface Props {
  script: ScriptData;
}

export default function FountainView({ script }: Props) {
  const fountain = exportFountain(script);

  return (
    <pre className="bg-[#1c1c1e] rounded-xl p-5 font-mono text-[12px] leading-[1.8] text-[#e5e5e7] whitespace-pre-wrap overflow-x-auto">
      {fountain}
    </pre>
  );
}
