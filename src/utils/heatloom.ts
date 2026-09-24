/**
 * Heat Loom's engineering math, extracted from the marketing.
 *
 * Everything the Configurator, Theory, Hybrid, ROI and On Trial panels
 * claim lives here as pure functions with the assumptions stated. Two
 * designs share the module:
 *
 *  - The research rig (retired as a house system): silvered-glass troughs
 *    concentrate direct sunlight onto a receiver, a sand store runs hot,
 *    and an ORC turns some of the heat into electricity. Its loss chain
 *    multiplies to ≈ 0.60; the ORC converts 18%.
 *  - The Hybrid (the one we'd build): bought PV for electricity, commodity
 *    evacuated-tube collectors + a sand store for heat. Tubes do not
 *    concentrate and run a glycol loop, so they get their own loss chain
 *    and a much smaller store temperature swing.
 *
 * The honesty policy mirrors our other project: every headline number
 * ships with its seasonal band and its pessimistic case, and monthly
 * shapes replace a single "winter factor". Where a figure is an
 * assumption rather than a measurement, it says so here.
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

/** Research rig (troughs): where the direct sunlight goes. Product ≈ 0.60. */
export const LOSS_CHAIN: LossStage[] = [
  { key: "optical", label: "Mirror optics & tracking error", factor: 0.88, note: "real concentrators, not datasheet mirrors" },
  { key: "soiling", label: "Soiling (dust, bird politics)", factor: 0.96, note: "between cleanings" },
  { key: "receiver", label: "Receiver thermal loss", factor: 0.93, note: "emissivity + convection at operating temperature" },
  { key: "storage", label: "Sand store charge/discharge", factor: 0.90, note: "round-trip on the hot store" },
  { key: "pipework", label: "Pipework & exchanger losses", factor: 0.85, note: "the unglamorous 15%" },
];

const chainProduct = (chain: LossStage[]) => chain.reduce((p, s) => p * s.factor, 1);

export const COLLECTOR_EFFICIENCY: number = chainProduct(LOSS_CHAIN);

/** The honest band: even the loss chain is an estimate. */
export const COLLECTOR_EFFICIENCY_RANGE = { low: 0.55, high: 0.60 } as const;

/**
 * Hybrid (evacuated tubes charging a sand store): assumptions, not
 * measurements. Datasheet optical efficiency for evacuated tubes is
 * roughly 0.6–0.75 of aperture; heat loss grows as the store heats, and
 * charging towards 120 °C in a UK winter costs a quarter or more. No
 * mirror, no tracking.
 */
export const HYBRID_LOSS_CHAIN: LossStage[] = [
  { key: "tube-optics", label: "Evacuated-tube optics (η₀)", factor: 0.7, note: "datasheet 0.6–0.75 of aperture" },
  { key: "tube-heat-loss", label: "Tube heat loss at store temperature", factor: 0.75, note: "worse as the store heats and the air cools" },
  { key: "soiling", label: "Soiling", factor: 0.96, note: "between cleanings" },
  { key: "storage", label: "Sand store charge/discharge", factor: 0.9, note: "round-trip on the store" },
  { key: "pipework", label: "Pipework & exchanger losses", factor: 0.85, note: "the unglamorous 15%" },
];
export const HYBRID_COLLECTOR_EFFICIENCY: number = chainProduct(HYBRID_LOSS_CHAIN);
/** Band for the tube chain: the pessimistic case uses the low end. */
export const HYBRID_EFFICIENCY_RANGE = { low: 0.3, high: 0.45 } as const;

export const ORC_EFFICIENCY = 0.18;
export const ELECTRICITY_GBP_PER_KWH = 0.28;

// ---------------------------------------------------------------------------
// Sand: how much it takes depends on how hot the store runs
// ---------------------------------------------------------------------------

/** Dry quartz sand. */
export const SAND_CP_KJ_PER_KG_K = 0.8;
export const SAND_DENSITY_KG_M3 = 1600;
/** Water, for comparison at the Hybrid's temperatures. */
export const WATER_CP_KJ_PER_KG_K = 4.18;

/** Sand mass per kWh-thermal for a store that swings through ΔT kelvin. */
export function sandKgPerKWh(deltaTK: number): number {
  return 3600 / (SAND_CP_KJ_PER_KG_K * deltaTK);
}

/**
 * Research rig: charged to ~420 °C and drawn down to ~20 °C — a generous
 * 400 K swing (charging only to the Build Guide's 250 °C gives
 * sandKgPerKWh(230) ≈ 19.6 kg/kWh).
 */
