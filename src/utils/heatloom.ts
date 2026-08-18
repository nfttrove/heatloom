/**
 * Heat Loom's engineering math, extracted from the marketing.
 *
 * Everything the Configurator, Theory and Performance panels claim lives
 * here as pure functions with the assumptions stated. The numbers are
 * deliberately conservative and cross-check against the site's copy:
 * collector efficiency 0.55–0.60 (the loss chain below multiplies to
 * ≈ 0.60), ORC conversion 18%, 11.25 kg of sand per thermal kWh (the
 * 11.5 that used to live inline in the Configurator was a typo that
 * survived because nothing tested it).
 *
 * The honesty policy mirrors our other project: every headline number
 * ships with its seasonal band and its pessimistic case. Solar DNI is
 * not a constant and pretending otherwise is how solar startups lose
 * trust.
 */

// ---------------------------------------------------------------------------
// Stated assumptions (single source of truth)
// ---------------------------------------------------------------------------

export interface LossStage {
  key: string;
  label: string;
  factor: number;
  note: string;
}

/** Where the sunlight goes. Product ≈ 0.60 — the site's headline efficiency. */
export const LOSS_CHAIN: LossStage[] = [
  { key: "optical", label: "Mirror optics & tracking error", factor: 0.88, note: "real concentrators, not datasheet mirrors" },
  { key: "soiling", label: "Soiling (dust, bird politics)", factor: 0.96, note: "between cleanings" },
  { key: "receiver", label: "Receiver thermal loss", factor: 0.93, note: "emissivity + convection at operating temperature" },
  { key: "storage", label: "Sand store charge/discharge", factor: 0.90, note: "round-trip on the hot store" },
  { key: "pipework", label: "Pipework & exchanger losses", factor: 0.85, note: "the unglamorous 15%" },
];

export const COLLECTOR_EFFICIENCY: number = LOSS_CHAIN.reduce(
  (p, s) => p * s.factor,
  1
);

/** The honest band: even the loss chain is an estimate. */
export const COLLECTOR_EFFICIENCY_RANGE = { low: 0.55, high: 0.60 } as const;

export const ORC_EFFICIENCY = 0.18;
export const SAND_KG_PER_KWH = 11.25;
export const ELECTRICITY_GBP_PER_KWH = 0.28;
export const COST_GBP_PER_M2 = 350;

/**
 * Seasonal shape of DNI, as multipliers on the annual average. Rough by
 * design and stated as such: for UK-like latitudes December runs ≈ 0.3×
 * the annual mean and high summer ≈ 1.6×. Anyone sizing a system on the
 * annual average alone is designing a December disappointment.
 */
export const SEASONAL = { winter: 0.3, summer: 1.6 } as const;

/** Roughly Nov–Feb at winter output, the rest at the annual average. */
const WINTER_DAYS = 120;

// ---------------------------------------------------------------------------
// Rig output, with bands
// ---------------------------------------------------------------------------

export interface RigOutput {
  areaM2: number;
  /** Central estimate at the given (annual-average) DNI. */
  thermalKWhPerDay: number;
  electricKWhPerDay: number;
  heatKWhPerDay: number;
  sandMassKg: number;
  /** Worst-month electricity (December-ish). */
  winterElectricKWhPerDay: number;
  /** High-summer electricity. */
  summerElectricKWhPerDay: number;
  /** Pessimistic annual case: −10% DNI, 0.55 collector efficiency. */
  pessimisticElectricKWhPerDay: number;
}

