import { memo } from "react";
import { Beat, ActionBeat, DialogueBeat } from "@/lib/types";

interface Props {
  beat: Beat;
  characterName?: (id: string) => string;
}

function BeatLine({ beat, characterName }: Props) {
  if (beat.type === "action") {
    return (
      <p className="py-1 text-sm text-[var(--apple-secondary)] italic leading-relaxed">
        {(beat as ActionBeat).text}
      </p>
    );
  }

  const d = beat as DialogueBeat;
  return (
    <div className="py-1.5">
      <p className="text-[15px] leading-relaxed">
        <span className="font-semibold text-[var(--apple-blue)] mr-2">
          {characterName ? characterName(d.character) : d.character}
        </span>
        {d.parenthetical && (
          <span className="text-[var(--apple-secondary)] text-sm">{"(" + d.parenthetical + ")"}</span>
        )}
        <span className="ml-1">{d.line}</span>
      </p>
      {d.subtext && (
        <p className="text-xs text-[#787880] mt-0.5 ml-1 italic">
          {'// ' + d.subtext}
        </p>
      )}
    </div>
  );
}
export default memo(BeatLine);