export const RIG_STORE_DELTA_T_K = 400;
export const SAND_KG_PER_KWH = sandKgPerKWh(RIG_STORE_DELTA_T_K); // 11.25

/**
 * Hybrid: evacuated tubes and a glycol loop can charge the store to about
 * 120 °C, and its heat is useful for heating down to about 45 °C.
 */
export const HYBRID_STORE_TOP_C = 120;
export const HYBRID_STORE_USEFUL_MIN_C = 45;
export const HYBRID_STORE_DELTA_T_K = HYBRID_STORE_TOP_C - HYBRID_STORE_USEFUL_MIN_C;
export const HYBRID_SAND_KG_PER_KWH = sandKgPerKWh(HYBRID_STORE_DELTA_T_K);
/** An unpressurised water tank at the same job: 95 °C down to 45 °C. */
export const HYBRID_WATER_KG_PER_KWH = 3600 / (WATER_CP_KJ_PER_KG_K * (95 - HYBRID_STORE_USEFUL_MIN_C));

/**
 * Standing loss: a store cools with time constant τ = C / UA. Cylinder with
 * height = diameter, insulated all round with conductance U (W/m²·K);
 * 150 mm of mineral wool is ≈ 0.25. Sand heat capacity only — the vessel
 * and exchanger are ignored, which slightly flatters the store.
 */
export const STORE_U_W_PER_M2K = 0.25;

/** Volume and outside area of the cylinder (height = diameter) holding `massKg` of sand. */
export function sandStoreGeometry(massKg: number): { volumeM3: number; areaM2: number } {
  const volumeM3 = massKg / SAND_DENSITY_KG_M3;
  // V = π r² h with h = 2r → r = (V / 2π)^(1/3); area = 2πr² + 2πrh = 6πr²
  const r = Math.cbrt(volumeM3 / (2 * Math.PI));
  return { volumeM3, areaM2: 6 * Math.PI * r * r };
}

export function storeHeatLoss(
  storeKWh: number,
  deltaTK: number = HYBRID_STORE_DELTA_T_K,
  uWPerM2K: number = STORE_U_W_PER_M2K
): { massKg: number; volumeM3: number; areaM2: number; timeConstantDays: number; halfLifeDays: number } {
  const massKg = storeKWh * sandKgPerKWh(deltaTK);
  const { volumeM3, areaM2 } = sandStoreGeometry(massKg);
  const cJPerK = massKg * SAND_CP_KJ_PER_KG_K * 1000;
  const tauS = cJPerK / (uWPerM2K * areaM2);
  const timeConstantDays = tauS / 86400;
  return { massKg, volumeM3, areaM2, timeConstantDays, halfLifeDays: timeConstantDays * Math.LN2 };
}

// ---------------------------------------------------------------------------
// Seasons: monthly shapes instead of one winter factor
// ---------------------------------------------------------------------------

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const DECEMBER = 11;

/** Scale a monthly profile so that Σ days × factor = 365 (mean day = 1). */
function normalizeMonthly(raw: number[]): number[] {
  const weighted = raw.reduce((s, v, i) => s + v * DAYS_IN_MONTH[i], 0);
  return raw.map((v) => (v * 365) / weighted);
}

/**
 * Sunshine on a south-facing tilted panel, southern England, as multiples
 * of the annual mean day. An approximate PVGIS-style shape, stated as such:
 * December ≈ 0.3×, midsummer ≈ 1.6×. Used for both PV and the tubes.
 */
export const SOLAR_MONTHLY = normalizeMonthly([0.38, 0.62, 0.98, 1.3, 1.5, 1.56, 1.54, 1.33, 1.08, 0.72, 0.42, 0.29]);

/**
 * Household heat demand as multiples of the annual mean day: a flat hot-
 * water share plus space heating in proportion to approximate UK monthly
 * heating degree days. Heat is wanted most exactly when the sun is least.
 */
export const HOT_WATER_SHARE = 0.2;
const UK_HEATING_DEGREE_DAYS = [330, 290, 260, 180, 100, 40, 15, 15, 50, 130, 240, 310];
export const HEAT_DEMAND_MONTHLY = (() => {
  const hddNorm = normalizeMonthly(UK_HEATING_DEGREE_DAYS);
  return hddNorm.map((h) => HOT_WATER_SHARE + (1 - HOT_WATER_SHARE) * h);
})();

