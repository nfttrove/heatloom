import { describe, it, expect } from "vitest";
import {
  LOSS_CHAIN,
  COLLECTOR_EFFICIENCY,
  HYBRID_LOSS_CHAIN,
  HYBRID_COLLECTOR_EFFICIENCY,
  SAND_KG_PER_KWH,
  HYBRID_SAND_KG_PER_KWH,
  HYBRID_WATER_KG_PER_KWH,
  SEASONAL,
  SOLAR_MONTHLY,
  HEAT_DEMAND_MONTHLY,
  DAYS_IN_MONTH,
  DECEMBER,
  RIG_BOM_TOTAL_GBP,
  COST_GBP_PER_M2,
  STORE_GBP_PER_KWH,
  HEAT_GBP_PER_KWH,
  LITHIUM_GBP_PER_KWH,
  DEFAULT_HYBRID,
  REGISTERED_HYBRID_KWH_PER_YEAR,
  sandKgPerKWh,
  storeHeatLoss,
  rigOutput,
  recommendRig,
  annualSavingsGBP,
  systemCostGBP,
  lossBudget,
  hybridPlan,
  hybridProductionKWhPerYear,
  formatGBP,
  usefulHeatHalfLifeDays,
  storeRetention,
  WATER_STORE_GBP_PER_KWH,
  SAND_STORE_GBP_PER_KWH,
  HOUSE_TIERS,
  ELECTRICITY_GBP_PER_KWH,
  HEAT_SOURCES,
  GAS_GBP_PER_KWH,
  BOILER_EFFICIENCY,
  STORE_U_W_PER_M2K,
  RIG_STORE_U_W_PER_M2K,
  PV_KWH_PER_KWP_YEAR,
  HYBRID_EFFICIENCY_RANGE,
  HEAT_FLOW_START,
  heatFlowStep,
  hybridStoreTemperatureC,
  HYBRID_COLLECT_EFFICIENCY,
  RIG_COLLECT_EFFICIENCY,
  RIG_STORE_TOP_C,
  RIG_STORE_DELTA_T_K,
  DEMO_DAY_START_MIN,
  DEMO_DAY_END_MIN,
  rigDemoMinute,
  rigStoreAfterC,
  sandStoreUAWPerK,
  SAND_CP_KJ_PER_KG_K,
  type HeatFlowParams,
  type RigDemoParams,
  type RigDemoState,
} from "./heatloom";

const weightedMean = (shape: number[]) =>
  shape.reduce((s, v, i) => s + v * DAYS_IN_MONTH[i], 0) / 365;

describe("stated assumptions are internally consistent", () => {
  it("the trough loss chain multiplies to the headline 60% collector efficiency", () => {
    expect(COLLECTOR_EFFICIENCY).toBeGreaterThan(0.59);
    expect(COLLECTOR_EFFICIENCY).toBeLessThan(0.61);
  });

  it("the tubes get their own chain, with no mirror or tracking stage", () => {
    expect(HYBRID_LOSS_CHAIN.some((s) => /mirror|tracking/i.test(s.label))).toBe(false);
    expect(HYBRID_COLLECTOR_EFFICIENCY).toBeGreaterThan(0.3);
    expect(HYBRID_COLLECTOR_EFFICIENCY).toBeLessThan(0.45);
  });

  it("sand per kWh follows from specific heat and the store's temperature swing", () => {
    expect(SAND_KG_PER_KWH).toBe(11.25); // 3600 / (0.8 × 400 K): the rig's generous swing
    expect(sandKgPerKWh(230)).toBeCloseTo(19.6, 1); // charged only to the Build Guide's 250 °C
    expect(HYBRID_SAND_KG_PER_KWH).toBeCloseTo(60, 6); // sand for comparison, 120 → 45 °C
    // The Hybrid's water store, 85 → 45 °C: 3600 / (4.18 × 40) ≈ 21.5 kg/kWh,
    // under half the sand even though sand gets the wider swing.
    expect(HYBRID_WATER_KG_PER_KWH).toBeCloseTo(3600 / (4.18 * 40), 12);
    expect(HYBRID_WATER_KG_PER_KWH).toBeCloseTo(21.53, 2);
    expect(HYBRID_SAND_KG_PER_KWH / HYBRID_WATER_KG_PER_KWH).toBeGreaterThan(2.5);
  });

  it("monthly shapes average to one over the year", () => {
    expect(weightedMean(SOLAR_MONTHLY)).toBeCloseTo(1, 12);
    expect(weightedMean(HEAT_DEMAND_MONTHLY)).toBeCloseTo(1, 12);
    expect(SOLAR_MONTHLY[DECEMBER]).toBeLessThan(0.35);
    // Heat is wanted most when the sun is least.
    expect(HEAT_DEMAND_MONTHLY[DECEMBER]).toBeGreaterThan(1.5);
  });
});

