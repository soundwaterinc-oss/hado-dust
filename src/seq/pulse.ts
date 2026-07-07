// pulse.ts — lookahead-scheduled particle sequencer. One 16-step lane per particle type.
// Triggers combine the manual grid with the quantum gate (|ψ|² ≥ gateThresh at the lane's
// field probe). Heavy swing + humanize give the shuffling, dusty micro-house feel.
import { PARTICLES, type Particle } from "../audio/particles";
import type { ParamState } from "../core/params";

export const ROWS: Particle[] = [...PARTICLES];

export interface PulseDeps {
  now: () => number;
  triggerParticle: (lane: Particle, time: number, vel: number) => void;
  probeMag: (row: number) => number;
  onStep: (step: number, time: number) => void;
}

export class PulseSequencer {
  steps: boolean[][] = ROWS.map(() => Array(16).fill(false));
  prob: number[][] = ROWS.map(() => Array(16).fill(1));
  running = false;
  step = 0;
  lookahead = 0.3;
  private nextTime = 0;

  constructor(private deps: PulseDeps) {
    this.loadDefaultPattern();
  }

  private loadDefaultPattern(): void {
    const set = (row: number, idxs: number[]): void => idxs.forEach((i) => (this.steps[row][i] = true));
    set(0, [0, 6, 10]);              // sub — loose pulse
    set(1, [4, 12]);                 // thud
    set(2, [2, 6, 10, 14]);          // click — offbeats
    set(3, [3, 7, 11, 15]);          // tick — shuffle
    set(4, [5, 13]);                 // pop
    set(5, [1, 4, 7, 9, 12, 15]);    // grain — pointillist
    set(6, [0, 8]);                  // dust
    set(7, [7]);                     // hiss
  }

  toggle(on?: boolean): void {
    this.running = on ?? !this.running;
    if (this.running) { this.step = 0; this.nextTime = this.deps.now() + 0.08; }
  }
  clearRow(row: number): void { this.steps[row].fill(false); }

  schedule(p: ParamState): void {
    if (!this.running) return;
    const now = this.deps.now();
    const sec16 = 60 / (p.bpm as number) / 4;
    while (this.nextTime < now + this.lookahead) {
      this.fire(this.step, this.nextTime, p, sec16);
      this.nextTime += sec16;
      this.step = (this.step + 1) % 16;
    }
  }

  private fire(step: number, baseTime: number, p: ParamState, sec16: number): void {
    const swing = (step % 2 === 1) ? (p.swing as number) * sec16 * 0.66 : 0;
    const mode = p.gateMode as string;
    const thresh = p.gateThresh as number;
    const density = p.patternDensity as number;
    const accent = p.accentAmt as number;
    this.deps.onStep(step, baseTime);

    for (let r = 0; r < ROWS.length; r++) {
      const mag = this.deps.probeMag(r);
      const manual = this.steps[r][step] && Math.random() < this.prob[r][step];
      const gate = mag >= thresh;
      const quantum = gate && Math.random() < density;
      let hit = false;
      switch (mode) {
        case "MANUAL": hit = manual; break;
        case "QUANTUM": hit = quantum; break;
        case "AND": hit = manual && gate; break;
        case "OR": hit = manual || quantum; break;
      }
      if (!hit) continue;
      // per-particle humanize (heavier than a drum machine → dusty feel)
      const human = (Math.random() * 2 - 1) * (p.humanize as number);
      const vel = Math.min(1, 0.5 + accent * mag);
      this.deps.triggerParticle(ROWS[r], baseTime + swing + human, vel);
    }
  }
}
