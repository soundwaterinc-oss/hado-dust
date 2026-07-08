// params.ts — single source of truth for all parameters (drives UI, preset, TD send).
// HADŌ DUST / 波動塵 — the quantum field expressed purely as particle rhythm (Jelinek dust).
import { CHARACTERS } from "../audio/particles";
import { ENGINES, CLIMATES, CURRENTS, SOILS, WEATHERS } from "../seq/arranger";
export type ParamTab = "PERFORM" | "GEO" | "FIELD" | "GROOVE" | "TEXTURE" | "EVOLVE" | "MUTATE" | "IO" | "INFO";

export interface NumberParam { kind: "number"; tab: ParamTab; label: string; min: number; max: number; def: number; step?: number; unit?: string }
export interface EnumParam { kind: "enum"; tab: ParamTab; label: string; options: readonly string[]; def: string }
export interface BoolParam { kind: "bool"; tab: ParamTab; label: string; def: boolean }
export type ParamDef = NumberParam | EnumParam | BoolParam;

const n = (tab: ParamTab, label: string, min: number, max: number, def: number, step?: number, unit?: string): NumberParam =>
  ({ kind: "number", tab, label, min, max, def, step, unit });
const e = (tab: ParamTab, label: string, options: readonly string[], def: string): EnumParam =>
  ({ kind: "enum", tab, label, options, def });
const b = (tab: ParamTab, label: string, def: boolean): BoolParam => ({ kind: "bool", tab, label, def });