describe("the store holds days, not seasons", () => {
  it("a 40 kWh sand store (the comparison): cylinder geometry, time constant and half-lives, pinned", () => {
    const l = storeHeatLoss(40, 75);
    expect(l.massKg).toBeCloseTo(2400, 6);
    expect(l.volumeM3).toBeCloseTo(1.5, 12);
    // h = d: V = 2πr³, area = 2πr² (ends) + 2πr·2r (side) = 6πr²
    const r = Math.cbrt(1.5 / (2 * Math.PI));
    expect(l.areaM2).toBeCloseTo(6 * Math.PI * r * r, 12);
    expect(l.areaM2).toBeCloseTo(7.254, 3);
    // τ = C / UA = 2400 kg × 800 J/kg·K / (0.25 W/m²K × area)
    expect(l.timeConstantDays).toBeCloseTo((2400 * 800) / (0.25 * l.areaM2) / 86400, 12);
    expect(l.timeConstantDays).toBeCloseTo(12.25, 2);
    expect(l.halfLifeDays).toBeCloseTo(l.timeConstantDays * Math.LN2, 12);
    // Useful heat (above 45 °C, from 120 °C, 10 °C around it) halves sooner.
    const useful = usefulHeatHalfLifeDays(l.timeConstantDays, 120);
    expect(useful).toBeCloseTo(-l.timeConstantDays * Math.log((37.5 + 35) / 110), 12);
    expect(useful).toBeCloseTo(5.11, 2);
    const sand = storeRetention(40, "sand");
    expect(sand.massKg).toBeCloseTo(l.massKg, 9);
    expect(sand.timeConstantDays).toBeCloseTo(l.timeConstantDays, 9);
    expect(sand.usefulHalfLifeDays).toBeCloseTo(useful, 9);
    // After three months, essentially nothing is left.
    expect(Math.exp(-90 / l.timeConstantDays)).toBeLessThan(0.01);
  });

  it("the default water store: geometry, time constant, useful half-life and loss, pinned", () => {
    const w = storeRetention(12, "water");
    expect(w.massKg).toBeCloseTo((12 * 3600) / (4.18 * 40), 9); // ≈ 258 litres
    const r = Math.cbrt(w.massKg / 1000 / (2 * Math.PI));
    expect(w.areaM2).toBeCloseTo(6 * Math.PI * r * r, 12);
    expect(w.timeConstantDays).toBeCloseTo((w.massKg * 4180) / (0.25 * w.areaM2) / 86400, 9);
    expect(w.timeConstantDays).toBeCloseTo(22.27, 2);
    // From 85 °C, useful down to 45 °C, 10 °C around it.
    expect(w.usefulHalfLifeDays).toBeCloseTo(-w.timeConstantDays * Math.log((20 + 35) / 75), 9);
    expect(w.usefulHalfLifeDays).toBeCloseTo(6.91, 2);
    expect(w.lossWhenFullW).toBeCloseTo(0.25 * w.areaM2 * 75, 9);
    expect(hybridPlan(DEFAULT_HYBRID).thermal.storeHalfLifeDays).toBe(w.usefulHalfLifeDays);
  });

  it("water keeps the Hybrid's heat about twice as long as sand, with the same insulation", () => {
    for (const kWh of [12, 40, 75]) {
      const w = storeRetention(kWh, "water");
      const s = storeRetention(kWh, "sand");
      expect(w.usefulHalfLifeDays / s.usefulHalfLifeDays).toBeGreaterThan(1.9);
      expect(w.lossWhenFullW).toBeLessThan(s.lossWhenFullW / 2);
      expect(w.massKg).toBeLessThan(s.massKg / 2.5);
    }
  });

  it("the useful half-life is what the flow toy's store actually does", () => {
    const tauH = storeRetention(40, "water").timeConstantDays * 24;
    let s = { ...HEAT_FLOW_START, storedKWh: 40 };
    const dt = 0.01;
    while (s.storedKWh > 20) s = heatFlowStep(s, { sunKWPerM2: 0, areaM2: 3, demandKW: 0, capacityKWh: 40 }, dt);
    expect(s.hours / 24).toBeCloseTo(usefulHeatHalfLifeDays(tauH / 24), 1);
  });

  it("is not 'the only battery cheaper than the energy it stores'", () => {
    // Capacity cost ÷ the value of one charge of heat: at one cycle a year
    // (seasonal) the store would take over a century to repay.
    expect(STORE_GBP_PER_KWH / HEAT_GBP_PER_KWH).toBeGreaterThan(100);
    expect(STORE_GBP_PER_KWH).toBe(WATER_STORE_GBP_PER_KWH);
    expect(LITHIUM_GBP_PER_KWH / STORE_GBP_PER_KWH).toBeCloseTo(4, 6);
  });
});