export function rigOutput(
  areaM2: number,
  dniAnnual: number,
  opts: { efficiency?: number; orcEfficiency?: number } = {}
): RigOutput {
  const eff = opts.efficiency ?? COLLECTOR_EFFICIENCY;
  const orc = opts.orcEfficiency ?? ORC_EFFICIENCY;
  const thermal = dniAnnual * areaM2 * eff;
  const electric = thermal * orc;
  const pessimistic =
    dniAnnual * 0.9 * areaM2 * COLLECTOR_EFFICIENCY_RANGE.low * orc;
  return {
    areaM2,
    thermalKWhPerDay: thermal,
    electricKWhPerDay: electric,
    heatKWhPerDay: thermal - electric,
    sandMassKg: thermal * SAND_KG_PER_KWH,
    winterElectricKWhPerDay: electric * SEASONAL.winter,
    summerElectricKWhPerDay: electric * SEASONAL.summer,
    pessimisticElectricKWhPerDay: pessimistic,
  };
}

// ---------------------------------------------------------------------------
// Sizing and honest economics
// ---------------------------------------------------------------------------

export type SizingMode = "annual" | "winter";

/**
 * Recommendation on the chosen basis. "winter" sizes for the worst month —
 * bigger rig, but the lights stay on in December; "annual" admits a
 * seasonal shortfall and says so.
 */
export function recommendRig(
  areasM2: number[],
  dailyUseKWh: number,
  dniAnnual: number,
  mode: SizingMode = "annual"
): { rigs: RigOutput[]; recommended: RigOutput } {
  const rigs = areasM2.map((a) => rigOutput(a, dniAnnual));
  const key = (r: RigOutput) =>
    mode === "winter" ? r.winterElectricKWhPerDay : r.electricKWhPerDay;
  const recommended =
    rigs.find((r) => key(r) >= dailyUseKWh) || rigs[rigs.length - 1];
  return { rigs, recommended };
}

/**
 * Honest annual savings: you only save on electricity you actually
 * generate. Winter days are capped by the winter output, the rest by the
 * annual-average output — never by what you would have liked.
 */
export function annualSavingsGBP(
  dailyUseKWh: number,
  rig: RigOutput
): number {
  const winterCovered =
    WINTER_DAYS * Math.min(dailyUseKWh, rig.winterElectricKWhPerDay);
  const restCovered =
    (365 - WINTER_DAYS) * Math.min(dailyUseKWh, rig.electricKWhPerDay);
  return (winterCovered + restCovered) * ELECTRICITY_GBP_PER_KWH;
}

export function systemCostGBP(areaM2: number): number {
  return areaM2 * COST_GBP_PER_M2;
}

// ---------------------------------------------------------------------------
// The loss budget (marketing's favorite table)
// ---------------------------------------------------------------------------

export interface BudgetRow extends LossStage {
  kwhIn: number;
  kwhLost: number;
  kwhOut: number;
}

export function lossBudget(
  dniAnnual: number,
  areaM2: number
): { rows: BudgetRow[]; collectedKWhPerDay: number; incidentKWhPerDay: number } {
  const incident = dniAnnual * areaM2;
  const rows: BudgetRow[] = [];
  let remaining = incident;
  for (const stage of LOSS_CHAIN) {
    const out = remaining * stage.factor;
    rows.push({ ...stage, kwhIn: remaining, kwhLost: remaining - out, kwhOut: out });
    remaining = out;
  }
  return { rows, collectedKWhPerDay: remaining, incidentKWhPerDay: incident };
}

// ---------------------------------------------------------------------------
// Hybrid mode: PV for electrons, collector + sand for heat. The version
// we'd actually bet money on — Heat Loom minus the ORC, plus bought PV.
// ---------------------------------------------------------------------------

/**
 * DIY PV economics, GBP per kWp (panels + inverter share + mounting).
 * Sourced Aug 2026: tier-1 400 W panels GBP 100-130 (~0.25-0.33/W),
 * Hoymiles-class microinverters GBP 120-160 per 800 W 2-in-1, so
 * ~GBP 500/kWp real-world DIY; 550 includes mounting and cable. The
 * old 400 was bargain-hunting, not a plan.
 * Sources: pluggedin.solar 400W-UK guide; pluggedin.solar microinverter guide.
 */
