# Heat Loom

**heatloom.com** — an open-source DIY build: solar panels that power your
home first, and a small controller (the "loom") that sends every spare unit
into your hot-water tank instead of exporting it for nothing. Evacuated solar
tubes on the same tank are an optional add-on.

The default build (4 kWp of panels plus the DIY loom, on an existing
cylinder) is about £2,320 in parts and saves about £500 a year against gas
at October 2026 prices: a payback of under five years. The loom's hardware
is specified; its firmware is not yet published (the open-source Mk2 PV
Router and bought diverters do the same job meanwhile).

Every figure on the site is computed from a tested model, not typed into
the copy.

## The engineering module

All math lives in `src/utils/heatloom.ts` (pure functions, assumptions
stated as constants, tested in `heatloom.test.ts`):

- **The loom build** (`loomPlan`) — month by month: the house uses its
  share of the panels' output, tubes (if any) heat the tank first, the loom
  sends spare output into the tank up to the day's hot-water demand and the
  tank's size (90% reaching the tap), and the rest is exported unpaid. Every
  kWh is accounted for; savings value house electricity at the Ofgem cap
  and hot water at what heats it now.

- **Two loss chains** — the research rig's troughs: optics 0.88 × soiling
  0.96 × receiver 0.93 × storage 0.90 × pipework 0.85 ≈ **0.60**. The
  Hybrid's evacuated tubes have no mirror stage: optics 0.70 × heat loss
  0.75 × soiling 0.96 × storage 0.90 × pipework 0.85 ≈ **0.39** of global
  sunlight on the tilt.
- **Store mass by temperature swing** — kg per kWh = 3600 / (c<sub>p</sub> × ΔT).
  The rig's sand, 400 K swing: 11 kg/kWh. The Hybrid's water, 85 → 45 °C:
  21.5 kg/kWh; sand doing the same job (given the tubes' full 120 °C) would
  need 60.
- **Standing loss** — τ = C / UA for an insulated cylinder (and twice the
  U for the rig's hot store, since mineral wool conducts about twice as well
  at 250–420 °C). With the same insulation, water keeps the Hybrid's useful
  heat about **twice as long as sand** (a full 12 kWh tank: ~7 days to lose
  half, against ~3 for sand): about 2.8 times the heat per kg over these
  swings means a smaller
  vessel with less surface, run cooler. Either holds **days, not seasons**, so
  no month uses more heat than it collects, and a day's heat is capped at
  what the store holds.
- **Monthly shapes** — sunshine (December ≈ 0.3×, midsummer ≈ 1.6×) and
  heat demand (hot water plus heating degree days) replace a single winter
  factor.
- **Savings you can actually bank** — PV counts only the share used at home
  (50% by default; a DIY install earns no export payment), heat counts only
  what meets each month's demand, valued at what it displaces (gas by
  default; oil, heat pump or direct electric are options). Prices are
  sourced: Ofgem's October–December 2026 cap for electricity and gas, a
  September 2026 kerosene average for oil.
- **Pessimistic case** — −10% sun and the low end of each efficiency band,
  shown beside every central estimate. Costs are not varied. The water
  store is priced from 250 L twin-coil solar cylinders (£75/kWh of useful
  heat; an unvented one needs a G3-qualified installer, not priced), and each
  store is sized to about two days of its collector's best month.
- **Rig costs from its own bill of materials** — the retired rig is priced
  from the Build Guide's parts list, not a guessed £/m².
- **Toy balances** (a heat-flow step and a rig day) from earlier animated
  panels remain in the module, tested to conserve energy.

## Site sections

Hero · How it works (diagram, why a tank) · The build (parts list, steps,
tubes add-on) · Your numbers (calculator) · Safety · How we got these
numbers · Open source. Earlier designs — the concentrating research rig with
a sand store and an ORC turbine, and the tubes-plus-store "Hybrid" — remain
in the model (and its tests) because the In Fini registry's filed claims
were computed from them; they are no longer on the page.

## Honesty policy

The sibling project [in-fini](https://github.com/nfttrove/in-fini) puts
extraordinary claims on trial with artifact budgets and error bars. Heat
Loom makes a claim, so it volunteers for the same treatment: publish the
losses, the seasonal shortfall, and the pessimistic case before anyone
asks. Planned next: a measurement protocol, then a field-performance
registry where builders file measured yields against these predictions.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # vitest — the engineering module
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # production build
```

CI (GitHub Actions) runs typecheck, lint, tests (the engineering module, a
render guard over the whole page, and the build ID), and a production build
whose bundle is grepped for the shipped UI on every push to `main`.

The live site is published from Bolt, so merging here does not deploy it. To
catch a live site that has fallen behind, every build stamps
`<meta name="heatloom-build" content="…">` with a hash of the shipped source
(`scripts/build-id.mjs`, ported from in-fini: paths and contents of `src/`,
`public/`, the build config and tsconfig; tests excluded, line endings normalised,
dependency versions deliberately not included). The scheduled `live-drift`
workflow compares heatloom.com's stamp with `main` daily and fails, which
emails the repo owner, when they differ. Run it on demand from the Actions
tab after publishing.

## License

MIT — see [LICENSE](LICENSE).
