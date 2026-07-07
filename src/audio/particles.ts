// particles.ts — the whole instrument is made of tiny particles (no melody, no bass).
// Jan Jelinek-style dust: soft sub thuds, filtered clicks, pitched micro-grains from the
// eigen-spectrum, vinyl crackle. Every voice is a short-lived scheduled grain.
import type { ParamState } from "../core/params";
import type { ModeFeature } from "../core/features";

export type Particle = "sub" | "thud" | "click" | "tick" | "pop" | "grain" | "dust" | "hiss";
export const PARTICLES: Particle[] = ["sub", "thud", "click", "tick", "pop", "grain", "dust", "hiss"];

const LEVEL: Record<Particle, keyof ParamState> = {
  sub: "subLevel", thud: "thudLevel", click: "clickLevel", tick: "tickLevel",
  pop: "popLevel", grain: "grainLevel", dust: "dustLevel", hiss: "hissLevel",
};

export class ParticleKit {
  private noise: AudioBuffer;
  modes: ModeFeature[] = [];
  constructor(private ctx: AudioContext, private out: GainNode) {
    this.noise = this.makeNoise(1);
  }

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

  // Hann-ish window via linear ramps (soft, click-free).
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
  }

  private thud(time: number, lvl: number, p: ParamState, pan: number): void {
    const ctx = this.ctx;
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = (p.subTune as number) * 1.8;
    const g = this.pluckEnv(time, 0.12, lvl * 0.8);
    const nz = this.noiseSrc(time, 0.04);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
    const ng = this.pluckEnv(time, 0.04, lvl * 0.5);
    const pn = this.pan(pan * 0.4);
    osc.connect(g); nz.connect(lp); lp.connect(ng);
    g.connect(pn); ng.connect(pn); pn.connect(this.out);
    osc.start(time); osc.stop(time + 0.16);
  }

  private click(time: number, lvl: number, p: ParamState, pan: number): void {
    const ctx = this.ctx;
    const dur = 0.004 + Math.random() * 0.006;
    const nz = this.noiseSrc(time, dur);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.value = (p.clickTone as number) * (0.8 + Math.random() * 0.4); bp.Q.value = 3;
    const g = this.pluckEnv(time, dur, lvl);
    const pn = this.pan(pan);
    nz.connect(bp); bp.connect(g); g.connect(pn); pn.connect(this.out);
  }

  private tick(time: number, lvl: number, pan: number): void {
    const ctx = this.ctx;
    const dur = 0.003 + Math.random() * 0.004;
    const nz = this.noiseSrc(time, dur);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.value = 900 + Math.random() * 500; bp.Q.value = 5;
    const g = this.pluckEnv(time, dur, lvl * 0.8);
    const pn = this.pan(pan);
    nz.connect(bp); bp.connect(g); g.connect(pn); pn.connect(this.out);
  }

  private pop(time: number, lvl: number, pan: number): void {
    const ctx = this.ctx;
    const osc = ctx.createOscillator(); osc.type = "sine";
    const f = 220 + Math.random() * 200;
    osc.frequency.setValueAtTime(f * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(f, time + 0.02);
    const g = this.pluckEnv(time, 0.04, lvl * 0.6);
    const pn = this.pan(pan);
    osc.connect(g); g.connect(pn); pn.connect(this.out);
    osc.start(time); osc.stop(time + 0.06);
  }

  // pitched micro-grain drawn from the eigen-spectrum (percussive, pointillist)
  private grain(time: number, lvl: number, p: ParamState, pan: number): void {
    const ctx = this.ctx;
    const dur = (p.grainSize as number) / 1000;
    const jitter = p.grainJitter as number;
    const m = this.modes.length
      ? this.modes[Math.floor(Math.random() * Math.min(this.modes.length, 4))]
      : null;
    const base = m ? m.f : (p.fRoot as number) * 2;
    const oct = Math.pow(2, Math.round(p.grainSpread as number));
    const detune = 1 + (Math.random() * 2 - 1) * 0.05 * jitter;
    const freq = Math.min(9000, base * oct * detune);
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = freq;
    const g = this.grainEnv(time, dur, lvl * 0.6);
    const pn = this.pan(pan);
    osc.connect(g); g.connect(pn); pn.connect(this.out);
    osc.start(time); osc.stop(time + dur + 0.02);
  }

  // vinyl crackle: a tiny cluster of impulses
  private dust(time: number, lvl: number, pan: number): void {
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const t = time + Math.random() * 0.03;
      const dur = 0.002 + Math.random() * 0.003;
      const nz = this.noiseSrc(t, dur);
      const hp = this.ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500;
      const g = this.pluckEnv(t, dur, lvl * (0.3 + Math.random() * 0.5));
      const pn = this.pan(pan + (Math.random() * 2 - 1) * 0.5);
      nz.connect(hp); hp.connect(g); g.connect(pn); pn.connect(this.out);
    }
  }

  private hiss(time: number, lvl: number, p: ParamState, pan: number): void {
    const ctx = this.ctx;
    const dur = 0.05 + (p.grainSize as number) / 500;
    const nz = this.noiseSrc(time, dur);
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.setValueAtTime(3000, time);
    bp.frequency.exponentialRampToValueAtTime(6000, time + dur);
    bp.Q.value = 1.5;
    const g = this.grainEnv(time, dur, lvl * 0.4);
    const pn = this.pan(pan * 0.6);
    nz.connect(bp); bp.connect(g); g.connect(pn); pn.connect(this.out);
  }

  // continuous background crackle, rate scaled by field flux (called each logic frame)
  tickDust(dt: number, flux01: number, p: ParamState): void {
    const rate = (p.dustField as number) * (0.4 + flux01 * 4); // particles/sec
    if (rate <= 0) return;
    if (Math.random() < rate * dt) {
      this.dust(this.ctx.currentTime, (p.dustLevel as number) * 0.6, (Math.random() * 2 - 1) * 0.8);
    }
  }
}
