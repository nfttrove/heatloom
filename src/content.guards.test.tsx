import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";
import {
  hybridPlan,
  hybridProductionKWhPerYear,
  DEFAULT_HYBRID,
  REGISTERED_HYBRID_KWH_PER_YEAR,
  formatGBP,
} from "./utils/heatloom";

// The whole page as a visitor's browser receives it, with entities decoded
// so assertions match the words people read.
const HTML = renderToString(<App />);
const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
const toText = (html: string) => decode(html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
const TEXT = toText(HTML);
/** One section's visible text, so a correct number elsewhere can't cover for a stale one here. */
const section = (id: string) => {
  const m = HTML.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`));
  if (!m) throw new Error(`no section #${id}`);
  return toText(m[0]);
};
// Everything that ships, including text that only renders after a click and
// attribute values (titles, aria-labels) that the first render strips.
// JSX wraps prose across lines and splits it with {' '}, so collapse both.
const SOURCE = (
  Object.values(
    import.meta.glob(["./components/*.tsx", "./App.tsx", "./utils/heatloom.ts"], { query: "?raw", import: "default", eager: true })
  ).join("\n") as string
)
  .replace(/\{\s*['"`]\s*['"`]\s*\}/g, " ")
  .replace(/\s+/g, " ");

describe("claims the evidence does not support stay off the page", () => {
  // Each of these was on the live site before the 2026-09 honesty sweep.
  const RETIRED = [
    "Field Test", // no rig has been built; Spain figures are modelled
    "actual field testing",
    "Field Prototype",
    "2.1k", // invented GitHub star count
    "150+", // invented builder count
    "Seasonal Heat Storage", // a house-scale store holds days, not seasons
    "seasonal storage is the unsolved half",
    "only battery cheaper",
    "doesn't catch fire",
    "never degrades",
    "two winter days",
    "30× Cheaper",
    "~£10 per kWh",
    "25+ year",
    "Complete CAD drawings",
    "Video tutorials",
    "Solar Thermal Revolution",
    "AI-driven",
    "industrial-grade",
    "Precision-engineered",
    "Comprehensive validation methodology",
    "real-time energy generation",
    "Thermosiphon design eliminates pumps",
    "cheapest component to oversize",
  ];
  for (const phrase of RETIRED) {
    it(`does not say "${phrase}", rendered or in the shipped source`, () => {
      expect(TEXT.toLowerCase()).not.toContain(phrase.toLowerCase());
      expect(SOURCE.toLowerCase()).not.toContain(phrase.toLowerCase());
    });
  }

  it("renders no broken numbers", () => {
    expect(TEXT).not.toMatch(/\bNaN\b|\bundefined\b|\bInfinity\b/);
  });

  it("formats every pound amount with separators and no stray decimals", () => {
    expect(TEXT).not.toMatch(/£\d{4,}/);
    expect(TEXT).not.toMatch(/£[\d,]+\.\d{3,}/);
  });
});

describe("the page says what it must", () => {
  it("has a safety section covering each major hazard", () => {
    expect(HTML).toContain('id="safety"');
    const safety = section("safety");
    for (const h of ["Concentrated sunlight", "Steam and pressure", "critical point", "Stagnation", "drainback", "Fire:", "autoignition", "Weight and hot surfaces", "Fail-safe defocus without power"]) {
      expect(safety).toContain(h);
    }
  });

  it("keeps the markers CI greps the bundle for", () => {
    // "Loss Budget" renders only after a recommendation, so check the source the bundle is built from.
    for (const m of ["Heat Loom Configurator", "Dark December", "Loss Budget", "The Hybrid", "deleted our own turbine", "numbers are on trial"]) {
      expect(SOURCE).toContain(m);
    }
  });

  it("quotes the default Hybrid's economics as the model computes them, in every section that states them", () => {
    const e = hybridPlan(DEFAULT_HYBRID).economics;
    const pay = e.paybackYears.toFixed(1);
    const pess = e.pessimisticPaybackYears.toFixed(1);
    const saves = formatGBP(e.annualSavingsGBP);
    const hero = section("overview");
    expect(hero).toContain(`${pay}-Year Payback`);
    expect(hero).toContain(`saving about ${saves} a year`);
    expect(hero).toContain(`a ${pay}-year payback, ${pess} in the pessimistic case`);
    const roi = section("roi");
    expect(roi).toContain(`Annual Savings ${saves}`);
    expect(roi).toContain(`Payback Period ${pay} years`);
    expect(roi).toContain(`${pess} in the pessimistic case`);
    const hybrid = section("hybrid");
    expect(hybrid).toContain(`${saves} `);
    expect(hybrid).toContain(`${pay} yr (${pess} yr)`);
    const trial = section("on-trial");
    expect(trial).toContain(`saves about ${saves} a year, a ${pay}-year payback`);
  });

  it("states how far the current model falls below the registered claim", () => {
    const registered = Number(REGISTERED_HYBRID_KWH_PER_YEAR);
    const now = hybridProductionKWhPerYear();
    expect(now).toBeLessThan(registered);
    const pct = Math.round((100 * (registered - now)) / registered);
    expect(TEXT).toContain(`${pct}% below the registered`);
    expect(TEXT).toContain("rev C with the corrected prediction has not been filed");
  });
});

describe("page structure", () => {
  it("has exactly one h1", () => {
    expect(HTML.match(/<h1[\s>]/g)?.length).toBe(1);
  });

  it("every in-page link lands on an element that exists", () => {
    const ids = new Set([...HTML.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const targets = [...HTML.matchAll(/href="#([^"]*)"/g)].map((m) => m[1]);
    expect(targets.length).toBeGreaterThan(5);
    for (const t of targets) expect(ids.has(t), `#${t}`).toBe(true);
  });

  it("has no dead buttons pretending to be links", () => {
    expect(HTML).not.toMatch(/href="#"/);
  });

  it("opens external links safely", () => {
    for (const m of HTML.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) {
      expect(m[0]).toMatch(/rel="noopener noreferrer"/);
    }
  });

  it("gives every form control a label", () => {
    const controls = [...HTML.matchAll(/<(?:input|select)[^>]*>/g)];
    expect(controls.length).toBeGreaterThan(10);
    for (const m of controls) {
      const tag = m[0];
      const id = tag.match(/\sid="([^"]+)"/)?.[1];
      const before = HTML.slice(0, m.index);
      const wrapped = before.lastIndexOf("<label") > before.lastIndexOf("</label>");
      const labelled = /\saria-label="[^"]+"/.test(tag) || (id !== undefined && HTML.includes(`for="${id}"`)) || wrapped;
      expect(labelled, tag.slice(0, 80)).toBe(true);
    }
  });
});