/** The old two-number shape, kept for the retired rig's December figure. */
export const SEASONAL = { winter: SOLAR_MONTHLY[DECEMBER], summer: Math.max(...SOLAR_MONTHLY) } as const;

// ---------------------------------------------------------------------------
// Research rig (troughs + sand + ORC) — retired as a house system
// ---------------------------------------------------------------------------

/** The Build Guide's research-grade bill of materials (3 m² of troughs). */
export const RIG_BOM = [
  { item: "Collectors", detail: "3 × 1m² silvered-glass troughs + tracker hardware", gbp: 2500 },
  { item: "Receiver Tubes", detail: "Evacuated, selective-coated steel/copper", gbp: 1400 },
  { item: "Storage Vessel", detail: "55-gal drum, ceramic fiber liner, mineral wool, VIP panels", gbp: 2000 },
  { item: "Storage Media", detail: "Basalt/magnetite (20%), quartz sand (70%), perlite (10%)", gbp: 650 },
  { item: "Plumbing", detail: "316 SS (charge loop), Cu or SS (use coil)", gbp: 950 },
  { item: "Controls", detail: "Raspberry Pi/ESP32, K-type thermocouples, actuator drivers", gbp: 400 },
] as const;
export const RIG_BOM_AREA_M2 = 3;
export const RIG_BOM_TOTAL_GBP = RIG_BOM.reduce((s, r) => s + r.gbp, 0);
/**
 * Cost per m² of the research rig, from its own bill of materials, scaled
 * linearly (bigger rigs would be somewhat cheaper per m²). The ORC is not
 * included: no small ORC is priced here.
 */
export const COST_GBP_PER_M2 = RIG_BOM_TOTAL_GBP / RIG_BOM_AREA_M2;

export interface RigOutput {
  areaM2: number;
  /** Central estimate at the given (annual-average) DNI. */
  thermalKWhPerDay: number;
  electricKWhPerDay: number;
  /**
   * The ORC's reject heat. It leaves the condenser at roughly 30–40 °C —
   * too cool to heat a home; condensing hotter to make it useful cuts the
   * ORC's own efficiency (Carnot to 60 °C falls from 44% to 36%).
   */
  rejectHeatKWhPerDay: number;
  sandMassKg: number;
  /** December electricity. */
  winterElectricKWhPerDay: number;
  /** Midsummer electricity. */
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
    rejectHeatKWhPerDay: thermal - electric,
    sandMassKg: thermal * SAND_KG_PER_KWH,
    winterElectricKWhPerDay: electric * SEASONAL.winter,
    summerElectricKWhPerDay: electric * SEASONAL.summer,
    pessimisticElectricKWhPerDay: pessimistic,
  };
}

export type SizingMode = "annual" | "winter";

/**
 * Recommendation on the chosen basis. "winter" sizes for the worst month;
 * "annual" admits a seasonal shortfall and says so. `meetsTarget` is false
 * when even the largest option falls short — the caller must say so rather
 * than call it optimised.
 */
export function recommendRig(
  areasM2: number[],
  dailyUseKWh: number,
  dniAnnual: number,
  mode: SizingMode = "annual"
): { rigs: RigOutput[]; recommended: RigOutput; meetsTarget: boolean } {
  const rigs = areasM2.map((a) => rigOutput(a, dniAnnual));
  const key = (r: RigOutput) =>
    mode === "winter" ? r.winterElectricKWhPerDay : r.electricKWhPerDay;
  const fit = rigs.find((r) => key(r) >= dailyUseKWh);
  return { rigs, recommended: fit || rigs[rigs.length - 1], meetsTarget: Boolean(fit) };
}

/**
 * Electricity savings for the retired rig, month by month: each month is
 * capped at that month's output, never at what you would have liked.
 */
export function annualSavingsGBP(dailyUseKWh: number, rig: RigOutput): number {
  let covered = 0;
  for (let m = 0; m < 12; m++) {
    covered += DAYS_IN_MONTH[m] * Math.min(dailyUseKWh, rig.electricKWhPerDay * SOLAR_MONTHLY[m]);
  }
  return covered * ELECTRICITY_GBP_PER_KWH;
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
  areaM2: number,
  chain: LossStage[] = LOSS_CHAIN
): { rows: BudgetRow[]; collectedKWhPerDay: number; incidentKWhPerDay: number } {
  const incident = dniAnnual * areaM2;
  const rows: BudgetRow[] = [];
  let remaining = incident;
  for (const stage of chain) {
    const out = remaining * stage.factor;
    rows.push({ ...stage, kwhIn: remaining, kwhLost: remaining - out, kwhOut: out });
    remaining = out;
  }
  return { rows, collectedKWhPerDay: remaining, incidentKWhPerDay: incident };
}