describe("rigOutput (the retired trough + ORC design)", () => {
  const r = rigOutput(20, 5); // 20 m², Spain-ish DNI

  it("reproduces the model's numbers", () => {
    expect(r.thermalKWhPerDay).toBeCloseTo(5 * 20 * 0.6, 0); // ≈60 (chain product is 0.601)
    expect(r.electricKWhPerDay).toBeCloseTo(60 * 0.18, 0); // ≈10.8
    expect(r.rejectHeatKWhPerDay).toBeCloseTo(60 - 10.8, 0); // low-grade, not heating
    expect(r.sandMassKg).toBeCloseTo(60 * 11.25, -1); // ≈675 kg
  });

  it("December uses the monthly solar shape", () => {
    expect(r.winterElectricKWhPerDay).toBeCloseTo(r.electricKWhPerDay * SOLAR_MONTHLY[DECEMBER], 10);
    expect(SEASONAL.winter).toBe(SOLAR_MONTHLY[DECEMBER]);
  });

  it("pessimistic case is below central and uses the honest low efficiency", () => {
    expect(r.pessimisticElectricKWhPerDay).toBeLessThan(r.electricKWhPerDay * 0.9);
    expect(r.pessimisticElectricKWhPerDay).toBeGreaterThan(r.electricKWhPerDay * 0.7);
  });

  it("is costed from the Build Guide's own bill of materials", () => {
    expect(RIG_BOM_TOTAL_GBP).toBe(7900);
    expect(COST_GBP_PER_M2).toBeCloseTo(7900 / 3, 6);
    expect(systemCostGBP(30)).toBeCloseTo(30 * 7900 / 3, 6);
    // At that cost the rig takes decades to repay, which is why it was retired.
    expect(systemCostGBP(20) / annualSavingsGBP(8, r)).toBeGreaterThan(50);
  });
});

describe("recommendRig", () => {
  it("winter sizing picks a bigger rig, and says when nothing meets the target", () => {
    const annual = recommendRig([10, 20, 30], 8, 5, "annual");
    const winter = recommendRig([10, 20, 30], 8, 5, "winter");
    expect(annual.recommended.areaM2).toBe(20);
    expect(annual.meetsTarget).toBe(true);
    expect(winter.recommended.areaM2).toBe(30);
    expect(winter.meetsTarget).toBe(false); // December of even 30 m² falls short
  });
});

