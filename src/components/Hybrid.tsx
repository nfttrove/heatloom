import { useState } from 'react';
import { Zap, Flame, Sun, Snowflake, PoundSterling, Layers, Home } from 'lucide-react';
import {
  hybridPlan,
  HybridInput,
  HeatSource,
  HEAT_SOURCES,
  MONTHS,
  ELECTRICITY_GBP_PER_KWH,
  GAS_GBP_PER_KWH,
  BOILER_EFFICIENCY,
  HEATING_OIL_GBP_PER_LITRE,
  STORE_GBP_PER_KWH,
  PV_PANEL_GBP_PER_W,
  DEFAULT_HYBRID,
  HYBRID_STORE_TOP_C,
  HYBRID_STORE_USEFUL_MIN_C,
  SAND_COMPARISON_TOP_C,
  HYBRID_SAND_KG_PER_KWH,
  HYBRID_WATER_KG_PER_KWH,
  LITHIUM_GBP_PER_KWH,
  THERMAL_BOP_GBP,
  HOUSE_TIERS,
  formatGBP,
} from '../utils/heatloom';

function Slider({
  label, value, min, max, step, unit, onChange, display,
}: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; display?: string }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2 gap-3">
        <label className="font-bold text-gray-900">{label}</label>
        <span className="font-mono font-semibold text-orange-600 whitespace-nowrap">{display ?? `${value} ${unit}`}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        aria-label={label}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-orange-600"
      />
    </div>
  );
}

function CoverageCard({
  icon, label, annual, winter, color, note,
}: { icon: React.ReactNode; label: string; annual: number; winter: number; color: string; note: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        {icon}
        <h4 className="font-bold text-gray-900">{label}</h4>
      </div>
      <div className={`text-4xl font-bold ${color}`}>{Math.round(annual * 100)}%</div>
      <p className="text-gray-500 text-sm">annual coverage</p>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-2xl font-bold text-slate-700">{Math.round(winter * 100)}%</div>
        <p className="text-gray-500 text-xs">in December</p>
      </div>
      <p className="text-gray-500 text-xs mt-3 leading-relaxed">{note}</p>
    </div>
  );
}

const years = (x: number) => (isFinite(x) && x < 200 ? `${x.toFixed(1)} yr` : 'never');

/** "May–Sep" for a contiguous run of months, else a list. */
function monthSpan(months: string[]): string {
  if (months.length === 0) return 'no month';
  if (months.length === 1) return months[0];
  const idx = months.map((m) => MONTHS.indexOf(m as (typeof MONTHS)[number]));
  const contiguous = idx.every((v, k) => k === 0 || v === idx[k - 1] + 1);
  return contiguous ? `${months[0]}–${months[months.length - 1]}` : months.join(', ');
}