// ---------------------------------------------------------------------------
// Hybrid mode: PV for electrons, evacuated tubes + sand for heat. The version
// we'd actually build — Heat Loom minus the ORC, plus bought PV.
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
/** Specific yield, kWh per kWp per year: southern England, south-facing, sensible tilt (Scotland is nearer 800). */
export const PV_KWH_PER_KWP_YEAR = 950;
/**
 * Share of PV output used at home. Without a battery, a house is out or
 * asleep for much of the sunshine; 50% is a typical planning figure.
 */
export const PV_SELF_USE_DEFAULT = 0.5;
/**
 * What exported units earn. A DIY (non-MCS) install cannot claim the
 * Smart Export Guarantee, so the planning figure is zero.
 */
export const EXPORT_GBP_PER_KWH = 0;
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
 * 50-100, copper coil 50-100 => 6-10/kWh achievable; 15 keeps margin.
 * At the Hybrid's temperatures the store is several times bulkier than
 * those parts assumed (see HYBRID_SAND_KG_PER_KWH), so treat 15 as a floor.
 */
export const STORE_GBP_PER_KWH = 15;
/** The sand itself: builder's sand, ~£45/tonne. */
export const SAND_MEDIA_GBP_PER_KG = 0.045;
/** Lithium home storage, GBP per kWh (electrical), for the comparison the site makes. */
export const LITHIUM_GBP_PER_KWH = 300;

/**
 * What a displaced kWh of heat is worth depends on what heats the house
 * now. Approximate 2026 UK figures, stated as assumptions: gas through a
 * boiler (the site's default), heating oil, a heat pump at COP 3, and
 * direct electric at the same 28p as the electricity above.
 */
export const HEAT_SOURCES = {
  gas: { label: "Gas boiler", gbpPerKWh: 0.045 },
  oil: { label: "Heating oil", gbpPerKWh: 0.075 },
  heatPump: { label: "Heat pump (COP 3)", gbpPerKWh: ELECTRICITY_GBP_PER_KWH / 3 },
  electric: { label: "Direct electric", gbpPerKWh: ELECTRICITY_GBP_PER_KWH },
} as const;
export type HeatSource = keyof typeof HEAT_SOURCES;
/** Heat displaced, £/kWh-thermal (gas-ish) — the default. */
export const HEAT_GBP_PER_KWH = HEAT_SOURCES.gas.gbpPerKWh;

export interface HybridInput {
  /** Daily household electricity demand, kWh/day (flat through the year). */
  electricKWhPerDay: number;
  /** Mean daily household heat demand (space + water), kWh/day, shaped by month. */
  heatKWhPerDay: number;
  /** PV array size, kWp. */
  pvKwp: number;
  /** Thermal collector aperture, m². */
  collectorM2: number;
  /** Sand store capacity, kWh-thermal. */
  storeKWh: number;
  /**
   * Annual-average sunshine on the collector, kWh/m²/day — global
   * irradiance on a south-facing tilt (tubes use diffuse light too), not
   * DNI. Southern England ≈ 3. The field name is historical.
   */
  dniAnnual: number;
  /** Share of PV output used at home, 0–1. Default 0.5. */
  pvSelfUse?: number;
  /** What heats the house now. Default gas. */
  heatSource?: HeatSource;
}

export interface MonthRow {
  month: string;
  pvKWhPerDay: number;
  pvUsedKWhPerDay: number;
  heatCollectedKWhPerDay: number;
  heatUsedKWhPerDay: number;
  heatDemandKWhPerDay: number;
}

interface Scenario {
  pvUsedKWh: number;
  pvExportKWh: number;
  heatUsedKWh: number;
  savingsGBP: number;
  decElectricCover: number;
  decHeatCover: number;
  months: MonthRow[];
}