describe("honest rig economics", () => {
  const rig = rigOutput(20, 5);

  it("never claims savings on electricity the rig cannot cover, month by month", () => {
    const s = annualSavingsGBP(8, rig);
    const expected = SOLAR_MONTHLY.reduce(
      (sum, f, m) => sum + DAYS_IN_MONTH[m] * Math.min(8, rig.electricKWhPerDay * f), 0
    ) * ELECTRICITY_GBP_PER_KWH;
    expect(s).toBeCloseTo(expected, 6);
    expect(s).toBeLessThan(8 * 365 * ELECTRICITY_GBP_PER_KWH);
  });

  it("full coverage equals the naive number", () => {
    const tiny = rigOutput(10, 5);
    expect(annualSavingsGBP(0.5, tiny)).toBeCloseTo(365 * 0.5 * ELECTRICITY_GBP_PER_KWH, 6);
  });
});

describe("loss budget", () => {
  it("accounts every kWh of sunlight exactly, for either chain", () => {
    for (const chain of [LOSS_CHAIN, HYBRID_LOSS_CHAIN]) {
      const b = lossBudget(5, 20, chain);
      expect(b.incidentKWhPerDay).toBe(100);
      const totalLost = b.rows.reduce((s, r) => s + r.kwhLost, 0);
      expect(b.collectedKWhPerDay + totalLost).toBeCloseTo(100, 10);
      b.rows.forEach((r, i) => expect(r.kwhOut / r.kwhIn).toBeCloseTo(chain[i].factor, 12));
    }
    expect(lossBudget(5, 20).collectedKWhPerDay).toBeCloseTo(100 * COLLECTOR_EFFICIENCY, 10);
  });
});