export const PARAMS = {
  // ── PERFORM ──────────────────────────────────────────────────────────
  masterGain: n("PERFORM", "master gain", 0, 1.5, 0.9, 0.01),

  // ── GEO ──────────────────────────────────────────────────────────────
  geoMode: e("GEO", "geo mode", ["PHYLLO", "LSYS", "VORO", "HYBRID"], "PHYLLO"),
  geoModeA: e("GEO", "hybrid A", ["PHYLLO", "LSYS", "VORO"], "PHYLLO"),
  geoModeB: e("GEO", "hybrid B", ["PHYLLO", "LSYS", "VORO"], "VORO"),
  seedCount: n("GEO", "seeds", 8, 256, 89, 1),
  angleOffset: n("GEO", "angle offset", -3, 3, 0, 0.01, "°"),
  wellDepth: n("GEO", "well depth", 0, 1, 0.55, 0.01),
  wellRadius: n("GEO", "well radius", 0.01, 0.1, 0.03, 0.001),
  lsysIterations: n("GEO", "L iterations", 1, 5, 3, 1),
  branchAngle: n("GEO", "branch angle", 15, 40, 25.7, 0.1, "°"),
  lsysSeed: n("GEO", "L seed", 1, 9999, 1, 1),
  cellCount: n("GEO", "cells", 8, 128, 32, 1),
  relax: n("GEO", "Lloyd relax", 0, 8, 2, 1),
  wallWidth: n("GEO", "wall width", 0.005, 0.04, 0.012, 0.001),
  wallHeight: n("GEO", "wall height", 0, 1, 0.7, 0.01),
  geoMix: n("GEO", "geo mix", 0, 1, 0, 0.01),
  brushRadius: n("GEO", "brush radius", 0.01, 0.1, 0.04, 0.001),
  brushDepth: n("GEO", "brush depth", -1, 1, -0.5, 0.01),

  // ── FIELD ────────────────────────────────────────────────────────────
  packetX: n("FIELD", "packet x", 0, 1, 0.5, 0.001),
  packetY: n("FIELD", "packet y", 0, 1, 0.5, 0.001),
  packetWidth: n("FIELD", "packet width", 0.02, 0.2, 0.09, 0.001),
  px: n("FIELD", "momentum x", -40, 40, 6, 0.1),
  py: n("FIELD", "momentum y", -40, 40, 3, 0.1),
  substeps: n("FIELD", "substeps", 1, 32, 8, 1),
  damping: n("FIELD", "damping", 0, 0.02, 0.002, 0.0001),
  boundary: e("FIELD", "boundary", ["reflect", "absorb"], "reflect"),
  gamma: n("FIELD", "gamma", 0.3, 1.5, 0.7, 0.01),
  hueShift: n("FIELD", "hue shift", 0, 360, 0, 1, "°"),
  vOverlay: n("FIELD", "V overlay", 0, 1, 0.3, 0.01),

  // ── GROOVE ───────────────────────────────────────────────────────────
  bpm: n("GROOVE", "bpm", 40, 200, 116, 1),
  swing: n("GROOVE", "swing", 0, 0.7, 0.34, 0.01),
  gateMode: e("GROOVE", "gate mode", ["MANUAL", "QUANTUM", "AND", "OR"], "AND"),
  gateThresh: n("GROOVE", "gate thresh", 0, 1, 0.38, 0.01),
  accentAmt: n("GROOVE", "accent amt", 0, 1, 0.6, 0.01),
  humanize: n("GROOVE", "humanize", 0, 0.05, 0.014, 0.001, "s"),
  patternDensity: n("GROOVE", "quantum density", 0, 1, 0.5, 0.01),
  subLevel: n("GROOVE", "sub", 0, 1, 0.7, 0.01),
  thudLevel: n("GROOVE", "thud", 0, 1, 0.6, 0.01),
  clickLevel: n("GROOVE", "click", 0, 1, 0.5, 0.01),
  tickLevel: n("GROOVE", "tick", 0, 1, 0.45, 0.01),
  popLevel: n("GROOVE", "pop", 0, 1, 0.4, 0.01),
  grainLevel: n("GROOVE", "grain", 0, 1, 0.5, 0.01),
  dustLevel: n("GROOVE", "dust", 0, 1, 0.4, 0.01),
  hissLevel: n("GROOVE", "hiss", 0, 1, 0.3, 0.01),
  subTune: n("GROOVE", "sub tune", 35, 90, 52, 1, "Hz"),
  clickTone: n("GROOVE", "click tone", 1500, 6000, 3200, 10, "Hz"),

  // ── TEXTURE ──────────────────────────────────────────────────────────
  modeCount: n("TEXTURE", "modes", 1, 16, 6, 1),
  fRoot: n("TEXTURE", "f root", 30, 400, 66, 1, "Hz"),
  warp: n("TEXTURE", "warp", 0.3, 2.0, 0.8, 0.01),
  grainSize: n("TEXTURE", "grain size", 10, 200, 55, 1, "ms"),
  grainJitter: n("TEXTURE", "grain jitter", 0, 1, 0.4, 0.01),
  grainSpread: n("TEXTURE", "grain octave", 0, 3, 1, 1),
  dustField: n("TEXTURE", "dust field", 0, 30, 8, 0.5, "/s"),
  warmth: n("TEXTURE", "warmth", 0, 1, 0.35, 0.01),
  lowpass: n("TEXTURE", "lowpass", 400, 16000, 5200, 50, "Hz"),
  wowAmount: n("TEXTURE", "wow", 0, 1, 0.35, 0.01),
  wowRate: n("TEXTURE", "wow rate", 0.1, 6, 0.6, 0.01, "Hz"),
  dubTime: n("TEXTURE", "dub time", 40, 1000, 375, 1, "ms"),
  dubFb: n("TEXTURE", "dub feedback", 0, 0.9, 0.45, 0.01),
  dubTone: n("TEXTURE", "dub tone", 400, 6000, 1800, 10, "Hz"),
  dubMix: n("TEXTURE", "dub mix", 0, 1, 0.28, 0.01),
  reverbSize: n("TEXTURE", "reverb size", 0.5, 6, 2, 0.1, "s"),
  reverbMix: n("TEXTURE", "reverb mix", 0, 1, 0.22, 0.01),
  character: e("TEXTURE", "character", CHARACTERS, "DUST"),

  // ── EVOLVE (auto arrangement) ────────────────────────────────────────
  arrangeOn: b("EVOLVE", "auto evolve", true),
  engine: e("EVOLVE", "engine", ENGINES, "PLANT"),
  climate: e("EVOLVE", "climate", CLIMATES, "temperate"),
  current: e("EVOLVE", "current", CURRENTS, "warm"),
  soil: e("EVOLVE", "soil", SOILS, "loam"),
  weather: e("EVOLVE", "weather", WEATHERS, "clear"),
  sectionBars: n("EVOLVE", "section bars", 4, 32, 16, 1),
  stageBars: n("EVOLVE", "stage bars", 8, 64, 32, 1),

  // ── MUTATE ───────────────────────────────────────────────────────────
  feedAmount: n("MUTATE", "feed amount", 0, 1, 0.3, 0.01),
  mutateRate: n("MUTATE", "mutate rate", 0.1, 2, 0.5, 0.01, "Hz"),
  mutateSmooth: n("MUTATE", "mutate smooth", 1, 10, 4, 0.1, "s"),
  rmsTarget: n("MUTATE", "rms target", -48, 0, -20, 0.5, "dB"),
  centTarget: n("MUTATE", "cent target", 200, 4000, 1200, 10, "Hz"),
  freeze: b("MUTATE", "freeze", false),

  // ── IO ───────────────────────────────────────────────────────────────
  midiEnable: b("IO", "midi enable", false),
  midiCh: n("IO", "midi ch", 1, 16, 10, 1),
  wsRate: n("IO", "ws rate", 10, 60, 30, 1, "fps"),
  sendField: b("IO", "send field", false),
  fieldRate: n("IO", "field rate", 5, 30, 15, 1, "fps"),
} as const satisfies Record<string, ParamDef>;

export type ParamName = keyof typeof PARAMS;
export type ParamValue = number | string | boolean;
export type ParamState = Record<ParamName, ParamValue>;

export function defaultState(): ParamState {
  const s = {} as ParamState;
  for (const key of Object.keys(PARAMS) as ParamName[]) s[key] = PARAMS[key].def;
  return s;
}

export interface Settings { gridSize: number; wsUrl: string; midiDeviceId: string }
export function defaultSettings(): Settings {
  return { gridSize: 256, wsUrl: "ws://localhost:9980", midiDeviceId: "" };
}