export const PV_GBP_PER_KWP = 550;
/** UK-ish specific yield, kWh per kWp per year (south, sensible tilt). */
export const PV_KWH_PER_KWP_YEAR = 950;
/** PV's December factor (weaker than thermal's 0.3 — diffuse light). */
export const PV_SEASONAL_WINTER = 0.22;
export const PV_SEASONAL_SUMMER = 1.9;
/**
 * Collector panels, GBP per m2 aperture. Sourced Aug 2026: UK 20-tube
 * evacuated collectors GBP 400-700 (~2-2.5 m2 => 180-280/m2); 300 keeps
 * margin. Panels only — the pump station and controller are charged
 * once, separately (THERMAL_BOP_GBP). Sources: stovesandsolar.com
 * Navitron kit builder; eBay UK collector listings.
 */
export const COLLECTOR_GBP_PER_M2 = 300;

/**
 * Thermal balance of plant, charged once regardless of collector area:
 * pump station (150-300), controller (200-300), glycol, fittings.
 * Source: Navitron PRO-KIT 5830 (2,198 complete) decomposed; DIY
 * component-sourced ~500.
 */
export const THERMAL_BOP_GBP = 500;
/**
 * Sand store all-in, GBP per kWh-thermal. Sourced Aug 2026 DIY parts:
 * drum 50-100, rockwool 100 mm 60-100/pack, ceramic fibre hot-face
 * 50-100, copper coil 50-100 => 6-10/kWh achievable; 15 keeps margin
 * for the higher-temperature build.
 */
export const STORE_GBP_PER_KWH = 15;
/** The sand itself: builder's sand, ~£45/tonne. */
export const SAND_MEDIA_GBP_PER_KG = 0.045;
/** Heat displaced, £/kWh-thermal (gas-ish). */
export const HEAT_GBP_PER_KWH = 0.045;

export interface HybridInput {
  /** Daily household electricity demand, kWh/day. */
  electricKWhPerDay: number;
  /** Daily household heat demand (space + water), kWh/day. */
  heatKWhPerDay: number;
  /** PV array size, kWp. */
  pvKwp: number;
  /** Thermal collector aperture, m². */
  collectorM2: number;
  /** Sand store capacity, kWh-thermal. */
  storeKWh: number;
  /** Annual-average DNI, kWh/m²/day. */
  dniAnnual: number;
}

export interface HybridPlan {
  pv: {
    kwp: number;
    annualKWh: number;
    winterKWhPerDay: number;
    summerKWhPerDay: number;
    costGBP: number;
  };
  thermal: {
    areaM2: number;
    annualKWh: number;
    winterKWhPerDay: number;
    summerKWhPerDay: number;
    costGBP: number;
    sandMassKg: number;
    storeCostGBP: number;
    /** The aggregate itself — a small fraction of the store's cost. */
    mediaCostGBP: number;
    /** Vessel + insulation + exchanger = the rest. */
    vesselCostGBP: number;
  };
  coverage: {
    electricAnnual: number;
    electricWinter: number;
    heatAnnual: number;
    heatWinter: number;
  };
  economics: {
    systemCostGBP: number;
    annualSavingsGBP: number;
    paybackYears: number;
    naiveSavingsGBP: number;
  };
  decemberVerdict: {
    serious: boolean;
    text: string;
  };
}

