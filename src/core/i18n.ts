// i18n.ts — EN/JP UI language. paramLabel() covers knob names; t() covers everything else
// (tabs, particle rows, buttons, headers, notes). Persisted in localStorage.
import { PARAMS, type ParamName } from "./params";

export type Lang = "EN" | "JP";
const LS_KEY = "hado.lang";

let current: Lang = (localStorage.getItem(LS_KEY) as Lang) || "EN";
export function getLang(): Lang { return current; }
export function setLang(l: Lang): void { current = l; localStorage.setItem(LS_KEY, l); }
export function toggleLang(): Lang { setLang(current === "EN" ? "JP" : "EN"); return current; }

const PARAM_JA: Partial<Record<ParamName, string>> = {
  geoMode: "幾何モード", geoModeA: "ハイブリッドA", geoModeB: "ハイブリッドB", seedCount: "種数",
  angleOffset: "角度オフセット", wellDepth: "井戸の深さ", wellRadius: "井戸半径",
  lsysIterations: "L反復", branchAngle: "分岐角", lsysSeed: "Lシード", cellCount: "細胞数",
  relax: "Lloyd緩和", wallWidth: "壁の幅", wallHeight: "壁の高さ", geoMix: "幾何ミックス",
  brushRadius: "ブラシ半径", brushDepth: "ブラシ深度",
  packetX: "パケットX", packetY: "パケットY", packetWidth: "パケット幅", px: "運動量X", py: "運動量Y",
  substeps: "サブステップ", damping: "減衰", boundary: "境界", gamma: "ガンマ",
  hueShift: "色相回転", vOverlay: "V重ね",
  bpm: "テンポ", swing: "スイング", gateMode: "ゲート方式", gateThresh: "ゲート閾値",
  accentAmt: "アクセント量", humanize: "ヒューマナイズ", patternDensity: "量子密度",
  subLevel: "サブ", thudLevel: "鈍音", clickLevel: "クリック", tickLevel: "チック",
  popLevel: "ポップ", grainLevel: "粒", dustLevel: "塵", hissLevel: "ヒス",
  subTune: "サブ音程", clickTone: "クリック音色",
  modeCount: "モード数", fRoot: "基音", warp: "ワープ", grainSize: "粒の長さ",
  grainJitter: "粒の揺らぎ", grainSpread: "粒オクターブ", dustField: "塵の場",
  warmth: "温かさ", lowpass: "ローパス", wowAmount: "ワウ", wowRate: "ワウ速度",
  dubTime: "ダブ時間", dubFb: "ダブ帰還", dubTone: "ダブ音色", dubMix: "ダブ量",
  reverbSize: "残響長", reverbMix: "残響量",
  feedAmount: "帰還量", mutateRate: "変性レート", mutateSmooth: "変性平滑",
  rmsTarget: "RMS目標", centTarget: "重心目標", freeze: "凍結",
  midiEnable: "MIDI有効", midiCh: "MIDIチャンネル", wsRate: "WS送信レート",
  sendField: "場送信", fieldRate: "場レート",
};

export function paramLabel(name: ParamName): string {
  if (current === "JP") return PARAM_JA[name] ?? PARAMS[name].label;
  return PARAMS[name].label;
}

const STRINGS: Record<Lang, Record<string, string>> = {
  EN: {
    "tab.GEO": "GEO", "tab.FIELD": "FIELD", "tab.GROOVE": "GROOVE", "tab.TEXTURE": "TEXTURE",
    "tab.MUTATE": "MUTATE", "tab.IO": "IO",
    "row.sub": "sub", "row.thud": "thud", "row.click": "click", "row.tick": "tick",
    "row.pop": "pop", "row.grain": "grain", "row.dust": "dust", "row.hiss": "hiss",
    play: "▶ play", stop: "■ stop", clear: "clear", resetPsi: "reset ψ",
    save: "save", export: "export", import: "import",
    connect: "connect", disconnect: "disconnect", enableMidi: "enable midi",
    presetName: "preset name", macros: "MACROS", output: "OUTPUT", presets: "PRESETS",
    midiOut: "MIDI out (CC only)", tdBridge: "TouchDesigner bridge",
    beatNote: "particle beat · gate: MANUAL/QUANTUM/AND/OR · Space play · click=scatter",
  },
  JP: {
    "tab.GEO": "幾何", "tab.FIELD": "場", "tab.GROOVE": "律動", "tab.TEXTURE": "質感",
    "tab.MUTATE": "変性", "tab.IO": "入出力",
    "row.sub": "サブ", "row.thud": "鈍音", "row.click": "クリック", "row.tick": "チック",
    "row.pop": "ポップ", "row.grain": "粒", "row.dust": "塵", "row.hiss": "ヒス",
    play: "▶ 再生", stop: "■ 停止", clear: "クリア", resetPsi: "場リセット",
    save: "保存", export: "書出", import: "読込",
    connect: "接続", disconnect: "切断", enableMidi: "MIDI有効化",
    presetName: "プリセット名", macros: "マクロ", output: "出力", presets: "プリセット",
    midiOut: "MIDI出力（CCのみ）", tdBridge: "TouchDesigner連携",
    beatNote: "粒子ビート · ゲート: MANUAL/QUANTUM/AND/OR · Space再生 · クリック=散布",
  },
};

export function t(id: string): string {
  return STRINGS[current][id] ?? STRINGS.EN[id] ?? id;
}
