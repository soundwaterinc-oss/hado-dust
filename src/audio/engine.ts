// engine.ts — warm particle graph (Jelinek dust). No drums/bass/synth: only particles,
// run through tape-ish wow/flutter → saturation → moving lowpass → dub delay + plate.
//   particles ─► wow ─► sat ─► lowpass ─┬─► dry ────────────┐
//                                       ├─► dub delay ──────┤─► limiter ─► analyser ─► out
//                                       └─► plate reverb ───┘
import type { HadoFeatures } from "../core/features";
import type { ParamState } from "../core/params";
import { ParticleKit } from "./particles";
import { Analyser } from "./analyser";

function satCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 1024, curve = new Float32Array(n), k = 1 + amount * 8;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return curve;
}

function warmIR(ctx: AudioContext, seconds: number): AudioBuffer {
  const rate = ctx.sampleRate, len = Math.max(1, Math.floor(seconds * rate));
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const white = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      lp += 0.35 * (white - lp); // lowpass the noise → warm, dark tail
      d[i] = lp;
    }
  }
  return buf;
}

export class AudioEngine {
  readonly ctx: AudioContext;
  readonly particles: ParticleKit;
  readonly analyser: Analyser;
  private master: GainNode;
  private wow: DelayNode;
  private wowLfo: OscillatorNode;
  private wowGain: GainNode;
  private sat: WaveShaperNode;
  private lp: BiquadFilterNode;
  private dubL: DelayNode;
  private dubR: DelayNode;
  private dubFbL: GainNode;
  private dubFbR: GainNode;
  private dubToneL: BiquadFilterNode;
  private dubToneR: BiquadFilterNode;
  private dubSend: GainNode;
  private convolver: ConvolverNode;
  private revSend: GainNode;
  private masterSum: GainNode;
  private limiter: DynamicsCompressorNode;
  private lastRev = -1;
  started = false;

  constructor() {
    this.ctx = new AudioContext({ sampleRate: 48000, latencyHint: "interactive" });
    const ctx = this.ctx;
    this.analyser = new Analyser(ctx);
    this.master = ctx.createGain(); this.master.gain.value = 0.9;
    this.masterSum = ctx.createGain();

    // wow/flutter — modulated short delay
    this.wow = ctx.createDelay(0.05); this.wow.delayTime.value = 0.006;
    this.wowLfo = ctx.createOscillator(); this.wowLfo.type = "sine"; this.wowLfo.frequency.value = 0.6;
    this.wowGain = ctx.createGain(); this.wowGain.gain.value = 0.0015;
    this.wowLfo.connect(this.wowGain); this.wowGain.connect(this.wow.delayTime); this.wowLfo.start();

    this.sat = ctx.createWaveShaper(); this.sat.curve = satCurve(0.3); this.sat.oversample = "2x";
    this.lp = ctx.createBiquadFilter(); this.lp.type = "lowpass"; this.lp.frequency.value = 6000; this.lp.Q.value = 0.5;

    // dub ping-pong delay with lowpassed feedback
    this.dubL = ctx.createDelay(2); this.dubR = ctx.createDelay(2);
    this.dubFbL = ctx.createGain(); this.dubFbR = ctx.createGain();
    this.dubToneL = ctx.createBiquadFilter(); this.dubToneL.type = "lowpass"; this.dubToneL.frequency.value = 1800;
    this.dubToneR = ctx.createBiquadFilter(); this.dubToneR.type = "lowpass"; this.dubToneR.frequency.value = 1800;
    const panL = ctx.createStereoPanner(); panL.pan.value = -0.7;
    const panR = ctx.createStereoPanner(); panR.pan.value = 0.7;
    this.dubSend = ctx.createGain();
    this.dubSend.connect(this.dubL);
    this.dubL.connect(this.dubToneL); this.dubToneL.connect(this.dubFbL); this.dubFbL.connect(this.dubR);
    this.dubR.connect(this.dubToneR); this.dubToneR.connect(this.dubFbR); this.dubFbR.connect(this.dubL);
    this.dubL.connect(panL); this.dubR.connect(panR);
    panL.connect(this.masterSum); panR.connect(this.masterSum);

    // plate
    this.convolver = ctx.createConvolver(); this.convolver.buffer = warmIR(ctx, 2);
    this.revSend = ctx.createGain();
    this.revSend.connect(this.convolver); this.convolver.connect(this.masterSum);

    // particle bus → wow → sat → lp → (dry + sends)
    const bus = ctx.createGain();
    bus.connect(this.wow); this.wow.connect(this.sat); this.sat.connect(this.lp);
    this.lp.connect(this.masterSum);      // dry
    this.lp.connect(this.dubSend);
    this.lp.connect(this.revSend);

    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.ratio.value = 20; this.limiter.threshold.value = -4;
    this.limiter.attack.value = 0.003; this.limiter.release.value = 0.2;
    this.masterSum.connect(this.limiter); this.limiter.connect(this.master);
    this.master.connect(this.analyser.input); this.analyser.input.connect(ctx.destination);

    this.particles = new ParticleKit(ctx, bus);
  }

  async resume(): Promise<void> {
    if (this.ctx.state !== "running") await this.ctx.resume();
    this.started = true;
  }
  get now(): number { return this.ctx.currentTime; }

  update(dt: number, features: HadoFeatures, p: ParamState, nowMs: number): void {
    if (!this.started) return;
    this.particles.modes = features.modes;
    this.sat.curve = satCurve(p.warmth as number);
    this.lp.frequency.setTargetAtTime(p.lowpass as number, this.now, 0.05);
    this.wowLfo.frequency.setTargetAtTime(p.wowRate as number, this.now, 0.1);
    this.wowGain.gain.setTargetAtTime((p.wowAmount as number) * 0.004, this.now, 0.1);
    const dubT = (p.dubTime as number) / 1000;
    this.dubL.delayTime.setTargetAtTime(dubT, this.now, 0.05);
    this.dubR.delayTime.setTargetAtTime(dubT, this.now, 0.05);
    this.dubFbL.gain.value = p.dubFb as number; this.dubFbR.gain.value = p.dubFb as number;
    this.dubToneL.frequency.value = p.dubTone as number; this.dubToneR.frequency.value = p.dubTone as number;
    this.dubSend.gain.value = p.dubMix as number;
    this.revSend.gain.value = p.reverbMix as number;
    const size = p.reverbSize as number;
    if (Math.abs(size - this.lastRev) > 0.05) { this.lastRev = size; this.convolver.buffer = warmIR(this.ctx, size); }

    // continuous field-driven crackle
    const flux01 = Math.min(1, features.analysis.flux * 0.5);
    this.particles.tickDust(dt, flux01, p);

    this.analyser.update(nowMs);
    features.analysis = this.analyser.out;
  }
}