export function hybridPlan(p: HybridInput): HybridPlan {
  // PV: annual yield with the weak-winter honesty factor.
  const pvAnnual = p.pvKwp * PV_KWH_PER_KWP_YEAR;
  const pvWinterPerDay = (pvAnnual / 365) * PV_SEASONAL_WINTER;
  const pvSummerPerDay = (pvAnnual / 365) * PV_SEASONAL_SUMMER;

  // Thermal: collector through the same loss chain as everything else.
  const thermalPerDay = p.dniAnnual * p.collectorM2 * COLLECTOR_EFFICIENCY;
  const thermalAnnual = thermalPerDay * 365;
  const thermalWinterPerDay = thermalPerDay * SEASONAL.winter;
  const thermalSummerPerDay = thermalPerDay * SEASONAL.summer;

  // Coverage caps at demand; the store shifts summer surplus modestly but
  // does not create energy (stated: charging losses are already in the
  // 0.90 storage factor of the loss chain).
  const elDaily = p.electricKWhPerDay;
  const heatDaily = p.heatKWhPerDay;
  const elAnnual = Math.min(elDaily, pvAnnual / 365);
  const elWinter = Math.min(elDaily, pvWinterPerDay);
  // Heat: winter coverage uses winter collection topped by whatever the
  // store can cycle daily (a big store smooths days, not seasons — honest
  // simplification, stated).
  const storeCyclePerDay = Math.min(p.storeKWh, thermalPerDay);
  const heatAnnualCover = Math.min(heatDaily, thermalPerDay);
  const heatWinterCover = Math.min(heatDaily, thermalWinterPerDay + Math.max(0, storeCyclePerDay * 0.15));

  const pvCost = p.pvKwp * PV_GBP_PER_KWP;
  const collectorCost = p.collectorM2 * COLLECTOR_GBP_PER_M2;
  const storeCost = p.storeKWh * STORE_GBP_PER_KWH;
  const systemCost = pvCost + collectorCost + storeCost + THERMAL_BOP_GBP;

  const annualSavings =
    elAnnual * 365 * ELECTRICITY_GBP_PER_KWH +
    heatAnnualCover * 365 * HEAT_GBP_PER_KWH;
  const naive =
    elDaily * 365 * ELECTRICITY_GBP_PER_KWH + heatDaily * 365 * HEAT_GBP_PER_KWH;

  const serious = heatWinterCover < heatDaily * 0.5 || elWinter < elDaily * 0.3;
  const text = serious
    ? `December reality check: electric coverage ${Math.round((100 * elWinter) / Math.max(elDaily, 0.1))}%, heat coverage ${Math.round((100 * heatWinterCover) / Math.max(heatDaily, 0.1))}%. The grid and the boiler stay part of an honest design — the hybrid buys down their share, it does not retire them.`
    : `December holds: ${Math.round((100 * elWinter) / Math.max(elDaily, 0.1))}% electric and ${Math.round((100 * heatWinterCover) / Math.max(heatDaily, 0.1))}% heat coverage in the worst month. Oversizing the sand store (it is the cheap part) is what buys this.`;

  return {
    pv: {
      kwp: p.pvKwp,
      annualKWh: pvAnnual,
      winterKWhPerDay: pvWinterPerDay,
      summerKWhPerDay: pvSummerPerDay,
      costGBP: pvCost,
    },
    thermal: {
      areaM2: p.collectorM2,
      annualKWh: thermalAnnual,
      winterKWhPerDay: thermalWinterPerDay,
      summerKWhPerDay: thermalSummerPerDay,
      costGBP: collectorCost,
      sandMassKg: p.storeKWh * SAND_KG_PER_KWH,
      storeCostGBP: storeCost,
      mediaCostGBP: p.storeKWh * SAND_KG_PER_KWH * SAND_MEDIA_GBP_PER_KG,
      vesselCostGBP: storeCost - p.storeKWh * SAND_KG_PER_KWH * SAND_MEDIA_GBP_PER_KG,
    },
    coverage: {
      electricAnnual: elAnnual / Math.max(elDaily, 0.1),
      electricWinter: elWinter / Math.max(elDaily, 0.1),
      heatAnnual: heatAnnualCover / Math.max(heatDaily, 0.1),
      heatWinter: heatWinterCover / Math.max(heatDaily, 0.1),
    },
    economics: {
      systemCostGBP: systemCost,
      annualSavingsGBP: annualSavings,
      paybackYears: systemCost / Math.max(annualSavings, 1),
      naiveSavingsGBP: naive,
    },
    decemberVerdict: { serious, text },
  };
}
