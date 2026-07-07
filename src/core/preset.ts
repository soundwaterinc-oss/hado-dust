// preset.ts — named presets (localStorage) + JSON export/import of full state.
import { PARAMS, defaultState, type ParamName, type ParamState } from "./params";

const LS_KEY = "hado.presets.v1";

export interface Preset {
  name: string;
  params: Partial<Record<ParamName, number | string | boolean>>;
}

export const BUILTIN_PRESETS: Preset[] = [
  {
    name: "Dust",
    params: { geoMode: "PHYLLO", seedCount: 89, bpm: 112, swing: 0.36, gateMode: "AND",
      gateThresh: 0.36, dustField: 10, warmth: 0.4, lowpass: 4600, wowAmount: 0.35,
      dubMix: 0.24, reverbMix: 0.22, grainSize: 55, feedAmount: 0.3 },
  },
  {
    name: "Dub",
    params: { geoMode: "VORO", cellCount: 36, relax: 3, bpm: 90, swing: 0.4, gateMode: "OR",
      gateThresh: 0.44, patternDensity: 0.35, dubTime: 440, dubFb: 0.62, dubTone: 1400,
      dubMix: 0.4, lowpass: 3600, warmth: 0.5, reverbMix: 0.3, feedAmount: 0.4 },
  },
  {
    name: "Static",
    params: { geoMode: "LSYS", lsysIterations: 4, branchAngle: 22, bpm: 126, swing: 0.28,
      gateMode: "QUANTUM", gateThresh: 0.3, patternDensity: 0.7, dustField: 18,
      grainSize: 35, grainJitter: 0.6, warmth: 0.3, lowpass: 6500, reverbMix: 0.18, feedAmount: 0.5 },
  },
];

export function loadUserPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Preset[]) : [];
  } catch {
    return [];
  }
}

export function saveUserPreset(name: string, state: ParamState): void {
  const presets = loadUserPresets().filter((p) => p.name !== name);
  presets.push({ name, params: { ...state } });
  localStorage.setItem(LS_KEY, JSON.stringify(presets));
}

export function deleteUserPreset(name: string): void {
  const presets = loadUserPresets().filter((p) => p.name !== name);
  localStorage.setItem(LS_KEY, JSON.stringify(presets));
}

// Apply a preset onto a fresh default so missing keys fall back cleanly.
export function applyPreset(preset: Preset): ParamState {
  const state = defaultState();
  for (const key of Object.keys(preset.params) as ParamName[]) {
    if (key in PARAMS) state[key] = preset.params[key]!;
  }
  return state;
}

export function exportJSON(state: ParamState): string {
  return JSON.stringify({ format: "hado-preset-1", params: state }, null, 2);
}

export function importJSON(text: string): ParamState {
  const parsed = JSON.parse(text) as { params?: Record<string, unknown> };
  const state = defaultState();
  const src = parsed.params ?? {};
  for (const key of Object.keys(PARAMS) as ParamName[]) {
    if (key in src) state[key] = src[key] as number | string | boolean;
  }
  return state;
}