export default function Hybrid() {
  const [cfg, setCfg] = useState<HybridInput>({ ...DEFAULT_HYBRID, pvSelfUse: 0.5, heatSource: 'gas' });
  const set = (patch: Partial<HybridInput>) => setCfg((c) => ({ ...c, ...patch }));
  const plan = hybridPlan(cfg);
  const heatPhrase = HEAT_SOURCES[cfg.heatSource ?? 'gas'].phrase;
  const heatSurplus = plan.thermal.annualKWh - plan.thermal.usedKWh;
  const surplusMonths = plan.monthly.filter((m) => m.heatCollectedKWhPerDay > m.heatUsedKWhPerDay + 1e-9).map((m) => m.month);
  const e = plan.economics;
  const pvPayback = e.pvCostGBP / Math.max(e.electricSavingsGBP, 1);
  const thermalPayback = e.thermalCostGBP / Math.max(e.heatSavingsGBP, 1);
  const tiers = HOUSE_TIERS.map((t) => ({
    ...t,
    plan: hybridPlan({ ...cfg, electricKWhPerDay: DEFAULT_HYBRID.electricKWhPerDay, heatKWhPerDay: DEFAULT_HYBRID.heatKWhPerDay, pvKwp: t.pvKwp, collectorM2: t.collectorM2, storeKWh: t.storeKWh }),
  }));
  const starter = tiers[0].plan.economics;
  const tiersKeepBoiler = tiers.every((t) => t.plan.coverage.heatWinter < 1);
  const tiersKeepGrid = tiers.every((t) => t.plan.coverage.electricWinter < 1);
  const honestyColumn = [
    tiersKeepBoiler ? `at these settings no tier retires your ${HEAT_SOURCES[cfg.heatSource ?? 'gas'].system}` : 'at these settings a tier can cover December heat',
    tiersKeepGrid ? 'all three keep the grid' : 'a tier can cover December electricity',
  ].join(', and ');
  const heatPriceNote =
    cfg.heatSource === 'oil'
      ? `kerosene at ${(HEATING_OIL_GBP_PER_LITRE * 100).toFixed(1)}p a litre including VAT (the September 2026 average for 1,000-litre orders) through a ${Math.round(BOILER_EFFICIENCY * 100)}% boiler`
      : cfg.heatSource === 'heatPump' || cfg.heatSource === 'electric'
        ? `the same capped electricity price${cfg.heatSource === 'heatPump' ? ', divided by a COP of 3' : ''}`
        : `Ofgem's capped gas price, ${(GAS_GBP_PER_KWH * 100).toFixed(1)}p, through a ${Math.round(BOILER_EFFICIENCY * 100)}% boiler`;

  return (
    <section id="hybrid" className="py-24 bg-gradient-to-br from-slate-50 to-orange-50/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">The Hybrid — the one we'd actually build</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            PV for electrons, evacuated-tube collectors + a water store for heat. Heat Loom minus its weakest link
            (the ORC), plus bought solar panels — because no garage machine beats ~£{PV_PANEL_GBP_PER_W.toFixed(2)}/W silicon.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
          {/* Inputs */}
          <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-orange-100/50 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Your household</h3>
            </div>
            <Slider label="Electricity demand" value={cfg.electricKWhPerDay} min={2} max={25} step={1} unit="kWh/day" onChange={(v) => set({ electricKWhPerDay: v })} />
            <Slider label="Heat demand (space + water, yearly mean)" value={cfg.heatKWhPerDay} min={10} max={80} step={5} unit="kWh/day" onChange={(v) => set({ heatKWhPerDay: v })} />
            <div>
              <label htmlFor="heat-source" className="font-bold text-gray-900 block mb-2">What heats your home now</label>
              <select
                id="heat-source"
                value={cfg.heatSource}
                onChange={(ev) => set({ heatSource: ev.target.value as HeatSource })}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white"
              >
                {(Object.keys(HEAT_SOURCES) as HeatSource[]).map((k) => (
                  <option key={k} value={k}>{HEAT_SOURCES[k].label} — about {(HEAT_SOURCES[k].gbpPerKWh * 100).toFixed(1)}p per kWh of heat</option>
                ))}
              </select>
            </div>
            <Slider label="Sunshine (yearly mean)" value={cfg.dniAnnual} min={1} max={8} step={0.5} unit="kWh/m²/day" onChange={(v) => set({ dniAnnual: v })} />
            <p className="text-gray-500 text-xs -mt-3">Global sunlight on a south-facing tilt, for the panels and the tubes (tubes use diffuse light too). Southern England ≈ 3. PV is scaled from southern England's yield; hot, sunny sites lose more to panel heating, so read high settings as optimistic.</p>
            <div className="pt-4 border-t border-gray-100 space-y-6">
              <div className="flex items-center space-x-3">
                <Sun className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-gray-900">The rig</h4>
              </div>
              <Slider label="PV array" value={cfg.pvKwp} min={0.5} max={10} step={0.5} unit="kWp" onChange={(v) => set({ pvKwp: v })} />
              <Slider label="PV used at home" value={cfg.pvSelfUse ?? 0.5} min={0.2} max={1} step={0.05} unit="" display={`${Math.round((cfg.pvSelfUse ?? 0.5) * 100)}%`} onChange={(v) => set({ pvSelfUse: v })} />
              <Slider label="Evacuated-tube collector" value={cfg.collectorM2} min={1} max={40} step={1} unit="m²" onChange={(v) => set({ collectorM2: v })} />
              <Slider label="Water store" value={cfg.storeKWh} min={4} max={150} step={1} unit="kWh·th" onChange={(v) => set({ storeKWh: v })} />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Charged from {HYBRID_STORE_USEFUL_MIN_C} to {HYBRID_STORE_TOP_C} °C, that is{' '}
              {Math.round(plan.thermal.storeMassKg).toLocaleString('en-GB')} litres of water ({plan.thermal.storeVolumeM3.toFixed(2)} m³) — a
              solar cylinder, or a buffer store if it also feeds the heating. Full, it loses{' '}
              {Math.round(plan.thermal.storeLossWhenFullW)} W and half its useful heat in about{' '}
              {plan.thermal.storeHalfLifeDays.toFixed(0)} days behind 150 mm-equivalent insulation (a bought cylinder's factory foam
              loses two to three times more — add a jacket). The same job in sand, charged to {SAND_COMPARISON_TOP_C} °C, would be{' '}
              {Math.round(plan.thermal.sandComparison.massKg).toLocaleString('en-GB')} kg, lose{' '}
              {Math.round(plan.thermal.sandComparison.lossWhenFullW)} W and half its useful heat in about{' '}
              {plan.thermal.sandComparison.usefulHalfLifeDays.toFixed(0)} days: over these swings water holds about{' '}
              {(HYBRID_SAND_KG_PER_KWH / HYBRID_WATER_KG_PER_KWH).toFixed(1)} times the heat per kg, so
              its tank is smaller, with less surface to leak through, and it runs cooler. Either holds days, not seasons. It holds{' '}
              {plan.thermal.storeDaysOfPeakCollection.toFixed(1)} days of your best month's collection
              {plan.thermal.storeLimitedKWh >= 1
                ? ` — less than a sunny day, so it caps how much heat reaches the house: a bigger store would add up to about ${Math.round(plan.thermal.storeLimitedKWh).toLocaleString('en-GB')} kWh a year. (The model sends every kWh through the store, which is pessimistic for small stores: some heat is used as it is collected.)`
                : plan.thermal.storeDaysOfPeakCollection < 1
                  ? ' — less than a sunny day, but in the months when the tubes collect more than it holds, the house needs less than it holds, so a bigger store adds cost, not coverage.'
                  : '; past one or two, a bigger store adds cost, not coverage.'}
            </p>
          </div>

          {/* Outputs */}
          <div className="xl:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CoverageCard
                icon={<Zap className="w-5 h-5 text-blue-600" />}
                label="Electricity (PV)" annual={plan.coverage.electricAnnual} winter={plan.coverage.electricWinter}
                color="text-blue-600"
                note={`Counts only PV used at home (${Math.round(plan.pv.selfUse * 100)}% of ${Math.round(plan.pv.annualKWh).toLocaleString('en-GB')} kWh/yr). A DIY install can't claim the Smart Export Guarantee, so exports earn nothing here.`}
              />
              <CoverageCard
                icon={<Flame className="w-5 h-5 text-red-600" />}
                label="Heat (tubes + water store)" annual={plan.coverage.heatAnnual} winter={plan.coverage.heatWinter}
                color="text-red-600"
                note={
                  heatSurplus >= 1
                    ? `Of ${Math.round(plan.thermal.annualKWh).toLocaleString('en-GB')} kWh collected, ${Math.round(plan.thermal.usedKWh).toLocaleString('en-GB')} meet demand; the rest is surplus in ${monthSpan(surplusMonths)}, when the tubes collect more than the house ${plan.thermal.storeLimitedKWh >= 1 ? 'needs or the store can pass on' : 'needs'}.`
                    : `All ${Math.round(plan.thermal.annualKWh).toLocaleString('en-GB')} kWh collected meets demand, even in summer — the collector is small next to the house's heat needs.`
                }
              />
            </div>

            <div className={`p-6 rounded-2xl border ${plan.decemberVerdict.serious ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200/60' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/60'}`}>
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${plan.decemberVerdict.serious ? 'bg-yellow-500' : 'bg-green-500'}`}>
                  <Snowflake className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className={`font-bold text-lg mb-2 ${plan.decemberVerdict.serious ? 'text-yellow-800' : 'text-green-800'}`}>
                    {plan.decemberVerdict.serious ? 'December reality check' : 'December holds'}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{plan.decemberVerdict.text}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-orange-200/60">
              <div className="flex items-center space-x-2 mb-3">
                <Home className="w-5 h-5 text-orange-600" />
                <h4 className="font-bold text-gray-900 text-lg">So what will it cost for my house?</h4>
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Three tiers for a typical UK home ({DEFAULT_HYBRID.electricKWhPerDay} kWh/day electricity,{' '}
                {DEFAULT_HYBRID.heatKWhPerDay} kWh/day heat on average), computed by the same module as the sliders
                above with your self-use, sunshine and heat source. The Build Guide's research rig is a different
                axis entirely: experimenter's parts, not a bigger house system.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <th className="p-3 text-left font-bold rounded-tl-xl">Tier</th>
                      <th className="p-3 text-right font-bold">Cost</th>
                      <th className="p-3 text-right font-bold">Electricity (yr / Dec)</th>
                      <th className="p-3 text-right font-bold">Heat (yr / Dec)</th>
                      <th className="p-3 text-right font-bold rounded-tr-xl">Payback (pessimistic)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map(({ name, rig, plan: p }) => (
                      <tr key={name} className="bg-white even:bg-gray-50/60">
                        <td className="p-3">
                          <div className="font-bold text-gray-900 text-sm">{name}</div>
                          <div className="text-gray-500 text-xs">{rig}</div>
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900">{formatGBP(p.economics.systemCostGBP)}</td>
                        <td className="p-3 text-right text-blue-600 font-mono text-sm">
                          {Math.round(p.coverage.electricAnnual * 100)}% / {Math.round(p.coverage.electricWinter * 100)}%
                        </td>
                        <td className="p-3 text-right text-red-600 font-mono text-sm">
                          {Math.round(p.coverage.heatAnnual * 100)}% / {Math.round(p.coverage.heatWinter * 100)}%
                        </td>
                        <td className="p-3 text-right text-orange-600 font-bold whitespace-nowrap">
                          {years(p.economics.paybackYears)} <span className="text-gray-500 font-normal text-xs">({years(p.economics.pessimisticPaybackYears)})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-gray-600 text-xs mt-4 leading-relaxed">
                The December column is the honesty column: {honestyColumn}.
                Against {heatPhrase}, the starter's heat half ({formatGBP(starter.thermalCostGBP)}) earns{' '}
                {formatGBP(starter.heatSavingsGBP)} a year and its PV half ({formatGBP(starter.pvCostGBP)}) earns{' '}
                {formatGBP(starter.electricSavingsGBP)}: the heat half pays for itself in{' '}
                {years(starter.thermalCostGBP / Math.max(starter.heatSavingsGBP, 1))}, the panels in{' '}
                {years(starter.pvCostGBP / Math.max(starter.electricSavingsGBP, 1))}.
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-5">
                <PoundSterling className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-gray-900 text-lg">The honest ledger</h4>
              </div>
              <div className="space-y-2 text-sm md:text-base">
                <div className="flex justify-between gap-3"><span className="text-gray-600">PV array ({plan.pv.kwp} kWp, {Math.round(plan.pv.annualKWh).toLocaleString('en-GB')} kWh/yr):</span><span className="font-bold text-gray-900">{formatGBP(plan.pv.costGBP)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-600">Evacuated tubes ({plan.thermal.areaM2} m², {Math.round(plan.thermal.annualKWh).toLocaleString('en-GB')} kWh·th/yr collected):</span><span className="font-bold text-gray-900">{formatGBP(plan.thermal.costGBP)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-600">Pump station + controller + fittings (once):</span><span className="font-bold text-gray-900">{formatGBP(THERMAL_BOP_GBP)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-600">Water store ({Math.round(plan.thermal.storeMassKg).toLocaleString('en-GB')} L, {cfg.storeKWh} kWh·th, twin-coil cylinder class):</span><span className="font-bold text-gray-900">{formatGBP(plan.thermal.storeCostGBP)}</span></div>
                <div className="flex justify-between gap-3 pt-2 border-t border-gray-100"><span className="font-semibold text-gray-800">System total:</span><span className="font-bold text-gray-900">{formatGBP(e.systemCostGBP)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-600">Annual savings — PV {formatGBP(e.electricSavingsGBP)} + heat {formatGBP(e.heatSavingsGBP)}:</span><span className="font-bold text-green-600">{formatGBP(e.annualSavingsGBP)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500 text-sm">…pessimistic (−10% sun, low tube efficiency):</span><span className="text-gray-500 text-sm">{formatGBP(e.pessimisticSavingsGBP)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500 text-sm">…vs the naive always-covered promise:</span><span className="text-gray-500 text-sm">{formatGBP(e.naiveSavingsGBP)}</span></div>
                <div className="flex justify-between gap-3 pt-2 border-t border-gray-100"><span className="font-semibold text-gray-800">Payback (pessimistic):</span><span className="font-bold text-orange-600">{years(e.paybackYears)} ({years(e.pessimisticPaybackYears)})</span></div>
                <div className="flex justify-between gap-3"><span className="text-gray-500 text-sm">…PV half alone / heat half alone:</span><span className="text-gray-500 text-sm">{years(pvPayback)} / {years(thermalPayback)}</span></div>
              </div>
              <p className="text-gray-600 text-sm mt-5 leading-relaxed">
                Savings count only PV used at home ({Math.round(plan.pv.selfUse * 100)}%, exports at £0) and heat that meets
                each month's demand, with a monthly UK sun and heating shape; the store never carries summer into winter.
                PV is valued at Ofgem's October–December 2026 capped electricity price,{' '}
                {(ELECTRICITY_GBP_PER_KWH * 100).toFixed(1)}p; heat at what {heatPhrase} costs — {heatPriceNote}. The store's {formatGBP(STORE_GBP_PER_KWH)}/kWh comes
                from 250 L solar cylinder prices (bigger tanks cost less per kWh); an unvented cylinder needs a G3-qualified
                installer, which is not priced here. The pessimistic case varies sunshine and efficiency, not cost. Lithium would cost {formatGBP(cfg.storeKWh * LITHIUM_GBP_PER_KWH)} for
                the same number of kWh — but electrical kWh, each worth several kWh of heat. The registered claim (On Trial)
                is annual production, not these savings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
