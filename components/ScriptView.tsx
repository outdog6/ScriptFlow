// components/ScriptView.tsx
import { ScriptData } from "@/lib/types";
import ActBlock from "./ActBlock";

interface Props {
  script: ScriptData;
}

export default function ScriptView({ script }: Props) {
  const getName = (id: string): string => {
    const person = script.dramatis_personae.find((p) => p.id === id);
    return person?.name || id;
  };

  return (
    <div className="max-w-[720px] mx-auto py-8">
      {script.acts.map((act) => (
        <ActBlock key={act.act} act={act} characterName={getName} />
      ))}
    </div>
  );
}
