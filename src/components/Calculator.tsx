import { useState } from 'react';
import { Home, Droplets, PlugZap, PoundSterling, Sun } from 'lucide-react';
import {
  loomPlan,
  DEFAULT_LOOM,
  HEAT_SOURCES,
  G98_LIMIT_KW,
  HYBRID_WATER_KG_PER_KWH,
  ELECTRICITY_GBP_PER_KWH,
  formatGBP,
  type Controller,
  type HeatSource,
  type LoomInput,
} from '../utils/heatloom';

const kwh = (x: number) => Math.round(x).toLocaleString('en-GB');
const pct = (x: number) => `${Math.round(x * 100)}%`;
const years = (x: number) => (isFinite(x) && x < 100 ? `${x.toFixed(1)} years` : 'over 100 years');

const CONTROLLERS: Array<{ v: Controller; label: string }> = [
  { v: 'diy', label: 'The loom (DIY)' },
  { v: 'bought', label: 'A bought diverter' },
  { v: 'none', label: 'None — panels only' },
];

function Slider({
  id, label, value, min, max, step, display, hint, onChange,
}: { id: string; label: string; value: number; min: number; max: number; step: number; display: string; hint?: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2 gap-3">
        <label htmlFor={id} className="font-bold text-gray-900">{label}</label>
        <span className="font-mono font-semibold text-orange-600 whitespace-nowrap">{display}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-orange-600" />
      {hint && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}

export default function Calculator() {
  const [cfg, setCfg] = useState<LoomInput>(DEFAULT_LOOM);
  const set = (patch: Partial<LoomInput>) => setCfg((c) => ({ ...c, ...patch }));
  const plan = loomPlan(cfg);
  const e = plan.economics;
  const noTubes = cfg.tubesM2 > 0 ? loomPlan({ ...cfg, tubesM2: 0 }) : plan;
  const tubesAdd = e.savingsGBP - noTubes.economics.savingsGBP;
  const g98Panels = cfg.pvKwp > G98_LIMIT_KW;
  const sunTotal = plan.pv.annualKWh;

  return (
    <section id="calculator" className="py-24 bg-gradient-to-br from-slate-50 to-orange-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Your numbers</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Move the sliders to match your home. Every figure comes from the same tested model as the rest of this page.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Your home</h3>
            <Slider id="calc-electric" label="Electricity use" value={cfg.electricKWhPerDay} min={2} max={25} step={1}
              display={`${cfg.electricKWhPerDay} kWh/day`} hint="A typical UK home uses about 7–8 kWh a day."
              onChange={(v) => set({ electricKWhPerDay: v })} />
            <Slider id="calc-hotwater" label="Hot water use" value={cfg.hotWaterKWhPerDay} min={2} max={15} step={0.5}
              display={`${cfg.hotWaterKWhPerDay} kWh/day`} hint="About 6 for a family of three or four."
              onChange={(v) => set({ hotWaterKWhPerDay: v })} />
            <div>
              <label htmlFor="calc-heat" className="block font-bold text-gray-900 mb-2">What heats your water now</label>
              <select id="calc-heat" value={cfg.heatSource} onChange={(ev) => set({ heatSource: ev.target.value as HeatSource })}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white">
                {(Object.keys(HEAT_SOURCES) as HeatSource[]).map((k) => (
                  <option key={k} value={k}>{HEAT_SOURCES[k].label} — about {(HEAT_SOURCES[k].gbpPerKWh * 100).toFixed(1)}p per kWh of heat</option>
                ))}
              </select>
            </div>
            <Slider id="calc-sun" label="Sunshine (yearly mean)" value={cfg.sun} min={1} max={6} step={0.5}
              display={`${cfg.sun} kWh/m²/day`} hint="Southern England ≈ 3; Scotland ≈ 2.5. Hotter, sunnier sites lose more to panel heat, so read high settings as optimistic."
              onChange={(v) => set({ sun: v })} />

            <h3 className="text-2xl font-bold text-gray-900 pt-2">The build</h3>
            <Slider id="calc-pv" label="Solar panels" value={cfg.pvKwp} min={0.4} max={8} step={0.4}
              display={`${cfg.pvKwp.toFixed(1)} kWp`} hint={`${Math.round((cfg.pvKwp * 1000) / 400)} × 400 W panels, about ${Math.round((cfg.pvKwp * 1000) / 400) * 2} m² of roof.`}
              onChange={(v) => set({ pvKwp: Math.round(v * 10) / 10 })} />
            <Slider id="calc-selfuse" label="Share used as it's made" value={cfg.pvSelfUse} min={0.2} max={0.8} step={0.05}
              display={pct(cfg.pvSelfUse)} hint="Higher if someone is home in the day; 30–40% is typical without a battery."
              onChange={(v) => set({ pvSelfUse: v })} />
            <div>
              <label htmlFor="calc-controller" className="block font-bold text-gray-900 mb-2">Sending the spare to the tank</label>
              <select id="calc-controller" value={cfg.controller} onChange={(ev) => set({ controller: ev.target.value as Controller })}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white">
                {CONTROLLERS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
              </select>
            </div>
            <Slider id="calc-tank" label="Hot-water tank" value={cfg.tankKWh} min={6} max={30} step={1}
              display={`${cfg.tankKWh} kWh`} hint={`About ${Math.round(cfg.tankKWh * HYBRID_WATER_KG_PER_KWH)} litres.`}
              onChange={(v) => set({ tankKWh: v })} />
            <Slider id="calc-tubes" label="Add-on: solar tubes" value={cfg.tubesM2} min={0} max={6} step={1}
              display={cfg.tubesM2 === 0 ? 'none' : `${cfg.tubesM2} m²`} onChange={(v) => set({ tubesM2: v })} />
          </div>

          <div className="xl:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow border border-gray-100">
                <div className="text-gray-500 text-sm">Parts</div>
                <div className="text-3xl font-black text-gray-900">{formatGBP(e.costGBP)}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow border border-gray-100">
                <div className="text-gray-500 text-sm">Saved a year</div>
                <div className="text-3xl font-black text-green-700">{formatGBP(e.savingsGBP)}</div>
                <div className="text-gray-500 text-xs">poor year {formatGBP(e.pessimisticSavingsGBP)}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow border border-gray-100">
                <div className="text-gray-500 text-sm">Pays for itself in</div>
                <div className="text-3xl font-black text-orange-700">{years(e.paybackYears)}</div>
                <div className="text-gray-500 text-xs">poor year {years(e.pessimisticPaybackYears)}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Sun className="w-5 h-5 text-yellow-500" />Where a year of sun goes — {kwh(sunTotal)} kWh</h4>
              <div className="h-4 rounded-full overflow-hidden flex bg-gray-100 mb-4" aria-hidden="true">
                <div className="bg-green-500" style={{ width: `${(100 * plan.pv.houseKWh) / Math.max(sunTotal, 1)}%` }} />
                <div className="bg-red-500" style={{ width: `${(100 * plan.pv.toTankKWh) / Math.max(sunTotal, 1)}%` }} />
                <div className="bg-gray-300" style={{ width: `${(100 * plan.pv.exportKWh) / Math.max(sunTotal, 1)}%` }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-start gap-2"><Home className="w-4 h-4 text-green-600 mt-0.5" /><span><strong>{kwh(plan.pv.houseKWh)} kWh</strong> runs the house — {formatGBP(e.electricSavingsGBP)}</span></div>
                <div className="flex items-start gap-2"><Droplets className="w-4 h-4 text-red-600 mt-0.5" /><span><strong>{kwh(plan.pv.toTankKWh)} kWh</strong> heats the tank</span></div>
                <div className="flex items-start gap-2"><PlugZap className="w-4 h-4 text-gray-500 mt-0.5" /><span><strong>{kwh(plan.pv.exportKWh)} kWh</strong> goes to the grid, unpaid</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Droplets className="w-5 h-5 text-red-500" />Hot water covered</h4>
              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                <div><div className="text-2xl font-bold text-red-600">{pct(plan.hotWater.coverAnnual)}</div><div className="text-gray-500 text-xs">over the year</div></div>
                <div><div className="text-2xl font-bold text-red-600">{pct(plan.hotWater.coverBestMonth)}</div><div className="text-gray-500 text-xs">best month</div></div>
                <div><div className="text-2xl font-bold text-red-600">{pct(plan.hotWater.coverDecember)}</div><div className="text-gray-500 text-xs">December</div></div>
              </div>
              <p className="text-gray-600 text-sm">
                Worth {formatGBP(e.hotWaterSavingsGBP)} a year against {HEAT_SOURCES[cfg.heatSource].phrase}.
                {cfg.tubesM2 > 0 &&
                  ` The tubes provide ${kwh(plan.hotWater.fromTubesKWh)} kWh of it; with the panels already filling the tank in summer they add ${formatGBP(tubesAdd)} a year for ${formatGBP(e.tubesCostGBP)}.`}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><PoundSterling className="w-5 h-5 text-green-600" />The ledger</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-3"><span className="text-gray-600">Solar panels ({cfg.pvKwp.toFixed(1)} kWp)</span><span className="font-semibold">{formatGBP(e.pvCostGBP)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-600">{CONTROLLERS.find((c) => c.v === cfg.controller)?.label}</span><span className="font-semibold">{formatGBP(e.controllerCostGBP)}</span></div>
                {cfg.tubesM2 > 0 && <div className="flex justify-between gap-3"><span className="text-gray-600">Tubes, pump station and solar cylinder</span><span className="font-semibold">{formatGBP(e.tubesCostGBP)}</span></div>}
                <div className="flex justify-between gap-3 pt-2 border-t border-gray-100"><span className="font-semibold">Parts total</span><span className="font-bold">{formatGBP(e.costGBP)}</span></div>
              </div>
              <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                Electricity at Ofgem's October–December 2026 cap ({(ELECTRICITY_GBP_PER_KWH * 100).toFixed(1)}p); exports earn nothing on a DIY
                install. Poor year: 10% less sun{cfg.tubesM2 > 0 ? ' and less efficient tubes' : ''}. Not included: the electrician,
                scaffolding, and a new cylinder if you don't have one.
                {g98Panels && ` Above ${G98_LIMIT_KW} kW of inverter output the network operator must approve the system before you connect it (G99); microinverters sized to ${G98_LIMIT_KW} kW avoid that, at the cost of a little clipping on the brightest days (not modelled).`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
