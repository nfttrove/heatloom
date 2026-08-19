import { describe, it, expect } from "vitest";
import {
  LOSS_CHAIN,
  COLLECTOR_EFFICIENCY,
  SAND_KG_PER_KWH,
  SEASONAL,
  rigOutput,
  recommendRig,
  annualSavingsGBP,
  systemCostGBP,
  lossBudget,
  hybridPlan,
} from "./heatloom";

describe("stated assumptions are internally consistent", () => {
  it("the loss chain multiplies to the headline 60% collector efficiency", () => {
    expect(COLLECTOR_EFFICIENCY).toBeGreaterThan(0.59);
    expect(COLLECTOR_EFFICIENCY).toBeLessThan(0.61);
  });

  it("sand figure matches the Theory panel (11.25, not the 11.5 typo)", () => {
    expect(SAND_KG_PER_KWH).toBe(11.25);
  });
});

describe("rigOutput", () => {
  const r = rigOutput(20, 5); // 20 m², Spain-ish DNI

  it("reproduces the site's headline numbers", () => {
    expect(r.thermalKWhPerDay).toBeCloseTo(5 * 20 * 0.6, 0); // ≈60 (chain product is 0.601)
    expect(r.electricKWhPerDay).toBeCloseTo(60 * 0.18, 0); // ≈10.8
    expect(r.heatKWhPerDay).toBeCloseTo(60 - 10.8, 0); // ≈49.2
    expect(r.sandMassKg).toBeCloseTo(60 * 11.25, -1); // ≈675 kg (±5 for the 0.601 chain)
  });

  it("winter is roughly a third of the annual average", () => {
    expect(r.winterElectricKWhPerDay).toBeCloseTo(
      r.electricKWhPerDay * SEASONAL.winter,
      10
    );
  });

  it("pessimistic case is below central and uses the honest low efficiency", () => {
    expect(r.pessimisticElectricKWhPerDay).toBeLessThan(
      r.electricKWhPerDay * 0.9
    );
    expect(r.pessimisticElectricKWhPerDay).toBeGreaterThan(
      r.electricKWhPerDay * 0.7
    );
  });
});

describe("recommendRig", () => {
  it("winter sizing picks a bigger rig than annual sizing when it matters", () => {
    const annual = recommendRig([10, 20, 30], 8, 5, "annual");
    const winter = recommendRig([10, 20, 30], 8, 5, "winter");
    // 30 m² annual gives 16.2 kWh — covers 8. Winter of even 30 m² is 4.9:
    // nothing covers, so both fall through to the largest rig...
    expect(annual.recommended.areaM2).toBe(20); // 10.8 ≥ 8
    expect(winter.recommended.areaM2).toBe(30); // only the fallback survives December
  });
});

describe("honest economics", () => {
  const rig = rigOutput(20, 5); // 10.8 kWh/day annual, 3.24 winter

  it("never claims savings on electricity the rig cannot cover", () => {
    const s = annualSavingsGBP(8, rig); // wants 8, winter only 3.24
    const naive = 8 * 365 * 0.28;
    expect(s).toBeLessThan(naive);
    // 120×3.24 + 245×8 covered, ×28p
    expect(s).toBeCloseTo((120 * 3.24 + 245 * 8) * 0.28, 0); // 0.3% from the 0.601 chain
  });

  it("full coverage equals the naive number", () => {
    const tiny = rigOutput(10, 5); // 5.4 winter... use a small user
    expect(annualSavingsGBP(1, tiny)).toBeCloseTo(365 * 1 * 0.28, 6);
  });

  it("cost scales with area", () => {
    expect(systemCostGBP(30)).toBe(30 * 350);
  });
});

describe("loss budget", () => {
  it("accounts every kWh of sunlight exactly", () => {
    const b = lossBudget(5, 20);
    expect(b.incidentKWhPerDay).toBe(100);
    expect(b.collectedKWhPerDay).toBeCloseTo(100 * COLLECTOR_EFFICIENCY, 10);
    const totalLost = b.rows.reduce((s, r) => s + r.kwhLost, 0);
    expect(b.collectedKWhPerDay + totalLost).toBeCloseTo(100, 10);
  });

  it("chain rows carry their factor honestly", () => {
    const b = lossBudget(5, 20);
    expect(b.rows).toHaveLength(LOSS_CHAIN.length);
    b.rows.forEach((r, i) =>
      expect(r.kwhOut / r.kwhIn).toBeCloseTo(LOSS_CHAIN[i].factor, 12)
    );
  });
});

describe("hybridPlan", () => {
  const plan = hybridPlan({
    electricKWhPerDay: 8,
    heatKWhPerDay: 30,
    pvKwp: 2,
    collectorM2: 3,
    storeKWh: 40,
    dniAnnual: 3,
  });

  it("sizes the sand store consistently with the module constant", () => {
    expect(plan.thermal.sandMassKg).toBeCloseTo(40 * 11.25, 6); // 450 kg
  });

  it("PV yields UK-sensible numbers with a brutal winter factor", () => {
    expect(plan.pv.annualKWh).toBeCloseTo(2 * 950, 6); // 1,900 kWh/yr
    expect(plan.pv.winterKWhPerDay).toBeCloseTo((2 * 950 / 365) * 0.22, 6); // ≈1.15
    expect(plan.pv.summerKWhPerDay).toBeGreaterThan(8);
  });

  it("coverage never exceeds demand and winter ≤ annual", () => {
    expect(plan.coverage.electricAnnual).toBeLessThanOrEqual(1);
    expect(plan.coverage.heatWinter).toBeLessThanOrEqual(plan.coverage.heatAnnual + 1e-9);
  });

  it("savings are honest: below the naive number", () => {
    expect(plan.economics.annualSavingsGBP).toBeLessThan(plan.economics.naiveSavingsGBP);
  });

  it("UK winter triggers the serious December verdict", () => {
    expect(plan.decemberVerdict.serious).toBe(true);
  });

  it("a desert-sized rig quiets December", () => {
    const big = hybridPlan({
      electricKWhPerDay: 8, heatKWhPerDay: 30,
      pvKwp: 6, collectorM2: 30, storeKWh: 200, dniAnnual: 6,
    });
    expect(big.decemberVerdict.serious).toBe(false);
  });

  it("costs are the sum of parts", () => {
    expect(plan.economics.systemCostGBP).toBeCloseTo(
      2 * 400 + 3 * 300 + 40 * 15, 6
    );
  });
});

describe("sand store cost decomposition", () => {
  const plan = hybridPlan({
    electricKWhPerDay: 8, heatKWhPerDay: 30,
    pvKwp: 2, collectorM2: 3, storeKWh: 40, dniAnnual: 3,
  });

  it("the sand itself is the cheap part", () => {
    expect(plan.thermal.mediaCostGBP).toBeCloseTo(450 * 0.045, 6); // ≈ £20
    expect(plan.thermal.mediaCostGBP).toBeLessThan(plan.thermal.vesselCostGBP);
  });

  it("media + vessel = store, and the ledger still sums to the total", () => {
    expect(plan.thermal.mediaCostGBP + plan.thermal.vesselCostGBP)
      .toBeCloseTo(plan.thermal.storeCostGBP, 6);
    expect(
      plan.pv.costGBP + plan.thermal.costGBP + plan.thermal.storeCostGBP
    ).toBeCloseTo(plan.economics.systemCostGBP, 6);
  });
});