describe("hybridPlan", () => {
  const plan = hybridPlan(DEFAULT_HYBRID);

  it("sizes the water store for its swing, with sand alongside for comparison", () => {
    expect(plan.thermal.storeMassKg).toBeCloseTo(12 * HYBRID_WATER_KG_PER_KWH, 9); // ≈ 258 L
    expect(plan.thermal.sandComparison.massKg).toBeCloseTo(12 * 60, 6);
    // Two days of the best month's collection, and the store never limits coverage.
    expect(plan.thermal.storeDaysOfPeakCollection).toBeGreaterThan(1.5);
    expect(plan.thermal.storeLimitedKWh).toBe(0);
  });

  it("PV yields UK-sensible numbers with a brutal December", () => {
    expect(plan.pv.annualKWh).toBeCloseTo(2 * 950, 6);
    expect(plan.pv.winterKWhPerDay).toBeCloseTo((1900 / 365) * SOLAR_MONTHLY[DECEMBER], 6);
    // Half used at home by default: the rest is exported for nothing (no SEG for DIY).
    expect(plan.pv.usedKWh).toBeLessThanOrEqual(0.5 * 1900 + 1e-9);
  });

  it("no month uses more heat than it collects — the store creates no December energy", () => {
    for (const m of plan.monthly) {
      expect(m.heatUsedKWhPerDay).toBeLessThanOrEqual(m.heatCollectedKWhPerDay + 1e-9);
      expect(m.heatUsedKWhPerDay).toBeLessThanOrEqual(m.heatDemandKWhPerDay + 1e-9);
    }
    const dec = plan.monthly[DECEMBER];
    expect(plan.coverage.heatWinter).toBeCloseTo(dec.heatUsedKWhPerDay / dec.heatDemandKWhPerDay, 10);
    // Store size changes cost, never coverage.
    const bigStore = hybridPlan({ ...DEFAULT_HYBRID, storeKWh: 400 });
    expect(bigStore.coverage).toEqual(plan.coverage);
    expect(bigStore.economics.systemCostGBP).toBeGreaterThan(plan.economics.systemCostGBP);
  });

  it("coverage never exceeds demand and December is the worst", () => {
    expect(plan.coverage.electricAnnual).toBeLessThanOrEqual(1);
    expect(plan.coverage.heatAnnual).toBeLessThanOrEqual(1);
    expect(plan.coverage.heatWinter).toBeLessThan(plan.coverage.heatAnnual);
    expect(plan.coverage.electricWinter).toBeLessThan(plan.coverage.electricAnnual);
  });

  it("savings are honest for every tier: below naive, pessimistic below central", () => {
    for (const p of [DEFAULT_HYBRID, { ...DEFAULT_HYBRID, pvKwp: 4, collectorM2: 10, storeKWh: 100 }, { ...DEFAULT_HYBRID, pvKwp: 4, collectorM2: 20, storeKWh: 150 }]) {
      const e = hybridPlan(p).economics;
      expect(e.annualSavingsGBP).toBeLessThan(e.naiveSavingsGBP);
      expect(e.pessimisticSavingsGBP).toBeLessThan(e.annualSavingsGBP);
      expect(e.pessimisticPaybackYears).toBeGreaterThan(e.paybackYears);
      expect(e.electricSavingsGBP + e.heatSavingsGBP).toBeCloseTo(e.annualSavingsGBP, 6);
    }
  });

  it("self-use and the heat being displaced move the payback, as the page says", () => {
    const all = hybridPlan({ ...DEFAULT_HYBRID, pvSelfUse: 1 });
    expect(all.economics.annualSavingsGBP).toBeGreaterThan(plan.economics.annualSavingsGBP);
    const electricHeat = hybridPlan({ ...DEFAULT_HYBRID, heatSource: "electric" });
    expect(electricHeat.economics.heatSavingsGBP).toBeCloseTo(
      plan.economics.heatSavingsGBP * (ELECTRICITY_GBP_PER_KWH / HEAT_SOURCES.gas.gbpPerKWh), 6);
    // Against gas, PV earns most of the money, and the heat half pays back
    // several times more slowly than the panels.
    const e = plan.economics;
    expect(e.electricSavingsGBP).toBeGreaterThan(e.heatSavingsGBP);
    expect(e.thermalCostGBP / e.heatSavingsGBP).toBeGreaterThan(3 * (e.pvCostGBP / e.electricSavingsGBP));
  });

  it("UK winter triggers the serious December verdict", () => {
    expect(plan.decemberVerdict.serious).toBe(true);
  });

  it("a very large, sunny rig quiets December", () => {
    const big = hybridPlan({
      electricKWhPerDay: 8, heatKWhPerDay: 30,
      pvKwp: 60, collectorM2: 100, storeKWh: 200, dniAnnual: 6, pvSelfUse: 1,
    });
    expect(big.decemberVerdict.serious).toBe(false);
  });

  it("costs are the sum of parts, including one-off thermal balance of plant", () => {
    expect(plan.economics.systemCostGBP).toBeCloseTo(2 * 550 + 3 * 300 + 12 * 75 + 500, 6);
    expect(plan.economics.pvCostGBP + plan.economics.thermalCostGBP).toBeCloseTo(plan.economics.systemCostGBP, 6);
  });

  it("prices the store at the sourced cylinder figure; sand's floor is kept only to compare", () => {
    expect(plan.thermal.storeCostGBP).toBeCloseTo(12 * WATER_STORE_GBP_PER_KWH, 9);
    expect(plan.thermal.sandComparison.costGBP).toBeCloseTo(12 * SAND_STORE_GBP_PER_KWH, 9);
  });

  it("every house tier's water store holds about two days of its best month and never limits coverage", () => {
    for (const t of HOUSE_TIERS) {
      const q = hybridPlan({ ...DEFAULT_HYBRID, pvKwp: t.pvKwp, collectorM2: t.collectorM2, storeKWh: t.storeKWh });
      expect(q.thermal.storeDaysOfPeakCollection).toBeGreaterThan(1.8);
      expect(q.thermal.storeDaysOfPeakCollection).toBeLessThan(2.5);
      expect(q.thermal.storeLimitedKWh).toBe(0);
    }
  });
});

describe("the registered claim against today's model", () => {
  it("rev A/B committed 3874.40 kWh/yr; the corrected model predicts less", () => {
    expect(REGISTERED_HYBRID_KWH_PER_YEAR).toBe("3874.40");
    const now = hybridProductionKWhPerYear();
    expect(now).toBeLessThan(3874.4);
    expect(now).toBeGreaterThan(3000);
  });
});

