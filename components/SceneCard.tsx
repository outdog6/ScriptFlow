import { Scene } from "@/lib/types";
import BeatLine from "./BeatLine";

interface Props {
  scene: Scene;
  characterName: (id: string) => string;
}

export default function SceneCard({ scene, characterName }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] font-semibold text-[#636366] uppercase tracking-wider">
          第 {scene.scene} 场
        </span>
        <span className="w-1 h-1 rounded-full bg-[#636366]" />
        <span className="text-[13px] text-[#636366]">{scene.heading}</span>
        {scene.mood && (
          <>
            <span className="w-1 h-1 rounded-full bg-[#636366]" />
            <span className="text-[12px] text-[#787880]">{scene.mood}</span>
          </>
        )}
      </div>

      {scene.visual && (
        <p className="text-[13px] text-[#636366] italic mb-4 pl-0.5">
          {scene.visual}
        </p>
      )}

      {scene.plot_function && (
        <p className="text-[11px] text-[#787880] mb-4 uppercase tracking-wider">
          叙事功能：{scene.plot_function}
        </p>
      )}

      <div className="space-y-0.5">
        {scene.beats.map((beat, i) => (
          <BeatLine key={i} beat={beat} characterName={characterName} />
        ))}
      </div>

      {scene.transition && (
        <p className="text-center pt-4 text-xs font-medium uppercase tracking-wider text-[#636366]">
          {scene.transition}
        </p>
      )}
    </div>
  );
}