export interface HybridPlan {
  pv: {
    kwp: number;
    annualKWh: number;
    /** December generation, kWh/day. */
    winterKWhPerDay: number;
    /** Best month's generation, kWh/day. */
    summerKWhPerDay: number;
    /** Used at home over the year, kWh. */
    usedKWh: number;
    selfUse: number;
    costGBP: number;
  };
  thermal: {
    areaM2: number;
    /** Heat collected over the year, kWh-thermal (before matching demand). */
    annualKWh: number;
    /** Heat that meets demand over the year; summer surplus beyond demand is lost. */
    usedKWh: number;
    winterKWhPerDay: number;
    summerKWhPerDay: number;
    efficiency: number;
    costGBP: number;
    sandMassKg: number;
    storeVolumeM3: number;
    storeHalfLifeDays: number;
    /** Store capacity ÷ the best month's daily collection. */
    storeDaysOfPeakCollection: number;
    /** A water tank doing the same job (95 → 45 °C), for comparison. */
    waterMassKg: number;
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
    /** −10% sun, low-end collector efficiency, same self-use. */
    pessimisticSavingsGBP: number;
    pessimisticPaybackYears: number;
    /** Savings split, so the page can say which half earns the money. */
    electricSavingsGBP: number;
    heatSavingsGBP: number;
    pvCostGBP: number;
    thermalCostGBP: number;
    heatGBPPerKWh: number;
  };
  monthly: MonthRow[];
  decemberVerdict: {
    serious: boolean;
    text: string;
  };
}

function runScenario(p: HybridInput, sunScale: number, efficiency: number, selfUse: number, heatPrice: number): Scenario {
  const pvDailyMean = (p.pvKwp * PV_KWH_PER_KWP_YEAR * sunScale) / 365;
  const thermalDailyMean = p.dniAnnual * sunScale * p.collectorM2 * efficiency;
  let pvUsed = 0, pvExport = 0, heatUsed = 0;
  const months: MonthRow[] = [];
  let decEl = 0, decHeat = 0;
  for (let m = 0; m < 12; m++) {
    const d = DAYS_IN_MONTH[m];
    const pvDay = pvDailyMean * SOLAR_MONTHLY[m];
    const pvUsedDay = Math.min(p.electricKWhPerDay, selfUse * pvDay);
    const heatDemandDay = p.heatKWhPerDay * HEAT_DEMAND_MONTHLY[m];
    const heatDay = thermalDailyMean * SOLAR_MONTHLY[m];
    // The store smooths sunny and cloudy days within a month; it cannot
    // carry summer into winter (see storeHeatLoss), so no month uses
    // more heat than it collects.
    const heatUsedDay = Math.min(heatDemandDay, heatDay);
    pvUsed += d * pvUsedDay;
    pvExport += d * (pvDay - pvUsedDay);
    heatUsed += d * heatUsedDay;
    months.push({ month: MONTHS[m], pvKWhPerDay: pvDay, pvUsedKWhPerDay: pvUsedDay, heatCollectedKWhPerDay: heatDay, heatUsedKWhPerDay: heatUsedDay, heatDemandKWhPerDay: heatDemandDay });
    if (m === DECEMBER) {
      decEl = pvUsedDay / Math.max(p.electricKWhPerDay, 0.1);
      decHeat = heatUsedDay / Math.max(heatDemandDay, 0.1);
    }
  }
  const savings = pvUsed * ELECTRICITY_GBP_PER_KWH + pvExport * EXPORT_GBP_PER_KWH + heatUsed * heatPrice;
  return { pvUsedKWh: pvUsed, pvExportKWh: pvExport, heatUsedKWh: heatUsed, savingsGBP: savings, decElectricCover: decEl, decHeatCover: decHeat, months };
}

