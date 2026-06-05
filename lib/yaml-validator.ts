// lib/yaml-validator.ts
import yaml from "js-yaml";
import { ScriptData } from "./types";

export interface ValidationResult {
  valid: boolean;
  data?: ScriptData;
  error?: string;
}

export function validateYaml(yamlString: string): ValidationResult {
  try {
    const data = yaml.load(yamlString) as ScriptData;

    if (!data.meta) return { valid: false, error: "Missing meta section" };
    if (!data.acts || !Array.isArray(data.acts)) {
      return { valid: false, error: "Missing or invalid acts array" };
    }

    for (const act of data.acts) {
      if (!act.scenes || !Array.isArray(act.scenes)) {
        return { valid: false, error: `Act ${act.act}: missing scenes array` };
      }
      for (const scene of act.scenes) {
        if (!scene.heading) {
          return { valid: false, error: `Act ${act.act} Scene ${scene.scene}: missing heading` };
        }
        if (!scene.beats || !Array.isArray(scene.beats)) {
          return { valid: false, error: `Act ${act.act} Scene ${scene.scene}: missing beats` };
        }
      }
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: String(error) };
  }
}

export function normalizeYaml(yamlString: string): string {
  try {
    const data = yaml.load(yamlString);
    return yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      quotingType: '"',
      forceQuotes: false,
    });
  } catch {
    return yamlString;
  }
}
