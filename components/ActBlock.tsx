// components/ActBlock.tsx
import { Act } from "@/lib/types";
import SceneCard from "./SceneCard";

interface Props {
  act: Act;
  characterName: (id: string) => string;
}

export default function ActBlock({ act, characterName }: Props) {
  return (
    <div className="mb-8">
      <div className="mb-1">
        <span className="text-[11px] font-semibold text-[#0071e3] uppercase tracking-wider">
          第 {act.act} 幕
        </span>
      </div>
      <h2 className="text-[28px] font-bold tracking-[-0.5px] text-[#1d1d1f] mb-1">
        {act.title}
      </h2>
      {act.summary && (
        <p className="text-[14px] text-[#86868b] mb-6">{act.summary}</p>
      )}

      <div>
        {act.scenes.map((scene) => (
          <SceneCard key={scene.scene} scene={scene} characterName={characterName} />
        ))}
      </div>
    </div>
  );
}
