// main.ts — HADŌ DUST startup + loops. The quantum field is expressed purely as particle
// rhythm: |ψ|² gates dust/click/grain particles on a shuffling grid. No melody, no bass.
import "./ui/style.css";
import { defaultState, defaultSettings, type ParamName } from "./core/params";
import { features } from "./core/features";
import {
  BUILTIN_PRESETS, loadUserPresets, saveUserPreset, applyPreset,
  exportJSON, importJSON,
} from "./core/preset";
import { QuantumField } from "./field/schrodinger";
import { Probes } from "./field/probes";
import { Spectrum } from "./field/spectrum";
import { Potential } from "./geometry/potential";
import { AudioEngine } from "./audio/engine";
import { Mutator } from "./feedback/mutate";
import { MidiOut } from "./io/midi";
import { TdBridge } from "./io/tdBridge";
import { DustUI, type UIHooks } from "./ui/layout";
import { PulseSequencer, ROWS } from "./seq/pulse";
import type { Particle } from "./audio/particles";

const state = defaultState();
const settings = defaultSettings();

let field: QuantumField;
let potential: Potential;
let fieldMax = 1e-6;
const spectrum = new Spectrum();
const probes = new Probes();
const audio = new AudioEngine();
const mutator = new Mutator();
const midi = new MidiOut();
const td = new TdBridge();

// particle lane → field sampling point (golden-angle spread) for quantum gating + pan
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const lanePts = ROWS.map((_, k) => {
  const r = 0.4 * Math.sqrt((k + 0.5) / ROWS.length);
  const a = k * GOLDEN;
  return { x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) };
});
function laneMag(row: number): number {
  return Math.min(1, field.sampleMag(lanePts[row].x, lanePts[row].y) / fieldMax);
}
function panForLane(lane: Particle): number {
  return (lanePts[ROWS.indexOf(lane)].x - 0.5) * 2;
}

function rebakeGeometry(): void { field.uploadV(potential.bake(state)); }

// ── sequencer deps ────────────────────────────────────────────────────
const seq = new PulseSequencer({
  now: () => audio.now,
  triggerParticle: (lane, time, vel) => audio.particles.trigger(lane, time, vel, state, panForLane(lane)),
  probeMag: (row) => laneMag(row),
  onStep: (step, time) => {
    const delay = Math.max(0, (time - audio.now) * 1000);
    window.setTimeout(() => ui.setStepCursor(step), delay);
  },
});

// ── UI hooks ──────────────────────────────────────────────────────────
const GEO_PARAMS = new Set<ParamName>([
  "geoMode", "geoModeA", "geoModeB", "seedCount", "angleOffset", "wellDepth", "wellRadius",
  "lsysIterations", "branchAngle", "lsysSeed", "cellCount", "relax", "wallWidth",
  "wallHeight", "geoMix",
]);

// canvas click = collapse ψ + scatter a little burst of particles at that point
function scatter(x: number, y: number): void {
  void audio.resume();
  field.collapse(x, y, 0.05);
  const t = audio.now;
  const pan = (x - 0.5) * 2;
  const burst: Particle[] = ["grain", "click", "pop", "dust"];
  burst.forEach((lane, i) => audio.particles.trigger(lane, t + i * 0.012, 0.8, state, pan));
  features.collapse = { x, y, localV: 0, nearestMode: 0 };
  td.sendEvent("collapse", { x, y, pitch: 0, vel: 0.8 });
}