export function hybridPlan(p: HybridInput): HybridPlan {
  const selfUse = Math.min(1, Math.max(0, p.pvSelfUse ?? PV_SELF_USE_DEFAULT));
  const heatPrice = HEAT_SOURCES[p.heatSource ?? "gas"].gbpPerKWh;
  const central = runScenario(p, 1, HYBRID_COLLECTOR_EFFICIENCY, selfUse, heatPrice);
  const pessimistic = runScenario(p, 0.9, HYBRID_EFFICIENCY_RANGE.low, selfUse, heatPrice);

  const pvAnnual = p.pvKwp * PV_KWH_PER_KWP_YEAR;
  const pvMean = pvAnnual / 365;
  const thermalMean = p.dniAnnual * p.collectorM2 * HYBRID_COLLECTOR_EFFICIENCY;
  const peakThermal = thermalMean * Math.max(...SOLAR_MONTHLY);

  const pvCost = p.pvKwp * PV_GBP_PER_KWP;
  const collectorCost = p.collectorM2 * COLLECTOR_GBP_PER_M2;
  const storeCost = p.storeKWh * STORE_GBP_PER_KWH;
  const systemCost = pvCost + collectorCost + storeCost + THERMAL_BOP_GBP;
  const sandMassKg = p.storeKWh * HYBRID_SAND_KG_PER_KWH;
  const loss = storeHeatLoss(p.storeKWh);

  const elDemandYear = p.electricKWhPerDay * 365;
  const heatDemandYear = p.heatKWhPerDay * 365;
  const naive = elDemandYear * ELECTRICITY_GBP_PER_KWH + heatDemandYear * heatPrice;
  const electricSavings = central.pvUsedKWh * ELECTRICITY_GBP_PER_KWH + central.pvExportKWh * EXPORT_GBP_PER_KWH;
  const heatSavings = central.heatUsedKWh * heatPrice;

  const elWinter = central.decElectricCover;
  const heatWinter = central.decHeatCover;
  const serious = heatWinter < 0.5 || elWinter < 0.3;
  const pct = (x: number) => Math.round(100 * x);
  const text = serious
    ? `December reality check: electric coverage ${pct(elWinter)}%, heat coverage ${pct(heatWinter)}%. The grid and the boiler stay part of an honest design — the hybrid buys down their share, it does not retire them.`
    : `December holds: ${pct(elWinter)}% electric and ${pct(heatWinter)}% heat coverage in the worst month — from the size of the array and collector, not from the store, which cannot carry summer into winter.`;

  return {
    pv: {
      kwp: p.pvKwp,
      annualKWh: pvAnnual,
      winterKWhPerDay: pvMean * SOLAR_MONTHLY[DECEMBER],
      summerKWhPerDay: pvMean * Math.max(...SOLAR_MONTHLY),
      usedKWh: central.pvUsedKWh,
      selfUse,
      costGBP: pvCost,
    },
    thermal: {
      areaM2: p.collectorM2,
      annualKWh: thermalMean * 365,
      usedKWh: central.heatUsedKWh,
      winterKWhPerDay: thermalMean * SOLAR_MONTHLY[DECEMBER],
      summerKWhPerDay: peakThermal,
      efficiency: HYBRID_COLLECTOR_EFFICIENCY,
      costGBP: collectorCost,
      sandMassKg,
      storeVolumeM3: loss.volumeM3,
      storeHalfLifeDays: loss.halfLifeDays,
      storeDaysOfPeakCollection: peakThermal > 0 ? p.storeKWh / peakThermal : Infinity,
      waterMassKg: p.storeKWh * HYBRID_WATER_KG_PER_KWH,
      storeCostGBP: storeCost,
      mediaCostGBP: sandMassKg * SAND_MEDIA_GBP_PER_KG,
      vesselCostGBP: storeCost - sandMassKg * SAND_MEDIA_GBP_PER_KG,
    },
    coverage: {
      electricAnnual: central.pvUsedKWh / Math.max(elDemandYear, 0.1),
      electricWinter: elWinter,
      heatAnnual: central.heatUsedKWh / Math.max(heatDemandYear, 0.1),
      heatWinter: heatWinter,
    },
    economics: {
      systemCostGBP: systemCost,
      annualSavingsGBP: central.savingsGBP,
      paybackYears: systemCost / Math.max(central.savingsGBP, 1),
      naiveSavingsGBP: naive,
      pessimisticSavingsGBP: pessimistic.savingsGBP,
      pessimisticPaybackYears: systemCost / Math.max(pessimistic.savingsGBP, 1),
      electricSavingsGBP: electricSavings,
      heatSavingsGBP: heatSavings,
      pvCostGBP: pvCost,
      thermalCostGBP: collectorCost + storeCost + THERMAL_BOP_GBP,
      heatGBPPerKWh: heatPrice,
    },
    monthly: central.months,
    decemberVerdict: { serious, text },
  };
}

// ---------------------------------------------------------------------------
// The site's default plan and its registered claims
// ---------------------------------------------------------------------------

/** The default Hybrid every headline number on the site describes. */
export const DEFAULT_HYBRID: HybridInput = {
  electricKWhPerDay: 8,
  heatKWhPerDay: 30,
  pvKwp: 2,
  collectorM2: 3,
  storeKWh: 40,
  dniAnnual: 3,
};

/** The three house tiers the Hybrid section prices. */
export const HOUSE_TIERS = [
  { name: "Starter", rig: "2 kWp PV + 3 m² + 40 kWh sand", pvKwp: 2, collectorM2: 3, storeKWh: 40 },
  { name: "Half-heat house", rig: "4 kWp PV + 10 m² + 100 kWh sand", pvKwp: 4, collectorM2: 10, storeKWh: 100 },
  { name: "Whole-house", rig: "4 kWp PV + 20 m² + 150 kWh sand", pvKwp: 4, collectorM2: 20, storeKWh: 150 },
] as const;

