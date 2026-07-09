// particles.ts — the whole instrument is made of tiny particles (no melody, no bass).
// A selectable CHARACTER reshapes the synthesis of every particle:
//   DUST      — Jan Jelinek soft warm crackle (default)
//   MONOLAKE  — deep dub-techno: driven sub, softer/darker filtered clicks, FM-bell grains
//   IKEDA     — Ryoji Ikeda: pure sine pips + razor digital clicks, bright, precise
//   POLE      — heavily lowpassed, muffled clicks, vinyl crackle to the front
import type { ParamState } from "../core/params";
import type { ModeFeature } from "../core/features";

export type Particle = "sub" | "thud" | "click" | "tick" | "pop" | "grain" | "dust" | "hiss";
export const PARTICLES: Particle[] = ["sub", "thud", "click", "tick", "pop", "grain", "dust", "hiss"];
export const CHARACTERS = ["DUST", "MONOLAKE", "IKEDA", "POLE"] as const;
export type Character = typeof CHARACTERS[number];

interface CC {
  clickMul: number; clickQ: number; clickDecayMul: number; tickMul: number;
  pure: boolean; pips: boolean; grainFM: boolean; subDrive: number; lp: number; dustMul: number; kickDrive: number;
}
const CONFIGS: Record<Character, CC> = {
  DUST:     { clickMul: 1,   clickQ: 3,  clickDecayMul: 1,   tickMul: 1,   pure: false, pips: false, grainFM: false, subDrive: 0,    lp: 1,   dustMul: 1,   kickDrive: 0.3 },
  MONOLAKE: { clickMul: 0.7, clickQ: 6,  clickDecayMul: 1.5, tickMul: 0.8, pure: false, pips: false, grainFM: true,  subDrive: 0.35, lp: 0.7, dustMul: 0.7, kickDrive: 0.45 },
  IKEDA:    { clickMul: 1.7, clickQ: 14, clickDecayMul: 0.5, tickMul: 1.6, pure: true,  pips: true,  grainFM: false, subDrive: 0,    lp: 1.3, dustMul: 0.6, kickDrive: 0.7 },
  POLE:     { clickMul: 0.5, clickQ: 4,  clickDecayMul: 1.7, tickMul: 0.6, pure: false, pips: false, grainFM: false, subDrive: 0.15, lp: 0.5, dustMul: 1.7, kickDrive: 0.35 },
};

// tanh saturation curve for the gritty kick body
function kickCurve(drive: number): Float32Array<ArrayBuffer> {
  const n = 1024, c = new Float32Array(n), k = 1 + drive * 45;
  for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
  return c;
}

const LEVEL: Record<Particle, keyof ParamState> = {
  sub: "subLevel", thud: "thudLevel", click: "clickLevel", tick: "tickLevel",
  pop: "popLevel", grain: "grainLevel", dust: "dustLevel", hiss: "hissLevel",
};

export class ParticleKit {
  private noise: AudioBuffer;
  modes: ModeFeature[] = [];
  private cc: CC = CONFIGS.DUST;
  constructor(private ctx: AudioContext, private out: GainNode) {
    this.noise = this.makeNoise(1);
  }
  setCharacter(id: string): void { this.cc = CONFIGS[(id as Character)] ?? CONFIGS.DUST; }

