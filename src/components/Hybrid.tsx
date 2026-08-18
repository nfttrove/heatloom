import { useState } from 'react';
import { Zap, Flame, Sun, Snowflake, PoundSterling, Layers, Home } from 'lucide-react';
import { hybridPlan, HybridInput } from '../utils/heatloom';

const HOUSE_TIERS = [
  { name: 'Starter', rig: '2 kWp PV + 3 m² + 40 kWh sand', pvKwp: 2, collectorM2: 3, storeKWh: 40 },
  { name: 'Half-heat house', rig: '4 kWp PV + 10 m² + 100 kWh sand', pvKwp: 4, collectorM2: 10, storeKWh: 100 },
  { name: 'Whole-house', rig: '4 kWp PV + 20 m² + 150 kWh sand', pvKwp: 4, collectorM2: 20, storeKWh: 150 },
];

const DEFAULTS: HybridInput = {
  electricKWhPerDay: 8,
  heatKWhPerDay: 30,
  pvKwp: 2,
  collectorM2: 3,
  storeKWh: 40,
  dniAnnual: 3,
};

function Slider({
  label, value, min, max, step, unit, onChange,
}: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="font-bold text-gray-900">{label}</label>
        <span className="font-mono font-semibold text-orange-600">{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-orange-600"
      />
    </div>
  );
}

function CoverageCard({
  icon, label, annual, winter, color,
}: { icon: React.ReactNode; label: string; annual: number; winter: number; color: string }) {
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
        <p className="text-gray-400 text-xs">in December</p>
      </div>
    </div>
  );
}

