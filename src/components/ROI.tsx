import { PoundSterling, TrendingUp, Calculator, Clock } from 'lucide-react';
import { hybridPlan, DEFAULT_HYBRID, ELECTRICITY_GBP_PER_KWH, HEAT_SOURCES, LITHIUM_GBP_PER_KWH, formatGBP } from '../utils/heatloom';

const PLAN = hybridPlan(DEFAULT_HYBRID);
const E = PLAN.economics;
const ALL_SELF_USED = hybridPlan({ ...DEFAULT_HYBRID, pvSelfUse: 1 });
const VS_HEAT_PUMP = hybridPlan({ ...DEFAULT_HYBRID, heatSource: 'heatPump' });
const VS_ELECTRIC = hybridPlan({ ...DEFAULT_HYBRID, heatSource: 'electric' });
const BIG_STORE = hybridPlan({ ...DEFAULT_HYBRID, storeKWh: DEFAULT_HYBRID.storeKWh * 2 });
// A home battery to soak up the surplus PV: an illustration, priced at the module's lithium figure.
const BATTERY_KWH = 5;
const BATTERY_GBP = BATTERY_KWH * LITHIUM_GBP_PER_KWH;
const WITH_BATTERY_PAYBACK = (ALL_SELF_USED.economics.systemCostGBP + BATTERY_GBP) / ALL_SELF_USED.economics.annualSavingsGBP;
const kwh = (x: number) => Math.round(x).toLocaleString('en-GB');
const pence = (x: number) => `${(x * 100).toFixed(1)}p`;

export default function ROI() {
  return (
    <section id="roi" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Return on Investment</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Modelled economics for the default Hybrid against a gas boiler, at Ofgem's October–December 2026 cap prices —
            computed by the same tested module as the rest of the site. Nothing has been built and measured yet.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-12 rounded-3xl shadow-lg mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Calculator className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">Default Hybrid — modelled ROI</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                  <h4 className="font-bold text-gray-900 mb-2">System Cost</h4>
                  <p className="text-3xl font-bold text-green-700">{formatGBP(E.systemCostGBP)}</p>
                  <p className="text-gray-600 text-sm">
                    {DEFAULT_HYBRID.pvKwp} kWp PV + {DEFAULT_HYBRID.collectorM2} m² evacuated tubes + {DEFAULT_HYBRID.storeKWh} kWh sand store + pump
                    station and controller (sourced 2026 DIY prices; no installer labour)
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-bold text-gray-900 mb-2">Annual Savings</h4>
                  <p className="text-3xl font-bold text-blue-700">{formatGBP(E.annualSavingsGBP)}</p>
                  <p className="text-gray-600 text-sm">
                    PV {formatGBP(E.electricSavingsGBP)} + heat {formatGBP(E.heatSavingsGBP)}; pessimistic {formatGBP(E.pessimisticSavingsGBP)}.
                    Counts only PV used at home and heat that meets each month's demand.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-600">
                  <h4 className="font-bold text-gray-900 mb-2">Payback Period</h4>
                  <p className="text-3xl font-bold text-orange-700">{E.paybackYears.toFixed(1)} years</p>
                  <p className="text-gray-600 text-sm">
                    {E.pessimisticPaybackYears.toFixed(1)} in the pessimistic case. The naive {formatGBP(E.naiveSavingsGBP)} a year a flat
                    calculation would promise is not earned.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Annual Energy (modelled)</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-gray-700">PV generated ({DEFAULT_HYBRID.pvKwp} kWp)</span>
                    <span className="font-bold text-yellow-700">{kwh(PLAN.pv.annualKWh)} kWh/yr</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-gray-700">…used at home ({Math.round(PLAN.pv.selfUse * 100)}%) @ {pence(ELECTRICITY_GBP_PER_KWH)}</span>
                    <span className="font-bold text-green-700">{kwh(PLAN.pv.usedKWh)} kWh · {formatGBP(E.electricSavingsGBP)}/yr</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-gray-700">Heat collected (tubes + sand)</span>
                    <span className="font-bold text-red-700">{kwh(PLAN.thermal.annualKWh)} kWh<sub>th</sub>/yr</span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-gray-700">…meeting demand @ {pence(E.heatGBPPerKWh)} (gas)</span>
                    <span className="font-bold text-green-700">{kwh(PLAN.thermal.usedKWh)} kWh · {formatGBP(E.heatSavingsGBP)}/yr</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-600 to-red-700 p-6 rounded-xl text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-6 h-6" />
                  <h4 className="text-lg font-bold">What moves the payback</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Using all the PV at home: {ALL_SELF_USED.economics.paybackYears.toFixed(1)} years if daytime loads can absorb it; with a {BATTERY_KWH} kWh battery ({formatGBP(BATTERY_GBP)}) at best {WITH_BATTERY_PAYBACK.toFixed(1)} years</li>
                  <li>• If the heat displaces {HEAT_SOURCES.heatPump.phrase} rather than gas: {VS_HEAT_PUMP.economics.paybackYears.toFixed(1)} years; direct electric heating: {VS_ELECTRIC.economics.paybackYears.toFixed(1)} years</li>
                  <li>• A bigger sand store: doubling it raises the cost to {formatGBP(BIG_STORE.economics.systemCostGBP)} and changes coverage not at all — it carries days, not seasons</li>
                  <li>• Field data: once builders file measurements, they replace these predictions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
            <TrendingUp className="w-10 h-10 text-orange-600 mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-3">Scale</h4>
            <p className="text-gray-700 text-sm">
              Costs scale roughly linearly in this model. Bulk buying or shared installs might lower them; nothing here assumes it.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <PoundSterling className="w-10 h-10 text-green-600 mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-3">Lifetime</h4>
            <p className="text-gray-700 text-sm">
              Unknown. Panels commonly carry 25-year warranties; the tubes, store, pump and fluid in this design are unproven,
              and the payback above assumes nothing needs replacing.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <Calculator className="w-10 h-10 text-blue-600 mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-3">Your numbers</h4>
            <p className="text-gray-700 text-sm">
              Use the Hybrid's sliders for your own demand, sunshine, self-use and heat source — the same module computes them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
