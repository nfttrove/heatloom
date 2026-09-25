import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";
import { loomPlan, DEFAULT_LOOM, formatGBP, type LoomInput } from "./utils/heatloom";
import Calculator from "./components/Calculator";

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
// JSX wraps prose across lines, splits it with {' '} and wraps words in
// inline tags (<em>, <strong>…), so collapse all three. The phrases are the
// old sentences' distinctive wording, so an honest "no field test yet" passes.
const SOURCE = (
  Object.values(
    import.meta.glob(["./components/*.tsx", "./App.tsx", "./utils/heatloom.ts"], { query: "?raw", import: "default", eager: true })
  ).join("\n") as string
)
  .replace(/\{\s*['"`]\s*['"`]\s*\}/g, " ")
  .replace(/<\/?[a-z][a-z0-9]*(?:\s[^>]*)?\/?>/g, "")
  .replace(/\s+/g, " ");

// Known limit: phrase matching cannot tell an honest "no field test yet"
// from a false "UK Field Test Results", so these are the retired sentences'
// distinctive wording, not every way to say them again. New copy still needs
// a human (or reviewer) read against the model.
describe("claims the evidence does not support stay off the page", () => {
  // Each of these was on the live site before the 2026-09 honesty sweep.
  const RETIRED = [
    "Spain Field Test", // no rig has been built; Spain figures are modelled
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
    "Video tutorials and live builds",
    "Solar Thermal Revolution",
    "AI-driven",
    "industrial-grade",
    "Precision-engineered",
    "Comprehensive validation methodology",
    "real-time energy generation",
    "Thermosiphon design eliminates pumps",
    "cheapest component to oversize",
    "runs the open-source firmware", // the loom's firmware is not written yet
    "not published yet",
    "every spare unit", // some spare is still exported when the tank is full
    "In Fini claim registry", // its database was shut down; the registry is offline
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
    for (const h of ["Working at height", "scaffold", "Electricity", "RCD", "Part P", "G98", "switches mains power", "thermostat and cut-out in circuit", "legionella", "60 °C", "mixing valve", "energy cut-out", "tundish", "G3", "Stagnation", "drainback"]) {
      expect(safety).toContain(h);
    }
  });

  it("keeps the markers CI greps the bundle for", () => {
    for (const m of ["The loom decides", "How it works", "Parts list", "Your numbers", "How we got these numbers", "Water hygiene (legionella)"]) {
      expect(SOURCE).toContain(m);
    }
  });

  it("quotes the default build's economics as the model computes them, in every section that states them", () => {
    const e = loomPlan(DEFAULT_LOOM).economics;
    const cost = formatGBP(e.costGBP);
    const saves = formatGBP(e.savingsGBP);
    const pay = e.paybackYears.toFixed(1);
    const hero = section("overview");
    expect(hero).toContain(`${cost} in parts`);
    expect(hero).toContain(`${saves} a year saved`);
    expect(hero).toContain(`${pay} years to pay for itself`);
    expect(hero).toContain(`In a poor year: ${formatGBP(e.pessimisticSavingsGBP)} and ${e.pessimisticPaybackYears.toFixed(1)} years`);
    expect(section("build")).toContain(`${cost} in parts for the ${DEFAULT_LOOM.pvKwp} kWp build`);
    const calc = section("calculator");
    expect(calc).toContain(`Parts ${cost}`);
    expect(calc).toContain(`Saved a year ${saves}`);
    expect(calc).toContain(`Pays for itself in ${pay} years`);
    expect(section("numbers")).toContain(`The default build: ${cost}, saving ${saves} a year — ${pay} years`);
  });

  it("says plainly that the loom's firmware isn't written yet", () => {
    expect(section("build")).toContain("the loom's firmware and wiring diagram are still to be written");
    expect(section("open-source")).toContain("The loom's firmware and wiring diagram");
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

  it("does not link to the In Fini registry, which is offline", () => {
    expect(HTML).not.toContain("in-fini.com/?tab=registry");
  });

  it("opens external links safely", () => {
    for (const m of HTML.matchAll(/<a [^>]*target="_blank"[^>]*>/g)) {
      expect(m[0]).toMatch(/rel="noopener noreferrer"/);
    }
  });

  it("gives every form control a label", () => {
    const controls = [...HTML.matchAll(/<(?:input|select)[^>]*>/g)];
    expect(controls.length).toBe(9); // the calculator: 7 sliders, 2 selects
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

describe("calculator copy in non-default states", () => {
  const render = (initial: Partial<LoomInput>) => toText(renderToString(<Calculator initial={initial} />));

  it("only says the panels fill the tank when, without tubes, they do", () => {
    expect(render({ tubesM2: 3 })).toContain("the panels alone already fill the tank in the sunniest month");
    const noLoom = render({ tubesM2: 3, controller: "none" });
    expect(noLoom).not.toContain("already fill the tank");
    expect(noLoom).toContain("The tubes provide");
    expect(render({ tubesM2: 3, hotWaterKWhPerDay: 12 })).not.toContain("already fill the tank");
  });

  it("names the right extras and the clipping that grows with the array", () => {
    expect(render({ tubesM2: 3 })).toContain("the plumber and G3 installer for the solar cylinder");
    expect(render({})).toContain("a new cylinder if you don't have one");
    const big = render({ pvKwp: 8 });
    expect(big).toContain("G99");
    expect(big).toContain("clipping on bright days, which grows with the array");
    expect(render({ pvKwp: 3.6 })).not.toContain("G99");
  });

  it("shows the share of output the model actually uses, not just the slider", () => {
    for (const initial of [{}, { pvSelfUse: 0.8 }, { pvKwp: 8 }, { pvKwp: 2, pvSelfUse: 0.2 }]) {
      const l = loomPlan({ ...DEFAULT_LOOM, ...initial });
      expect(render(initial)).toContain(`it uses ${Math.round((100 * l.pv.houseKWh) / l.pv.annualKWh)}% of this build's output`);
    }
    const half = loomPlan({ ...DEFAULT_LOOM, pvSelfUse: 0.5 });
    expect(section("numbers")).toContain(`Someone is home in the day (${Math.round((100 * half.pv.houseKWh) / half.pv.annualKWh)}% of the output used at home`);
    expect(section("numbers")).not.toContain("half the output");
  });

  it("renders no broken numbers at the slider extremes", () => {
    for (const initial of [
      { pvKwp: 0.4, pvSelfUse: 0.2, sun: 1, electricKWhPerDay: 2, hotWaterKWhPerDay: 2, tankKWh: 6 },
      { pvKwp: 8, pvSelfUse: 0.8, sun: 6, electricKWhPerDay: 25, hotWaterKWhPerDay: 15, tankKWh: 30, tubesM2: 6 },
      { controller: "none" as const, tubesM2: 0 },
    ]) {
      expect(render(initial)).not.toMatch(/\bNaN\b|\bundefined\b|\bInfinity\b/);
    }
  });
});