describe("formatGBP", () => {
  it("rounds to whole pounds with separators", () => {
    expect(formatGBP(657.851)).toBe("£658");
    expect(formatGBP(10950)).toBe("£10,950");
  });
});

describe("heat-flow toy (Energy Flow panel)", () => {
  const P: HeatFlowParams = { sunKWPerM2: 0.6, areaM2: 3, demandKW: 0.5, capacityKWh: 40 };
  const run = (p: HeatFlowParams, steps: number, dt = 0.05) => {
    let s = HEAT_FLOW_START;
    for (let i = 0; i < steps; i++) s = heatFlowStep(s, p, dt);
    return s;
  };

  it("the books balance: collected = delivered + lost + dumped + stored", () => {
    for (const p of [P, { ...P, sunKWPerM2: 1, areaM2: 20, demandKW: 0 }, { ...P, sunKWPerM2: 0 }]) {
      const s = run(p, 2000);
      expect(s.collectedKWh).toBeCloseTo(s.deliveredKWh + s.lostKWh + s.dumpedKWh + s.storedKWh, 9);
      expect(s.storedKWh).toBeGreaterThanOrEqual(0);
      expect(s.storedKWh).toBeLessThanOrEqual(p.capacityKWh);
    }
  });

  it("collects through the tube chain without double-counting the store", () => {
    expect(HYBRID_COLLECT_EFFICIENCY).toBeCloseTo(HYBRID_COLLECTOR_EFFICIENCY / 0.9, 12);
    const s = heatFlowStep(HEAT_FLOW_START, { ...P, demandKW: 0 }, 1);
    expect(s.collectedKWh).toBeCloseTo(0.6 * 3 * HYBRID_COLLECT_EFFICIENCY, 12);
  });

  it("no sun and no demand: a full store decays with the storeRetention time constant", () => {
    const full = { ...HEAT_FLOW_START, storedKWh: 40 };
    const tauH = storeRetention(40, "water").timeConstantDays * 24;
    const s = heatFlowStep(full, { ...P, sunKWPerM2: 0, demandKW: 0, ambientC: 45 }, 1);
    // With ambient at the useful floor, useful heat decays exactly as C/UA predicts.
    expect(s.lostKWh).toBeCloseTo(40 / tauH, 9);
    expect(hybridStoreTemperatureC(40, 40)).toBe(85);
    expect(hybridStoreTemperatureC(0, 40)).toBe(45);
  });

  it("with no sun the store runs out and demand goes unmet — it makes nothing", () => {
    const s = run({ ...P, sunKWPerM2: 0 }, 400);
    expect(s.collectedKWh).toBe(0);
    expect(s.deliveredKWh).toBe(0);
    expect(s.unmetKWh).toBeCloseTo(0.5 * 0.05 * 400, 9);
  });
});

