// lib/yaml-builder.ts
import yaml from "js-yaml";
import { ScriptData, Act, CharacterProfile } from "./types";

export function buildYaml(script: ScriptData): string {
  return yaml.dump(script, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  });
}

export function createEmptyScriptData(title: string, author: string): ScriptData {
  return {
    meta: {
      title,
      author,
      source_chapters: 0,
      format: "fountain",
      exported_at: "",
    },
    dramatis_personae: [],
    acts: [],
  };
}

export function assembleScriptData(
  meta: ScriptData["meta"],
  personae: CharacterProfile[],
  acts: Act[]
): ScriptData {
  return {
    meta,
    dramatis_personae: personae,
    acts,
  };
}
