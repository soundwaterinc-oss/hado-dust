# HADŌ DUST / 波動塵

A particle-beat sibling of [HADŌ](https://github.com/soundwaterinc-oss/hado-field) /
[HADŌ BEAT](https://github.com/soundwaterinc-oss/hado-beat) — the quantum field expressed
**purely as rhythm made of particles**. No melody, no bass, no synth lead: just soft sub
thuds, filtered clicks, pitched micro-grains and vinyl crackle, dust drifting through a
warm tape-ish chain. Jan Jelinek-flavoured micro-house from a Schrödinger field.

The same WebGL2 wavefield (植物ポテンシャル: phyllotaxis / L-system / Voronoi) drives a
lookahead-scheduled particle sequencer. Each particle lane samples `|ψ|²` at a field probe;
when the wavefunction floods that probe the particle scatters. The eigen-spectrum tunes the
pitched grains. Superposition → dust → groove.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite → dist/
```

Latest desktop **Chrome / Edge** (WebGL2 + `EXT_color_buffer_float`, Web Audio). Click or
press Space to start.

## Play

- **Space** — play / stop. **click canvas** — collapse ψ + scatter a burst of particles.
- **Drag** — brush the potential (dig); **Shift+drag** — raise walls; **R** reset; **F** freeze.
- **Particle grid** — 8 lanes (sub · thud · click · tick · pop · grain · dust · hiss) × 16.
  Click toggles; long-press cycles step probability.
- Tabs **GEO / FIELD / GROOVE / TEXTURE / MUTATE / IO**; knobs vertical-drag, double-click resets.
- Presets: Dust / Dub / Static + save/export/import.
- **EN / 日本語** toggle (top-right); keeps playing in the background (Web Worker clock).

## Gate modes

Each step a lane may fire from the **manual grid** and/or the **quantum gate** (`|ψ|²` at
its probe ≥ `gateThresh`): **MANUAL** grid-only · **QUANTUM** field-only (the wavefunction
plays the dust) · **AND** tight · **OR** busy. `accent amt` maps `|ψ|²` to velocity; heavy
`swing` + `humanize` give the shuffling, dusty feel; `dust field` sprinkles continuous
crackle whose rate follows spectral flux.

## Particles & warmth

- **sub / thud** — soft rounded low pulses (windowed sine, not a techno kick).
- **click / tick** — 3–8 ms band-passed noise impulses.
- **pop** — short sine pips. **grain** — pitched micro-grains from the eigen-spectrum.
- **dust** — vinyl crackle clusters (also a continuous field-driven layer). **hiss** — noise swells.
- Master: wow/flutter → soft saturation → moving lowpass → dub ping-pong delay + warm plate → limiter.

## Architecture

Reuses HADŌ's `core/features.ts` seam: `audio/` and `seq/` never import `field/` or
`geometry/`; the sequencer receives field access as injected callbacks. Field simulation,
sequencer and audio run off a Web Worker metronome so the beat and field keep evolving when
the tab is hidden. MUTATE feedback and the dormant TouchDesigner bridge carry over from HADŌ.
