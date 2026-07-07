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
  reverbSize: "残響長", reverbMix: "残響量", masterGain: "マスター音量",
  feedAmount: "帰還量", mutateRate: "変性レート", mutateSmooth: "変性平滑",
  rmsTarget: "RMS目標", centTarget: "重心目標", freeze: "凍結",
  midiEnable: "MIDI有効", midiCh: "MIDIチャンネル", wsRate: "WS送信レート",
  sendField: "場送信", fieldRate: "場レート",
};

// One-line description per parameter (shown in the INFO tab).
const DESC_EN: Partial<Record<ParamName, string>> = {
  geoMode: "which plant geometry builds the potential V (wells & walls)",
  geoModeA: "source A blended in HYBRID mode",
  geoModeB: "source B blended in HYBRID mode",
  seedCount: "number of phyllotaxis seeds / wells",
  angleOffset: "nudge the golden angle — swirls the spiral",
  wellDepth: "depth of each well (how strongly it traps the wave)",
  wellRadius: "size of each well",
  lsysIterations: "L-system growth depth (branch complexity)",
  branchAngle: "L-system branch angle",
  lsysSeed: "random seed (reproducible L-system / Voronoi)",
  cellCount: "number of Voronoi cells",
  relax: "Lloyd relaxation passes (evens out cells)",
  wallWidth: "barrier wall thickness",
  wallHeight: "barrier wall height (reflects the wave)",
  geoMix: "crossfade A↔B in HYBRID",
  brushRadius: "canvas brush size",
  brushDepth: "brush amount: dig (−) / raise (+) the potential",
  packetX: "initial wave-packet x position",
  packetY: "initial wave-packet y position",
  packetWidth: "wave-packet size",
  px: "initial momentum x (direction & speed)",
  py: "initial momentum y",
  substeps: "simulation steps per frame (accuracy vs cost)",
  damping: "bleeds energy so the sim stays stable",
  boundary: "reflect (box) or absorb (soft edges)",
  gamma: "brightness curve of |ψ|²",
  hueShift: "rotate the phase → hue colour mapping",
  vOverlay: "show the potential walls over the field",
  bpm: "tempo",
  swing: "shuffle — delays off-beat 16ths",
  gateMode: "MANUAL grid · QUANTUM field · AND tight · OR busy",
  gateThresh: "|ψ|² level a lane probe must exceed to fire",
  accentAmt: "how much |ψ|² boosts particle velocity",
  humanize: "random timing scatter (dusty feel)",
  patternDensity: "thins the quantum (field-driven) hits",
  subLevel: "level — soft rounded low pulse",
  thudLevel: "level — muffled low thud",
  clickLevel: "level — high filtered click",
  tickLevel: "level — mid woody tick",
  popLevel: "level — short sine pip",
  grainLevel: "level — pitched micro-grain from the spectrum",
  dustLevel: "level — vinyl crackle cluster",
  hissLevel: "level — filtered noise swell",
  subTune: "sub/thud fundamental pitch",
  clickTone: "click centre frequency",
  modeCount: "how many spectral peaks feed the grains",
  fRoot: "base frequency the spectrum maps onto",
  warp: "spectrum → pitch curve (spread of partials)",
  grainSize: "length of grain / hiss particles",
  grainJitter: "pitch wobble on short grains",
  grainSpread: "octaves the grains are shifted up",
  dustField: "continuous crackle rate (follows spectral flux)",
  warmth: "soft tape saturation amount",
  lowpass: "master lowpass cutoff (darkness)",
  wowAmount: "tape wow/flutter depth",
  wowRate: "tape wow/flutter speed",
  dubTime: "dub delay time",
  dubFb: "dub delay feedback (echo tails)",
  dubTone: "lowpass inside the delay feedback",
  dubMix: "dub delay send level",
  reverbSize: "warm plate reverb length",
  reverbMix: "reverb send level",
  masterGain: "final output level",
  feedAmount: "depth of audio → geometry feedback (0 = off)",
  mutateRate: "how often the geometry mutates",
  mutateSmooth: "smoothing of the mutation",
  rmsTarget: "loudness the feedback aims for",
  centTarget: "brightness the feedback aims for",
  freeze: "pause the mutation loop",
  midiEnable: "enable WebMIDI output",
  midiCh: "MIDI channel",
  wsRate: "TouchDesigner JSON send rate",
  sendField: "stream the 64×64 |ψ|² field to TD",
  fieldRate: "TD field-frame rate",
};
const DESC_JP: Partial<Record<ParamName, string>> = {
  geoMode: "ポテンシャルV（井戸と壁）を作る植物幾何の種類",
  geoModeA: "HYBRID時に混ぜる素材A",
  geoModeB: "HYBRID時に混ぜる素材B",
  seedCount: "フィロタキシスの種（井戸）の数",
  angleOffset: "黄金角を微調整——螺旋が渦を巻く",
  wellDepth: "各井戸の深さ（波を捕える強さ）",
  wellRadius: "各井戸の大きさ",
  lsysIterations: "L-systemの成長段階（枝の複雑さ）",
  branchAngle: "L-systemの分岐角",
  lsysSeed: "乱数シード（L-system/ボロノイの再現）",
  cellCount: "ボロノイ細胞の数",
  relax: "Lloyd緩和の回数（細胞を均す）",
  wallWidth: "障壁の壁の厚み",
  wallHeight: "障壁の壁の高さ（波を反射）",
  geoMix: "HYBRIDでのA↔Bクロスフェード",
  brushRadius: "キャンバスのブラシ半径",
  brushDepth: "ブラシ量：掘る(−)/盛る(+)",
  packetX: "初期波束のX位置",
  packetY: "初期波束のY位置",
  packetWidth: "波束の大きさ",
  px: "初期運動量X（向きと速さ）",
  py: "初期運動量Y",
  substeps: "1フレームのシミュ回数（精度⇄負荷）",
  damping: "エネルギーを逃がし発散を防ぐ",
  boundary: "reflect（箱）/ absorb（柔らかい端）",
  gamma: "|ψ|²の明るさカーブ",
  hueShift: "位相→色相マッピングの回転",
  vOverlay: "場に重ねてポテンシャルの壁を表示",
  bpm: "テンポ",
  swing: "シャッフル——裏の16分を遅らせる",
  gateMode: "MANUAL格子 · QUANTUM場 · AND密 · OR多",
  gateThresh: "レーンのプローブが発火する|ψ|²閾値",
  accentAmt: "|ψ|²がベロシティを持ち上げる量",
  humanize: "タイミングのランダム散らし（塵の質感）",
  patternDensity: "量子（場駆動）ヒットを間引く",
  subLevel: "音量——丸い低パルス",
  thudLevel: "音量——こもった低い鈍音",
  clickLevel: "音量——高域フィルタのクリック",
  tickLevel: "音量——中域の木質チック",
  popLevel: "音量——短いサイン・ポップ",
  grainLevel: "音量——スペクトル由来のピッチ付き粒",
  dustLevel: "音量——ビニールのプチノイズ塊",
  hissLevel: "音量——フィルタノイズのスウェル",
  subTune: "サブ/鈍音の基音ピッチ",
  clickTone: "クリックの中心周波数",
  modeCount: "粒に使うスペクトルのピーク数",
  fRoot: "スペクトルを写す基準周波数",
  warp: "スペクトル→ピッチのカーブ（部分音の広がり）",
  grainSize: "粒/ヒス粒子の長さ",
  grainJitter: "短い粒のピッチ揺らぎ",
  grainSpread: "粒を上げるオクターブ数",
  dustField: "連続プチノイズの密度（spectral flux追従）",
  warmth: "テープ・サチュレーション量",
  lowpass: "マスターのローパス（暗さ）",
  wowAmount: "テープのワウ/フラッター深さ",
  wowRate: "テープのワウ/フラッター速さ",
  dubTime: "ダブディレイの時間",
  dubFb: "ダブディレイのフィードバック（残響尾）",
  dubTone: "ディレイ帰還内のローパス",
  dubMix: "ダブディレイの送り量",
  reverbSize: "暖色プレート残響の長さ",
  reverbMix: "残響の送り量",
  masterGain: "最終出力レベル",
  feedAmount: "音→幾何フィードバックの深さ（0で停止）",
  mutateRate: "幾何が変性する頻度",
  mutateSmooth: "変性の平滑化",
  rmsTarget: "フィードバックが目指す音量",
  centTarget: "フィードバックが目指す明るさ",
  freeze: "変性ループを一時停止",
  midiEnable: "WebMIDI出力を有効化",
  midiCh: "MIDIチャンネル",
  wsRate: "TouchDesigner JSON送信レート",
  sendField: "64×64 |ψ|² 場をTDへ送出",
  fieldRate: "TD場フレームレート",
};
export function paramDesc(name: ParamName): string {
  return (current === "JP" ? DESC_JP[name] : DESC_EN[name]) ?? "";
}

