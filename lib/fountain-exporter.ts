// lib/fountain-exporter.ts
import { ScriptData, ActionBeat, DialogueBeat } from "./types";

export function exportFountain(script: ScriptData): string {
  const lines: string[] = [];

  // Title page
  lines.push(`Title: ${script.meta.title}`);
  lines.push(`Author: ${script.meta.author}`);
  lines.push(`Source Chapters: ${script.meta.source_chapters}`);
  lines.push("");
  lines.push("===");
  lines.push("");

  for (const act of script.acts) {
    lines.push(`# ${act.title}`);
    lines.push("");
    lines.push(`// ${act.summary}`);
    lines.push("");

    for (const scene of act.scenes) {
      // Scene heading
      lines.push(scene.heading);
      lines.push("");

      // Visual description
      if (scene.visual) {
        lines.push(scene.visual);
        lines.push("");
      }

      // Beats
      for (const beat of scene.beats) {
        if (beat.type === "action") {
          lines.push((beat as ActionBeat).text);
          lines.push("");
        } else {
          const d = beat as DialogueBeat;
          const char = script.dramatis_personae.find((p) => p.id === d.character);
          lines.push(`          ${char?.name || d.character}`);
          if (d.parenthetical) {
            lines.push(`    (${d.parenthetical})`);
          }
          lines.push(d.line);
          lines.push("");
        }
      }

      // Transition
      if (scene.transition) {
        lines.push(scene.transition);
        lines.push("");
      }

      lines.push("");
    }
  }

  return lines.join("\n");
}