const hooks: UIHooks = {
  onParamChange: (name) => { if (GEO_PARAMS.has(name)) rebakeGeometry(); },
  onObserve: (x, y) => scatter(x, y),
  onBrush: (x, y, raise) => {
    potential.brush.paint(x, y, state.brushRadius as number, state.brushDepth as number, raise);
    rebakeGeometry();
  },
  onReset: () => { field.reset(state); spectrum.snapshot(field); },
  onTogglePlay: () => { void audio.resume(); seq.toggle(); ui.setPlaying(seq.running); },
  presetSave: (n) => saveUserPreset(n, state),
  presetLoad: (n) => {
    const all = [...BUILTIN_PRESETS, ...loadUserPresets()];
    const p = all.find((x) => x.name === n);
    if (!p) return;
    Object.assign(state, applyPreset(p));
    ui.refreshAll(); rebakeGeometry();
  },
  presetList: () => [...BUILTIN_PRESETS, ...loadUserPresets()].map((p) => p.name),
  exportJSON: () => {
    const blob = new Blob([exportJSON(state)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "hado-dust.json"; a.click();
  },
  importJSON: (text) => {
    try { Object.assign(state, importJSON(text)); ui.refreshAll(); rebakeGeometry(); }
    catch { ui.setWarn("import failed"); }
  },
  midiEnable: () => { void midi.enable(); },
  midiSelect: (id) => midi.select(id),
  midiDevices: () => midi.devices,
  tdConnect: (url) => { settings.wsUrl = url; td.connect(url); },
  tdDisconnect: () => td.disconnect(),
};

const root = document.getElementById("app")!;
const ui = new DustUI(root, state, seq, hooks);

field = new QuantumField(ui.canvas, settings.gridSize);
potential = new Potential(field.gridSize);
rebakeGeometry();
field.reset(state);
spectrum.snapshot(field);
probes.layout(12);

mutator.onRebake = () => rebakeGeometry();
mutator.onWarn = (m) => ui.setWarn(m);
td.onStatus = (s) => ui.setTdStatus(`TD: ${s}`, s === "open" ? "ok" : s === "error" ? "err" : "");

const wake = (): void => { void audio.resume(); };
window.addEventListener("pointerdown", wake, { once: true });
window.addEventListener("keydown", wake, { once: true });
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); void audio.resume(); seq.toggle(); ui.setPlaying(seq.running); }
  else if (e.key === "r" || e.key === "R") { field.reset(state); spectrum.snapshot(field); }
  else if (e.key === "f" || e.key === "F") { state.freeze = !(state.freeze as boolean); ui.refreshAll(); }
});

function resize(): void {
  const stage = ui.canvas.parentElement!;
  const px = Math.max(64, Math.min(stage.clientWidth, stage.clientHeight) - 8);
  ui.canvas.style.width = px + "px";
  ui.canvas.style.height = px + "px";
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  ui.canvas.width = Math.floor(px * dpr);
  ui.canvas.height = Math.floor(px * dpr);
}
window.addEventListener("resize", resize);
resize();

// ── background-resilient logic loop (Web Worker metronome; rAF only renders) ──
const workerSrc =
  "let ms=16,t=null;onmessage=e=>{const d=e.data;" +
  "if(d.cmd==='config')ms=d.ms;" +
  "else if(d.cmd==='next')t=setTimeout(()=>postMessage(0),ms);" +
  "else if(d.cmd==='stop'){clearTimeout(t);t=null;}};";
const clockWorker = new Worker(URL.createObjectURL(new Blob([workerSrc], { type: "application/javascript" })));

let lastLogic = performance.now();
function logic(): void {
  const now = performance.now();
  let dt = (now - lastLogic) / 1000;
  lastLogic = now;
  dt = Math.min(0.5, dt);
  const frames = Math.max(1, Math.min(4, Math.round(dt / 0.016)));
  for (let k = 0; k < frames; k++) {
    field.step(state, potential.vmax);
    spectrum.accumulate(field);
  }
  features.t = now / 1000;
  features.modes = spectrum.update(now, state.modeCount as number, state.fRoot as number, state.warp as number);
  probes.sample(field, features.probes);

  let mx = 1e-6;
  const d = field.reducedData;
  for (let i = 0; i < d.length; i += 4) if (d[i] > mx) mx = d[i];
  fieldMax = mx;

  seq.schedule(state);
  audio.update(dt, features, state, now);
  mutator.update(dt, features.analysis, state);
  midi.sendCC(features, state, now);
  td.sendState(features, state, now);
  td.sendField(field.reducedData, state, now);
}
clockWorker.onmessage = () => {
  try { logic(); } catch (err) { console.error(err); }
  clockWorker.postMessage({ cmd: "next" });
};
clockWorker.postMessage({ cmd: "next" });
document.addEventListener("visibilitychange", () => {
  seq.lookahead = document.hidden ? 1.4 : 0.3;
  clockWorker.postMessage({ cmd: "config", ms: document.hidden ? 80 : 16 });
});

// ── render loop ────────────────────────────────────────────────────────
function frame(): void {
  field.render(state, ui.canvas.width, ui.canvas.height);
  ui.setMeter(features.analysis.rms);
  ui.setHud(`${field.gridSize}² · ${state.gateMode} · ${seq.running ? "▶" : "■"}${state.freeze ? " · FROZEN" : ""}`);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