/**
 * Annual production the registered Hybrid claims describe: PV generated +
 * heat collected, kWh/yr. rev A and rev B committed "3874.40" — computed
 * with the tubes run through the trough's loss chain (0.601).
 */
export const REGISTERED_HYBRID_KWH_PER_YEAR = "3874.40";

/** The same production figure under the current model. */
export function hybridProductionKWhPerYear(p: HybridInput = DEFAULT_HYBRID): number {
  const plan = hybridPlan(p);
  return plan.pv.annualKWh + plan.thermal.annualKWh;
}

// ---------------------------------------------------------------------------
// Toy balances for the animated panels (Energy Flow and the Demo)
// ---------------------------------------------------------------------------

/**
 * The tube chain without its storage stage: the flow toy loses heat from
 * the store explicitly (standing loss), so charging it again would count
 * the store twice.
 */
export const HYBRID_COLLECT_EFFICIENCY: number = chainProduct(HYBRID_LOSS_CHAIN.filter((s) => s.key !== "storage"));

export interface HeatFlowParams {
  /** Sunlight on the tubes right now, kW/m² (clear-sky noon ≈ 0.8–1). */
  sunKWPerM2: number;
  areaM2: number;
  /** Heat the house wants right now, kW. */
  demandKW: number;
  /** Useful heat the store holds between its floor and top temperatures, kWh. */
  capacityKWh: number;
  ambientC?: number;
}

export interface HeatFlowState {
  hours: number;
  storedKWh: number;
  collectedKWh: number;
  deliveredKWh: number;
  /** Standing loss from the store to its surroundings. */
  lostKWh: number;
  /** Collected with the store already full: the controller parks the loop. */
  dumpedKWh: number;
  unmetKWh: number;
}

export const HEAT_FLOW_START: HeatFlowState = {
  hours: 0,
  storedKWh: 0,
  collectedKWh: 0,
  deliveredKWh: 0,
  lostKWh: 0,
  dumpedKWh: 0,
  unmetKWh: 0,
};

/** Hybrid store temperature for a given charge: the useful floor plus its share of the swing. */
export function hybridStoreTemperatureC(storedKWh: number, capacityKWh: number): number {
  const frac = capacityKWh > 0 ? Math.min(1, Math.max(0, storedKWh / capacityKWh)) : 0;
  return HYBRID_STORE_USEFUL_MIN_C + HYBRID_STORE_DELTA_T_K * frac;
}

/**
 * One step of a constant-sun, constant-demand heat balance through the
 * Hybrid's store. Standing loss follows the store's temperature above
 * ambient with the same time constant as storeHeatLoss. The books always
 * balance: collected = delivered + lost + dumped + stored.
 */
export function heatFlowStep(s: HeatFlowState, p: HeatFlowParams, dtHours: number): HeatFlowState {
  const capacity = Math.max(0, p.capacityKWh);
  const collected = Math.max(0, p.sunKWPerM2) * Math.max(0, p.areaM2) * HYBRID_COLLECT_EFFICIENCY * dtHours;
  const tauHours = capacity > 0 ? storeHeatLoss(capacity).timeConstantDays * 24 : Infinity;
  const kWhPerK = capacity / HYBRID_STORE_DELTA_T_K;
  const aboveAmbient = hybridStoreTemperatureC(s.storedKWh, capacity) - (p.ambientC ?? 10);
  const lost = Math.min(s.storedKWh + collected, Math.max(0, (kWhPerK * aboveAmbient * dtHours) / tauHours));
  const available = s.storedKWh + collected - lost;
  const wanted = Math.max(0, p.demandKW) * dtHours;
  const delivered = Math.min(wanted, available);
  const left = available - delivered;
  const stored = Math.min(capacity, left);
  return {
    hours: s.hours + dtHours,
    storedKWh: stored,
    collectedKWh: s.collectedKWh + collected,
    deliveredKWh: s.deliveredKWh + delivered,
    lostKWh: s.lostKWh + lost,
    dumpedKWh: s.dumpedKWh + (left - stored),
    unmetKWh: s.unmetKWh + (wanted - delivered),
  };
}