export default function Hybrid() {
  const [cfg, setCfg] = useState<HybridInput>(DEFAULTS);
  const set = (patch: Partial<HybridInput>) => setCfg((c) => ({ ...c, ...patch }));
  const plan = hybridPlan(cfg);

  return (
    <section id="hybrid" className="py-24 bg-gradient-to-br from-slate-50 to-orange-50/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">The Hybrid — the one we'd bet money on</h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            PV for electrons, collector + sand for heat. Heat Loom's storage genius, minus its weakest link
            (the ORC), plus bought solar panels — because no garage machine beats £0.30/W silicon.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
          {/* Inputs */}
          <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-orange-100/50 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Your household</h3>
            </div>
            <Slider label="Electricity demand" value={cfg.electricKWhPerDay} min={2} max={25} step={1} unit="kWh/day" onChange={(v) => set({ electricKWhPerDay: v })} />
            <Slider label="Heat demand (space + water)" value={cfg.heatKWhPerDay} min={10} max={80} step={5} unit="kWh/day" onChange={(v) => set({ heatKWhPerDay: v })} />
            <Slider label="DNI (annual average)" value={cfg.dniAnnual} min={1} max={8} step={0.5} unit="kWh/m²/day" onChange={(v) => set({ dniAnnual: v })} />
            <div className="pt-4 border-t border-gray-100 space-y-6">
              <div className="flex items-center space-x-3">
                <Sun className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-gray-900">The rig</h4>
              </div>
              <Slider label="PV array" value={cfg.pvKwp} min={0.5} max={10} step={0.5} unit="kWp" onChange={(v) => set({ pvKwp: v })} />
              <Slider label="Thermal collector" value={cfg.collectorM2} min={1} max={40} step={1} unit="m²" onChange={(v) => set({ collectorM2: v })} />
              <Slider label="Sand store" value={cfg.storeKWh} min={10} max={300} step={10} unit="kWh·th" onChange={(v) => set({ storeKWh: v })} />
            </div>
            <p className="text-gray-500 text-sm">
              That store is {(cfg.storeKWh * 11.25).toFixed(0)} kg of dry sand — about £20 of aggregate.
              The vessel, insulation, and heat exchanger around it are the real cost (see the ledger).
              Lithium stores the same energy for roughly £{(cfg.storeKWh * 300).toLocaleString()}.
            </p>
          </div>

          {/* Outputs */}
          <div className="xl:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CoverageCard
                icon={<Zap className="w-5 h-5 text-blue-600" />}
                label="Electricity (PV)" annual={plan.coverage.electricAnnual} winter={plan.coverage.electricWinter}
                color="text-blue-600"
              />
              <CoverageCard
                icon={<Flame className="w-5 h-5 text-red-600" />}
                label="Heat (collector + sand)" annual={plan.coverage.heatAnnual} winter={plan.coverage.heatWinter}
                color="text-red-600"
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

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-200/60">
              <div className="flex items-center space-x-2 mb-3">
                <Home className="w-5 h-5 text-orange-600" />
                <h4 className="font-bold text-gray-900 text-lg">So what will it cost for my house?</h4>
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Three honest tiers for a typical UK home (8 kWh/day electricity, 30 kWh/day heat), computed by
                the same module as the sliders above. The Build Guide's ~£7,900 is a different axis entirely:
                research-grade components (silvered-glass troughs, evacuated receivers) on a small rig —
                experimenter's parts, not a bigger house system.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <th className="p-3 text-left font-bold rounded-tl-xl">Tier</th>
                      <th className="p-3 text-right font-bold">Cost</th>
                      <th className="p-3 text-right font-bold">Electricity (yr / Dec)</th>
                      <th className="p-3 text-right font-bold">Heat (yr / Dec)</th>
                      <th className="p-3 text-right font-bold rounded-tr-xl">Payback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HOUSE_TIERS.map((t) => {
                      const p = hybridPlan({ electricKWhPerDay: 8, heatKWhPerDay: 30, dniAnnual: 3, pvKwp: t.pvKwp, collectorM2: t.collectorM2, storeKWh: t.storeKWh });
                      return (
                        <tr key={t.name} className="bg-white even:bg-gray-50/60">
                          <td className="p-3">
                            <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                            <div className="text-gray-500 text-xs">{t.rig}</div>
                          </td>
                          <td className="p-3 text-right font-bold text-gray-900">£{p.economics.systemCostGBP.toLocaleString()}</td>
                          <td className="p-3 text-right text-blue-600 font-mono text-sm">
                            {Math.round(p.coverage.electricAnnual * 100)}% / {Math.round(p.coverage.electricWinter * 100)}%
                          </td>
                          <td className="p-3 text-right text-red-600 font-mono text-sm">
                            {Math.round(p.coverage.heatAnnual * 100)}% / {Math.round(p.coverage.heatWinter * 100)}%
                          </td>
                          <td className="p-3 text-right text-orange-600 font-bold">{p.economics.paybackYears.toFixed(1)} yr</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-xs mt-4">
                The December column is the honesty column: no UK rig retires your boiler. The £2,300 starter is a
                toe in the water; the £6,100 tier is the one we'd actually recommend; the £9,850 tier buys the
                boiler's summer holidays. All three keep the grid.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-5">
                <PoundSterling className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-gray-900 text-lg">The honest ledger</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">PV array ({plan.pv.kwp} kWp, {plan.pv.annualKWh.toFixed(0)} kWh/yr):</span><span className="font-bold text-gray-900">£{plan.pv.costGBP.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Collector ({plan.thermal.areaM2} m², {plan.thermal.annualKWh.toFixed(0)} kWh·th/yr):</span><span className="font-bold text-gray-900">£{plan.thermal.costGBP.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Pump station + controller + fittings (once):</span><span className="font-bold text-gray-900">£500</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Sand media ({plan.thermal.sandMassKg.toFixed(0)} kg of aggregate):</span><span className="font-bold text-gray-900">£{plan.thermal.mediaCostGBP.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Store vessel + insulation + exchanger ({cfg.storeKWh} kWh·th):</span><span className="font-bold text-gray-900">£{plan.thermal.vesselCostGBP.toFixed(0)}</span></div>
                <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-semibold text-gray-800">System total:</span><span className="font-bold text-gray-900">£{plan.economics.systemCostGBP.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Annual savings (coverage-capped):</span><span className="font-bold text-green-600">£{plan.economics.annualSavingsGBP.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-sm">…vs the naive always-covered promise:</span><span className="text-gray-400 text-sm">£{plan.economics.naiveSavingsGBP.toFixed(0)}</span></div>
                <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-semibold text-gray-800">Payback:</span><span className="font-bold text-orange-600">{plan.economics.paybackYears.toFixed(1)} years</span></div>
              </div>
              <p className="text-gray-500 text-sm mt-5 leading-relaxed">
                Savings only count electricity and heat you actually generate — winter days capped at
                winter output. The gap between the two numbers below the savings line is the honesty
                discount. All figures come from the tested module in the repo; this claim is
                pre-registered in the In Fini claim registry before any hardware exists.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