export function paramLabel(name: ParamName): string {
  if (current === "JP") return PARAM_JA[name] ?? PARAMS[name].label;
  return PARAMS[name].label;
}

const STRINGS: Record<Lang, Record<string, string>> = {
  EN: {
    "tab.PERFORM": "PLAY", "tab.INFO": "INFO",
    "tab.GEO": "GEO", "tab.FIELD": "FIELD", "tab.GROOVE": "GROOVE", "tab.TEXTURE": "TEXTURE",
    "tab.MUTATE": "MUTATE", "tab.IO": "IO",
    perform: "PERFORMANCE", quickPresets: "PRESETS", gateModeLabel: "GATE MODE",
    conceptTitle: "HADŌ DUST / 波動塵 — concept",
    concept:
      "The time-independent Schrödinger equation −∇²ψ + Vψ = Eψ is the same mathematics " +
      "as a vibrating membrane: quantum stationary states ARE acoustic modes. Plant geometry " +
      "(phyllotaxis / L-system / Voronoi cells) shapes a potential V; a wave packet ψ evolves on it. " +
      "Here ψ is expressed PURELY as rhythm made of particles — soft sub thuds, filtered clicks, " +
      "pitched micro-grains from the eigen-spectrum, and vinyl dust. Where |ψ|² floods a lane's field " +
      "probe, that particle scatters (the quantum gate). No melody, no bass — just dust through a warm tape chain.\n\n" +
      "Click the field to collapse ψ and scatter particles. Drag to brush the potential (Shift = raise). " +
      "Space plays; R resets the field; F freezes the mutation loop.",
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
    "tab.PERFORM": "演奏", "tab.INFO": "説明",
    "tab.GEO": "幾何", "tab.FIELD": "場", "tab.GROOVE": "律動", "tab.TEXTURE": "質感",
    "tab.MUTATE": "変性", "tab.IO": "入出力",
    perform: "演奏コントロール", quickPresets: "プリセット", gateModeLabel: "ゲート方式",
    conceptTitle: "HADŌ DUST / 波動塵 — 概念",
    concept:
      "時間非依存シュレディンガー方程式 −∇²ψ + Vψ = Eψ は、膜の振動（Helmholtz方程式）と同じ数学です。" +
      "量子の定常状態＝音響の固有モード。植物の幾何（フィロタキシス／L-system／ボロノイ細胞）が" +
      "ポテンシャルVを形づくり、その上を波束ψが時間発展します。ここではψを「完全にビート——微小な粒」" +
      "だけで表現します。丸い低いサブ、フィルタされたクリック、固有スペクトル由来のピッチ付きマイクログレイン、" +
      "ビニールの塵。各レーンの場のプローブで |ψ|² が満ちると、その粒子が散布されます（量子ゲート）。" +
      "メロディもベースも無く、温かいテープの回路を漂う塵だけ。\n\n" +
      "キャンバスをクリックするとψが収縮して粒子が散ります。ドラッグでポテンシャルを掘る（Shiftで盛る）。" +
      "Spaceで再生、Rで場リセット、Fで変性ループ凍結。",
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
