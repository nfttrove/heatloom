import { FileCheck2, ExternalLink, TrendingUp } from 'lucide-react';
import {
  loomPlan,
  DEFAULT_LOOM,
  ELECTRICITY_GBP_PER_KWH,
  GAS_GBP_PER_KWH,
  BOILER_EFFICIENCY,
  PV_GBP_PER_KWP,
  PV_KWH_PER_KWP_YEAR,
  LOOM_CONTROLLER_PARTS_GBP,
  BOUGHT_DIVERTER_GBP,
  WATER_STORE_GBP_PER_KWH,
  HEAT_SOURCES,
  SOLAR_MONTHLY,
  DECEMBER,
  formatGBP,
} from '../utils/heatloom';

const BASE = loomPlan(DEFAULT_LOOM).economics;
const p = (x: number) => `${(x * 100).toFixed(1)}p`;
const yrs = (x: number) => `${x.toFixed(1)} years`;

// What moves the payback, each computed from the default build.
const VARIANTS = [
  { label: 'You heat water with an immersion heater today', plan: loomPlan({ ...DEFAULT_LOOM, heatSource: 'electric' }) },
  { label: 'You heat water with oil', plan: loomPlan({ ...DEFAULT_LOOM, heatSource: 'oil' }) },
  { label: 'Someone is home in the day (half the output used as it is made)', plan: loomPlan({ ...DEFAULT_LOOM, pvSelfUse: 0.5 }) },
  { label: `A bought diverter instead of the loom (${formatGBP(BOUGHT_DIVERTER_GBP)} fitted)`, plan: loomPlan({ ...DEFAULT_LOOM, controller: 'bought' }) },
  { label: 'Panels only, no loom', plan: loomPlan({ ...DEFAULT_LOOM, controller: 'none' }) },
];

const REPO_MODEL = 'https://github.com/nfttrove/heatloom/blob/main/src/utils/heatloom.ts';

export default function OurNumbers() {
  return (
    <section id="numbers" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How we got these numbers</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            One open, tested model computes every figure on this page — you can read it, run it and check it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-gray-50 to-orange-50/40 p-6 md:p-8 rounded-3xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What goes in</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Electricity {p(ELECTRICITY_GBP_PER_KWH)}/kWh and gas {p(GAS_GBP_PER_KWH)}/kWh: Ofgem's price cap, October–December 2026</li>
              <li>• A {Math.round(BOILER_EFFICIENCY * 100)}% boiler, so gas hot water costs {p(HEAT_SOURCES.gas.gbpPerKWh)} per kWh of heat</li>
              <li>• Panels {formatGBP(PV_GBP_PER_KWP)} per kWp with microinverters and mounting, yielding {PV_KWH_PER_KWP_YEAR} kWh per kWp a year in southern England</li>
              <li>• The loom's parts {formatGBP(LOOM_CONTROLLER_PARTS_GBP)}; a cylinder, if you need one, about {formatGBP(WATER_STORE_GBP_PER_KWH)} per kWh it holds</li>
              <li>• A monthly sunshine shape: a December day gets about {Math.round(SOLAR_MONTHLY[DECEMBER] * 100)}% of an average day's sun</li>
              <li>• Exports earn nothing: a DIY install can't claim the Smart Export Guarantee</li>
              <li>• A poor year: 10% less sun</li>
            </ul>
            <p className="text-gray-500 text-sm mt-4">Not included: the electrician, scaffolding, or a new cylinder.</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-8 rounded-3xl border border-green-200/60">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-7 h-7 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900">What moves the payback</h3>
            </div>
            <p className="text-gray-700 mb-4">The default build: {formatGBP(BASE.costGBP)}, saving {formatGBP(BASE.savingsGBP)} a year — {yrs(BASE.paybackYears)}.</p>
            <ul className="space-y-3">
              {VARIANTS.map((v) => (
                <li key={v.label} className="flex justify-between gap-4 text-sm md:text-base">
                  <span className="text-gray-700">{v.label}</span>
                  <span className="font-bold text-green-700 whitespace-nowrap">{yrs(v.plan.economics.paybackYears)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 md:p-10 rounded-3xl">
          <div className="flex items-start space-x-4">
            <FileCheck2 className="w-8 h-8 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold mb-3">Check our working</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                The model is open source and covered by automated tests, and every figure on this page is computed from it.
                Predictions for Heat Loom designs are filed in the public In Fini claim registry, so builders can compare what
                they measure with what we said.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={REPO_MODEL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100">
                  <span>Read the model</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a href="https://in-fini.com/?tab=registry" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center space-x-2 px-6 py-3 border-2 border-white/60 text-white rounded-xl font-semibold hover:bg-white/10">
                  <span>See the registry</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