describe("rig demo (the retired design's day)", () => {
  const P: RigDemoParams = {
    dniKWhPerM2Day: 6,
    areaM2: 10,
    sandKg: 1500,
    ambientC: 20,
    orcOn: true,
    orcEfficiency: 0.18,
    dispatchAboveC: 150,
    dispatchFraction: 0.6,
  };
  const START: RigDemoState = { minute: DEMO_DAY_START_MIN, storeC: 50, collectedKWh: 0, electricKWh: 0, rejectKWh: 0, lostKWh: 0, defocusedKWh: 0 };
  const day = (p: RigDemoParams) => {
    let s = START;
    while (s.minute < DEMO_DAY_END_MIN) s = rigDemoMinute(s, p);
    return s;
  };
  const kWhPerK = (kg: number) => (kg * SAND_CP_KJ_PER_KG_K) / 3600;

  it("a whole day collects DNI × area × the chain without its storage stage", () => {
    expect(RIG_COLLECT_EFFICIENCY).toBeCloseTo(COLLECTOR_EFFICIENCY / 0.9, 12);
    expect(day(P).collectedKWh).toBeCloseTo(6 * 10 * RIG_COLLECT_EFFICIENCY, 2);
  });

  it("energy balances, including the ORC's reject heat and defocusing at the top", () => {
    for (const p of [P, { ...P, orcOn: false }, { ...P, dniKWhPerM2Day: 8, areaM2: 60, sandKg: 300 }]) {
      const s = day(p);
      const stored = (s.storeC - START.storeC) * kWhPerK(p.sandKg);
      expect(s.collectedKWh).toBeCloseTo(stored + s.lostKWh + s.electricKWh + s.rejectKWh + s.defocusedKWh, 6);
      expect(s.storeC).toBeLessThanOrEqual(RIG_STORE_TOP_C);
    }
    expect(day({ ...P, dniKWhPerM2Day: 8, areaM2: 60, sandKg: 300 }).defocusedKWh).toBeGreaterThan(0);
  });

  it("the ORC turns only its stated share of the diverted heat into electricity", () => {
    const s = day(P);
    expect(s.electricKWh / (s.electricKWh + s.rejectKWh)).toBeCloseTo(0.18, 9);
    expect(day({ ...P, orcOn: false }).electricKWh).toBe(0);
  });

  it("overnight loss agrees with the hold test's time constant", () => {
    const kg = 1500;
    const tauDays = storeHeatLoss(kg / 11.25, RIG_STORE_DELTA_T_K, RIG_STORE_U_W_PER_M2K).timeConstantDays;
    const after = rigStoreAfterC(320, kg, 20, 10);
    expect(after).toBeCloseTo(20 + 300 * Math.exp(-10 / 24 / tauDays), 9);
    // Hot mineral wool conducts about twice as well as cold: U 0.5, not 0.25.
    expect(sandStoreUAWPerK(kg)).toBeCloseTo(2 * sandStoreUAWPerK(kg, STORE_U_W_PER_M2K), 12);
    expect(sandStoreUAWPerK(kg)).toBeLessThan(3); // about 2.7 W/K, not the old hard-coded 18
  });
});

describe("review round: pinned behaviour", () => {
  // Large demand so every collected or generated kWh is used: savings are then
  // proportional to output, and the scenarios can be compared exactly.
  const hungry = { ...DEFAULT_HYBRID, electricKWhPerDay: 1000, heatKWhPerDay: 10000 };

  it("the pessimistic case is −10% sun and the low tube efficiency, exactly", () => {
    const heatOnly = hybridPlan({ ...hungry, pvKwp: 0 }).economics;
    expect(heatOnly.pessimisticSavingsGBP / heatOnly.annualSavingsGBP).toBeCloseTo(
      (0.9 * HYBRID_EFFICIENCY_RANGE.low) / HYBRID_COLLECTOR_EFFICIENCY, 9);
    const pvOnly = hybridPlan({ ...hungry, collectorM2: 0 }).economics;
    expect(pvOnly.pessimisticSavingsGBP / pvOnly.annualSavingsGBP).toBeCloseTo(0.9, 9);
  });

  it("PV output follows the sunshine input", () => {
    expect(hybridPlan(DEFAULT_HYBRID).pv.annualKWh).toBeCloseTo(2 * PV_KWH_PER_KWP_YEAR, 9);
    expect(hybridPlan({ ...DEFAULT_HYBRID, dniAnnual: 1.5 }).pv.annualKWh).toBeCloseTo(PV_KWH_PER_KWP_YEAR, 9);
  });

  it("a store smaller than a day's collection limits heat used; beyond that, size adds nothing", () => {
    const base = { ...DEFAULT_HYBRID, collectorM2: 40, heatKWhPerDay: 100 };
    const tiny = hybridPlan({ ...base, storeKWh: 10 });
    const ample = hybridPlan({ ...base, storeKWh: 150 });
    const huge = hybridPlan({ ...base, storeKWh: 300 });
    expect(tiny.thermal.storeDaysOfPeakCollection).toBeLessThan(1);
    expect(tiny.thermal.usedKWh).toBeLessThan(ample.thermal.usedKWh);
    expect(huge.thermal.usedKWh).toBe(ample.thermal.usedKWh);
    for (const m of tiny.monthly) expect(m.heatUsedKWhPerDay).toBeLessThanOrEqual(10 + 1e-9);
  });

  it("heat prices come from the sourced fuel prices", () => {
    expect(HEAT_SOURCES.gas.gbpPerKWh).toBeCloseTo(GAS_GBP_PER_KWH / BOILER_EFFICIENCY, 12);
    expect(HEAT_SOURCES.heatPump.gbpPerKWh).toBeCloseTo(ELECTRICITY_GBP_PER_KWH / 3, 12);
    expect(HEAT_SOURCES.electric.gbpPerKWh).toBe(ELECTRICITY_GBP_PER_KWH);
    expect(HEAT_GBP_PER_KWH).toBe(HEAT_SOURCES.gas.gbpPerKWh);
  });

  it("the filed Medium Pilot value still matches the model (if this fails, file a revision; don't edit the claim)", () => {
    const pilot = rigOutput(20, 5);
    expect(((pilot.electricKWhPerDay / 24) * 1000).toFixed(3)).toBe("450.775");
  });
});

