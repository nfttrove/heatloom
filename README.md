# Heat Loom

**heatloom.com** — a concept site for a DIY concentrating solar-thermal system:
mirror area in, stored heat in sand, electricity out via a small ORC.

What makes this repo slightly unusual for a product site: the engineering
numbers are **extracted, tested code**, not marketing copy.

## The engineering module

All configurator/ROI math lives in `src/utils/heatloom.ts` (pure functions,
assumptions stated as constants, tested in `heatloom.test.ts`):

- **Loss chain** — optics 0.88 × soiling 0.96 × receiver 0.93 × storage 0.90
  × pipework 0.85 ≈ **0.60 collector efficiency**. The site's headline
  number is a product you can audit, stage by stage.
- **Seasonal honesty** — DNI is an annual average; December runs ≈ 0.3× and
  high summer ≈ 1.6×. Every recommendation ships with its winter number,
  and the "Dark December" sizing mode sizes for the worst month.
- **Savings you can actually bank** — winter days are capped at winter
  output, so the £/year figure is always ≤ the naive calculation, never
  above it.
- **Pessimistic band** — −10% sun × low-end efficiency (0.55) shown beside
  every central estimate.
- **Hybrid mode** — the configuration we'd actually bet money on: bought PV
  for electricity, collector + sand store for heat, ORC deleted. Coverage
  shown annual *and* December, savings coverage-capped, sand costed at
  ~£10/kWh·th vs ~£300/kWh for lithium. Its default-plan claim is
  pre-registered in the In Fini claim registry.

## Site narrative

The site sells what survived scrutiny: **seasonal heat storage** (the sand
battery) plus the **Hybrid** (collector + sand + bought PV). The original
ORC electricity stage became ["Why we deleted our own
turbine"](src/components/WhyNoTurbine.tsx) — a Carnot explainer — and both
performance claims are displayed with their registry hashes in
[OnTrial](src/components/OnTrial.tsx).

## Honesty policy

The sibling project [in-fini](https://github.com/nfttrove/in-fini) puts
extraordinary claims on trial with artifact budgets and error bars. Heat
Loom makes a claim, so it volunteers for the same treatment: publish the
losses, the seasonal shortfall, and the pessimistic case before anyone
asks. Planned next: a field-performance registry where builders file
measured yields against these predictions.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # vitest — the engineering module
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # production build
```

CI (GitHub Actions) runs typecheck, lint, tests, and a production build
whose bundle is grepped for the shipped UI on every push to `main`.

## License

MIT — see [LICENSE](LICENSE).