/**
 * The research rig's store conductance, W/K: the same insulated cylinder
 * as storeHeatLoss, holding `massKg` of sand. The Demo uses it so its
 * overnight loss agrees with the hold test in Performance.
 */
export function sandStoreUAWPerK(massKg: number, uWPerM2K: number = STORE_U_W_PER_M2K): number {
  return uWPerM2K * sandStoreGeometry(massKg).areaM2;
}

/** Research rig: the top of the store's swing (RIG_STORE_DELTA_T_K above ~20 °C). */
export const RIG_STORE_TOP_C = 420;
/** The trough chain without its storage stage — the Demo loses store heat explicitly. */
export const RIG_COLLECT_EFFICIENCY: number = chainProduct(LOSS_CHAIN.filter((s) => s.key !== "storage"));
export const DEMO_DAY_START_MIN = 6 * 60;
export const DEMO_DAY_END_MIN = 20 * 60;

export interface RigDemoParams {
  /** Direct sunlight over the day, kWh/m². */
  dniKWhPerM2Day: number;
  areaM2: number;
  sandKg: number;
  ambientC: number;
  orcOn: boolean;
  orcEfficiency: number;
  /** The ORC takes a share of incoming heat once the store is hotter than this. */
  dispatchAboveC: number;
  dispatchFraction: number;
}

export interface RigDemoState {
  minute: number;
  storeC: number;
  collectedKWh: number;
  electricKWh: number;
  /** ORC condenser heat: too cool to heat a home (see RigOutput). */
  rejectKWh: number;
  lostKWh: number;
  /** Store at its top temperature: the trough defocuses. */
  defocusedKWh: number;
}

/**
 * One simulated minute of the retired research rig on a clear day: a sine
 * sunshine profile from 06:00 to 20:00, the trough chain into the store,
 * standing loss through sandStoreUAWPerK, and an ORC that diverts a share
 * of incoming heat once the store is hot. Energy balances:
 * collected = Δstore + lost + electric + reject + defocused.
 */
export function rigDemoMinute(s: RigDemoState, p: RigDemoParams): RigDemoState {
  const span = DEMO_DAY_END_MIN - DEMO_DAY_START_MIN;
  const x = (s.minute - DEMO_DAY_START_MIN) / span;
  const sunKWhPerM2 = x >= 0 && x < 1 ? (Math.max(0, p.dniKWhPerM2Day) * Math.sin(Math.PI * x) * Math.PI) / (2 * span) : 0;
  const collected = sunKWhPerM2 * Math.max(0, p.areaM2) * RIG_COLLECT_EFFICIENCY;
  const sandKg = Math.max(1, p.sandKg);
  const kWhPerK = (sandKg * SAND_CP_KJ_PER_KG_K) / 3600;
  const lost = Math.min(
    (s.storeC - p.ambientC) * kWhPerK,
    (sandStoreUAWPerK(sandKg) * Math.max(0, s.storeC - p.ambientC) * 60) / 3.6e6
  );
  const dispatched = p.orcOn && s.storeC > p.dispatchAboveC ? Math.min(1, Math.max(0, p.dispatchFraction)) * collected : 0;
  const electric = dispatched * Math.min(1, Math.max(0, p.orcEfficiency));
  let storeC = s.storeC + (collected - Math.max(0, lost) - dispatched) / kWhPerK;
  let defocused = 0;
  if (storeC > RIG_STORE_TOP_C) {
    defocused = (storeC - RIG_STORE_TOP_C) * kWhPerK;
    storeC = RIG_STORE_TOP_C;
  }
  return {
    minute: s.minute + 1,
    storeC,
    collectedKWh: s.collectedKWh + collected,
    electricKWh: s.electricKWh + electric,
    rejectKWh: s.rejectKWh + (dispatched - electric),
    lostKWh: s.lostKWh + Math.max(0, lost),
    defocusedKWh: s.defocusedKWh + defocused,
  };
}

/** Where a sealed rig store ends up after `hours` with nothing drawing on it. */
export function rigStoreAfterC(storeC: number, sandKg: number, ambientC: number, hours: number): number {
  const kg = Math.max(1, sandKg);
  const tauS = (kg * SAND_CP_KJ_PER_KG_K * 1000) / sandStoreUAWPerK(kg);
  return ambientC + (storeC - ambientC) * Math.exp((-hours * 3600) / tauS);
}

/** Money with thousands separators and no stray decimals. */
export function formatGBP(x: number): string {
  return `£${Math.round(x).toLocaleString("en-GB")}`;
}
