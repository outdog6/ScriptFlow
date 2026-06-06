import { memo } from "react";
// components/ActBlock.tsx
import { Act } from "@/lib/types";
import SceneCard from "./SceneCard";

interface Props {
  act: Act;
  characterName: (id: string) => string;
}

function ActBlock({ act, characterName }: Props) {
  return (
    <div className="mb-8">
      <div className="mb-1">
        <span className="text-[11px] font-semibold text-[var(--apple-blue)] uppercase tracking-wider">
          第 {act.act} 幕
        </span>
      </div>
      <h2 className="text-[28px] font-bold tracking-[-0.5px] text-[var(--apple-text)] mb-1 [text-wrap:balance]">
        {act.title}
      </h2>
      {act.summary && (
        <p className="text-[14px] text-[var(--apple-secondary)] mb-6">{act.summary}</p>
      )}

      <div>
        {act.scenes.map((scene) => (
          <SceneCard key={scene.scene} scene={scene} characterName={characterName} />
        ))}
      </div>
    </div>
  );
}
export default memo(ActBlock);