describe("recheck round: copy conditions follow the model", () => {
  it("storeLimitedKWh is zero when a small store doesn't bind, positive when it does", () => {
    const notBinding = hybridPlan({ ...DEFAULT_HYBRID, heatKWhPerDay: 10, collectorM2: 20, storeKWh: 20 });
    expect(notBinding.thermal.storeDaysOfPeakCollection).toBeLessThan(1);
    expect(notBinding.thermal.storeLimitedKWh).toBe(0);
    expect(notBinding.thermal.usedKWh).toBe(hybridPlan({ ...DEFAULT_HYBRID, heatKWhPerDay: 10, collectorM2: 20, storeKWh: 300 }).thermal.usedKWh);
    const binding = hybridPlan({ ...DEFAULT_HYBRID, heatKWhPerDay: 100, collectorM2: 40, storeKWh: 10 });
    const ample = hybridPlan({ ...DEFAULT_HYBRID, heatKWhPerDay: 100, collectorM2: 40, storeKWh: 300 });
    expect(binding.thermal.storeLimitedKWh).toBeCloseTo(ample.thermal.usedKWh - binding.thermal.usedKWh, 6);
  });

  it("the December verdict says when the store is what limits it, and only names what stays", () => {
    const limited = hybridPlan({ electricKWhPerDay: 8, heatKWhPerDay: 20, pvKwp: 10, collectorM2: 40, storeKWh: 20, dniAnnual: 5, pvSelfUse: 1 });
    const free = hybridPlan({ electricKWhPerDay: 8, heatKWhPerDay: 20, pvKwp: 10, collectorM2: 40, storeKWh: 300, dniAnnual: 5, pvSelfUse: 1 });
    expect(limited.coverage.heatWinter).toBeLessThan(free.coverage.heatWinter);
    expect(limited.decemberVerdict.text).toContain("store's size limits");
    expect(free.decemberVerdict.text).not.toContain("store's size limits");
    for (const v of [limited, free]) {
      if (v.coverage.electricWinter >= 1) expect(v.decemberVerdict.text).not.toMatch(/the grid/i);
      if (v.coverage.heatWinter < 1) expect(v.decemberVerdict.text).toMatch(/the boiler/i);
    }
  });
});

describe("the verdict names what actually heats the house", () => {
  it("says heat pump or electric heating, not boiler, when those are selected", () => {
    expect(hybridPlan({ ...DEFAULT_HYBRID, heatSource: "heatPump" }).decemberVerdict.text).toContain("the heat pump");
    expect(hybridPlan({ ...DEFAULT_HYBRID, heatSource: "electric" }).decemberVerdict.text).toContain("the electric heating");
    expect(hybridPlan({ ...DEFAULT_HYBRID, heatSource: "heatPump" }).decemberVerdict.text).not.toContain("boiler");
    expect(hybridPlan(DEFAULT_HYBRID).decemberVerdict.text).toContain("the boiler");
  });
});
