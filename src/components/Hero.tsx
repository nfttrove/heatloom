import { ArrowRight, Thermometer, Layers, ShieldCheck, Play } from 'lucide-react';
import {
  hybridPlan,
  DEFAULT_HYBRID,
  HEAT_DEMAND_MONTHLY,
  DECEMBER,
  STORE_GBP_PER_KWH,
  LITHIUM_GBP_PER_KWH,
  REGISTERED_HYBRID_KWH_PER_YEAR,
  HYBRID_SAND_KG_PER_KWH,
  HYBRID_WATER_KG_PER_KWH,
  PV_PANEL_GBP_PER_W,
  formatGBP,
} from '../utils/heatloom';

// Every figure below is computed from the default Hybrid.
const PLAN = hybridPlan(DEFAULT_HYBRID);
const PRODUCED = PLAN.pv.annualKWh + PLAN.thermal.annualKWh;
const USED = PLAN.pv.usedKWh + PLAN.thermal.usedKWh;
const DEC_HEAT_DAYS = DEFAULT_HYBRID.storeKWh / (DEFAULT_HYBRID.heatKWhPerDay * HEAT_DEMAND_MONTHLY[DECEMBER]);
const kwh = (x: number) => Math.round(x).toLocaleString('en-GB');
const WATER_SHARE_PCT = Math.round((100 * HYBRID_WATER_KG_PER_KWH) / HYBRID_SAND_KG_PER_KWH);

export default function Hero() {
  return (
    <section id="overview" className="pt-32 pb-24 bg-gradient-to-br from-orange-50/80 via-white to-red-50/60 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/40 to-red-100/20"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-24">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-8">
            <Layers className="w-4 h-4 mr-2" />
            Open-Source Solar Heat + Storage
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Heat Loom
            </span>
          </h1>

          <p className="text-2xl text-gray-700 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Solar heat in <span className="font-semibold text-red-600">a store of sand</span> that carries sunny days into the
            evenings and cloudy days after — with <span className="font-semibold text-blue-600">bought solar panels</span> for the electrons,
            because no garage machine beats ~£{PV_PANEL_GBP_PER_W.toFixed(2)}/W silicon. Every number below is modelled; nothing has been built yet.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <a href="#hybrid" className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center space-x-3 shadow-2xl hover:shadow-orange-500/25 hover:scale-105">
              <span className="text-lg">Design Your Hybrid</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#demo" className="group px-10 py-5 bg-white border-2 border-gray-200 hover:border-orange-500 text-gray-700 hover:text-orange-600 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl">
              <Play className="w-5 h-5" />
              <span className="text-lg">Watch Demo</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="group bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-red-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Thermometer className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Heat, Stored for Days</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              A sand store's parts cost from about {formatGBP(STORE_GBP_PER_KWH)} per kWh of heat against ~{formatGBP(LITHIUM_GBP_PER_KWH)} per kWh for
              lithium — though a kWh of heat is worth far less than a kWh of electricity. Sand itself doesn't burn or wear out; the hot loop
              around it can (see Safety). The default {DEFAULT_HYBRID.storeKWh} kWh store is {kwh(PLAN.thermal.sandMassKg)} kg of sand, about{' '}
              {DEC_HEAT_DAYS.toFixed(1)} days of December heating, and a full store loses half its useful heat in ~{PLAN.thermal.storeHalfLifeDays.toFixed(0)} days.
            </p>
            <div className="mt-6 pt-6 border-t border-red-100">
              <div className="text-red-600 font-bold text-sm">Up to {Math.round(LITHIUM_GBP_PER_KWH / STORE_GBP_PER_KWH)}× Cheaper per kWh Than Lithium (heat, not electricity)</div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-orange-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">The Hybrid</h3>
            <p className="text-gray-600 leading-relaxed text-lg">Evacuated tubes + sand store for heat, PV for electricity — and we removed our own turbine, with the Carnot arithmetic to show why. Coverage quoted annual <em>and</em> December.</p>
            <div className="mt-6 pt-6 border-t border-orange-100">
              <div className="text-orange-600 font-bold text-sm">{PLAN.economics.paybackYears.toFixed(1)}-Year Payback Against Gas (UK Model)</div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-emerald-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Numbers on Trial</h3>
            <p className="text-gray-600 leading-relaxed text-lg">Every modelled figure on this site comes from a tested, open-source engineering module (reference prices and engine efficiencies are quoted as such), and our production claims are pre-registered in a public registry before any hardware exists — the corrected model already predicts less than we registered.</p>
            <div className="mt-6 pt-6 border-t border-emerald-100">
              <div className="text-emerald-600 font-bold text-sm">Pre-Registered, Hash-Committed Claims</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-4xl p-6 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8 leading-tight">
                Why <span className="text-orange-400">Heat Loom</span>?
              </h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-2">Storage, Sized Honestly</h4>
                    <p className="text-gray-300 leading-relaxed">Collectors are commodity. A sand store is cheap per kWh and the sand itself doesn't wear out, but at house scale it holds days, not seasons — and at the Hybrid's temperatures a water tank does the same job in about {WATER_SHARE_PCT}% of the weight. We show both.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-2">Few Moving Parts</h4>
                    <p className="text-gray-300 leading-relaxed">The research rig's thermosiphon loop needs no pump; the Hybrid's commodity tubes use a small pump station, costed in the ledger. Sand doesn't wear out — the loop, fluid and insulation are what need looking after.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-2">Honest Economics</h4>
                    <p className="text-gray-300 leading-relaxed">{formatGBP(PLAN.economics.systemCostGBP)} of parts (sourced 2026 prices) saving about {formatGBP(PLAN.economics.annualSavingsGBP)} a year against gas in the UK — a {PLAN.economics.paybackYears.toFixed(1)}-year payback, {PLAN.economics.pessimisticPaybackYears.toFixed(1)} in the pessimistic case — with winter shortfalls and PV self-use stated up front. The naive {formatGBP(PLAN.economics.naiveSavingsGBP)} is shown too, so you can see the honesty discount.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl p-10 border border-orange-500/20">
              <div className="text-center mb-8">
                <div className="text-5xl md:text-6xl font-black text-orange-400 mb-4">{kwh(PRODUCED)} kWh/yr</div>
                <p className="text-white text-xl font-medium">produced by the default Hybrid ({DEFAULT_HYBRID.pvKwp} kWp PV + {DEFAULT_HYBRID.collectorM2} m² tubes + {DEFAULT_HYBRID.storeKWh} kWh sand) — {kwh(USED)} of it used at home</p>
                <p className="text-gray-400 text-sm mt-2">Modelled, not measured. The registered claim is {Number(REGISTERED_HYBRID_KWH_PER_YEAR).toLocaleString('en-GB')} — see On Trial.</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{kwh(PLAN.pv.annualKWh)}</div>
                  <p className="text-gray-300 font-medium">kWh/yr electric (PV)</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{kwh(PLAN.thermal.annualKWh)}</div>
                  <p className="text-gray-300 font-medium">kWh/yr heat collected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