  private makeNoise(sec: number): AudioBuffer {
    const len = Math.floor(this.ctx.sampleRate * sec);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  private noiseSrc(time: number, dur: number): AudioBufferSourceNode {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise; s.loop = true;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    s.start(time); s.stop(time + dur + 0.02);
    return s;
  }
  private grainEnv(time: number, dur: number, peak: number): GainNode {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(peak, time + dur * 0.4);
    g.gain.linearRampToValueAtTime(0, time + dur);
    return g;
  }
  private pluckEnv(time: number, dur: number, peak: number): GainNode {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(peak, time + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    return g;
  }
  private pan(p: number): StereoPannerNode {
    const n = this.ctx.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); return n;
  }

  trigger(lane: Particle, time: number, vel: number, p: ParamState, panPos = 0): void {
    const lvl = (p[LEVEL[lane]] as number) * vel;
    if (lvl <= 0.001) return;
    switch (lane) {
      case "sub": return this.sub(time, lvl, p, panPos);
      case "thud": return this.thud(time, lvl, p, panPos);
      case "click": return this.click(time, lvl, p, panPos);
      case "tick": return this.tick(time, lvl, panPos);
      case "pop": return this.pop(time, lvl, panPos);
      case "grain": return this.grain(time, lvl, p, panPos);
      case "dust": return this.dust(time, lvl, panPos);
      case "hiss": return this.hiss(time, lvl, p, panPos);
    }
  }

  private sub(time: number, lvl: number, p: ParamState, pan: number): void {
    const ctx = this.ctx;
    const osc = ctx.createOscillator(); osc.type = "sine";
    const f = p.subTune as number;
    osc.frequency.setValueAtTime(f * 1.6, time);
    osc.frequency.exponentialRampToValueAtTime(f, time + 0.05);
    const dur = 0.09 + (p.grainSize as number) / 900;
    const g = this.pluckEnv(time, dur, lvl);
    const pn = this.pan(pan * 0.3);
    osc.connect(g); g.connect(pn); pn.connect(this.out);
    osc.start(time); osc.stop(time + dur + 0.05);
    if (this.cc.subDrive > 0) { // add a soft 2nd partial for dub weight
      const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = f * 2;
      const g2 = this.pluckEnv(time, dur * 0.8, lvl * this.cc.subDrive);
      o2.connect(g2); g2.connect(pn); o2.start(time); o2.stop(time + dur + 0.05);
    }
  }

  // the kick of the machine — punchy, gritty, physical (Ikeda-ish): deep sine with a fast
  // pitch drop through a saturation shaper + a mid thwack + a razor high click.
  private thud(time: number, lvl: number, p: ParamState, pan: number): void {
    const ctx = this.ctx;
    const cc = this.cc;
    const f = p.subTune as number;
    const pn = this.pan(pan * 0.3);
    // body
    const osc = ctx.createOscillator(); osc.type = "sine";
    osc.frequency.setValueAtTime(f * 6, time);
    osc.frequency.exponentialRampToValueAtTime(f, time + 0.04);
    const shaper = ctx.createWaveShaper(); shaper.curve = kickCurve(cc.kickDrive); shaper.oversample = "2x";
    const g = this.pluckEnv(time, 0.17, lvl);
    osc.connect(shaper); shaper.connect(g); g.connect(pn);
    osc.start(time); osc.stop(time + 0.22);
    // thwack transient
    const t2 = ctx.createOscillator(); t2.type = "triangle";
    t2.frequency.setValueAtTime(f * 11, time);
    t2.frequency.exponentialRampToValueAtTime(f * 2, time + 0.014);
    const tg = this.pluckEnv(time, 0.02, lvl * 0.65);
    t2.connect(tg); tg.connect(pn); t2.start(time); t2.stop(time + 0.05);
    // razor click
    const nz = this.noiseSrc(time, 0.006);
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2600 * cc.lp;
    const ng = this.pluckEnv(time, 0.006, lvl * (0.3 + 0.5 * cc.kickDrive));
    nz.connect(hp); hp.connect(ng); ng.connect(pn);
    pn.connect(this.out);
  }

  private click(time: number, lvl: number, p: ParamState, pan: number): void {
    const ctx = this.ctx;
    const cc = this.cc;
    const dur = (0.004 + Math.random() * 0.006) * cc.clickDecayMul;
    const freq = (p.clickTone as number) * cc.clickMul * (0.85 + Math.random() * 0.3);
    const pn = this.pan(pan);
    if (cc.pure) { // Ikeda: pure sine pip
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const g = this.pluckEnv(time, dur, lvl);
      osc.connect(g); g.connect(pn); pn.connect(this.out); osc.start(time); osc.stop(time + dur + 0.02);
    } else {
      const nz = this.noiseSrc(time, dur);
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq * cc.lp; bp.Q.value = cc.clickQ;
      const g = this.pluckEnv(time, dur, lvl);
      nz.connect(bp); bp.connect(g); g.connect(pn); pn.connect(this.out);
    }
    if (cc.pips) { // add a high sine ping
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 4000 + Math.random() * 4500;
      const g = this.pluckEnv(time, 0.006, lvl * 0.4);
      o.connect(g); g.connect(pn); o.start(time); o.stop(time + 0.02);
    }
  }

  private tick(time: number, lvl: number, pan: number): void {
    const ctx = this.ctx;
    const cc = this.cc;
    const dur = (0.003 + Math.random() * 0.004) * cc.clickDecayMul;
    const freq = (900 + Math.random() * 500) * cc.tickMul;
    const pn = this.pan(pan);
    if (cc.pure) {
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
      const g = this.pluckEnv(time, dur, lvl * 0.8);
      osc.connect(g); g.connect(pn); pn.connect(this.out); osc.start(time); osc.stop(time + dur + 0.02);
    } else {
      const nz = this.noiseSrc(time, dur);
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq * cc.lp; bp.Q.value = cc.clickQ + 2;
      const g = this.pluckEnv(time, dur, lvl * 0.8);
      nz.connect(bp); bp.connect(g); g.connect(pn); pn.connect(this.out);
    }
  }

  private pop(time: number, lvl: number, pan: number): void {
    const ctx = this.ctx;
    const osc = ctx.createOscillator(); osc.type = "sine";
    const f = (220 + Math.random() * 200) * this.cc.tickMul;
    osc.frequency.setValueAtTime(f * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(f, time + 0.02);
    const g = this.pluckEnv(time, 0.04, lvl * 0.6);
    const pn = this.pan(pan);
    osc.connect(g); g.connect(pn); pn.connect(this.out);
    osc.start(time); osc.stop(time + 0.06);
  }

  private grain(time: number, lvl: number, p: ParamState, pan: number): void {
    const ctx = this.ctx;
    const dur = (p.grainSize as number) / 1000;
    const jitter = p.grainJitter as number;
    const m = this.modes.length ? this.modes[Math.floor(Math.random() * Math.min(this.modes.length, 4))] : null;
    const base = m ? m.f : (p.fRoot as number) * 2;
    const oct = Math.pow(2, Math.round(p.grainSpread as number));
    const detune = 1 + (Math.random() * 2 - 1) * 0.05 * jitter;
    const freq = Math.min(9000, base * oct * detune);
    const g = this.grainEnv(time, dur, lvl * 0.6);
    const pn = this.pan(pan);
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
    osc.connect(g);
    if (this.cc.grainFM) { // Monolake: FM bell tone
      const mod = ctx.createOscillator(); mod.frequency.value = freq * 2.76;
      const mg = ctx.createGain(); mg.gain.setValueAtTime(freq * 1.5, time); mg.gain.exponentialRampToValueAtTime(freq * 0.2, time + dur);
      mod.connect(mg); mg.connect(osc.frequency); mod.start(time); mod.stop(time + dur + 0.02);
    }
    g.connect(pn); pn.connect(this.out); osc.start(time); osc.stop(time + dur + 0.02);
  }

  private dust(time: number, lvl: number, pan: number): void {
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const t = time + Math.random() * 0.03;
      const dur = 0.002 + Math.random() * 0.003;
      const nz = this.noiseSrc(t, dur);
      const hp = this.ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500 * this.cc.lp;
      const g = this.pluckEnv(t, dur, lvl * (0.3 + Math.random() * 0.5) * this.cc.dustMul);
      const pn = this.pan(pan + (Math.random() * 2 - 1) * 0.5);
      nz.connect(hp); hp.connect(g); g.connect(pn); pn.connect(this.out);
    }
  }

  private hiss(time: number, lvl: number, p: ParamState, pan: number): void {
    const ctx = this.ctx;
    const dur = 0.05 + (p.grainSize as number) / 500;
    const nz = this.noiseSrc(time, dur);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.setValueAtTime(3000 * this.cc.lp, time);
    bp.frequency.exponentialRampToValueAtTime(6000 * this.cc.lp, time + dur);
    bp.Q.value = 1.5;
    const g = this.grainEnv(time, dur, lvl * 0.4);
    const pn = this.pan(pan * 0.6);
    nz.connect(bp); bp.connect(g); g.connect(pn); pn.connect(this.out);
  }

  tickDust(dt: number, flux01: number, p: ParamState): void {
    const rate = (p.dustField as number) * (0.4 + flux01 * 4) * this.cc.dustMul;
    if (rate <= 0) return;
    if (Math.random() < rate * dt) {
      this.dust(this.ctx.currentTime, (p.dustLevel as number) * 0.6, (Math.random() * 2 - 1) * 0.8);
    }
  }
}
