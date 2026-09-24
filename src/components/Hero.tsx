import { ArrowRight, Zap, Droplets, Cpu, Calculator } from 'lucide-react';
import { loomPlan, DEFAULT_LOOM, formatGBP, LOOM_CONTROLLER_PARTS_GBP } from '../utils/heatloom';

// Every figure below is computed from the default build.
const PLAN = loomPlan(DEFAULT_LOOM);
const E = PLAN.economics;
const pct = (x: number) => `${Math.round(x * 100)}%`;

const CARDS = [
  {
    icon: <Zap className="w-8 h-8 text-white" />,
    box: 'from-yellow-400 to-orange-500',
    title: 'Power first',
    text: `${DEFAULT_LOOM.pvKwp} kWp of solar panels run your home as the sun shines — worth about ${formatGBP(E.electricSavingsGBP)} a year in electricity you don't buy.`,
  },
  {
    icon: <Cpu className="w-8 h-8 text-white" />,
    box: 'from-orange-500 to-red-500',
    title: 'The loom decides',
    text: `A small open-source controller you build (about ${formatGBP(LOOM_CONTROLLER_PARTS_GBP)} of parts), designed to watch your meter and, when the panels make more than the house needs, send the spare to your hot-water tank instead of the grid.`,
  },
  {
    icon: <Droplets className="w-8 h-8 text-white" />,
    box: 'from-red-500 to-rose-600',
    title: 'The tank is the battery',
    text: `Spare sun becomes hot water for showers and washing-up — about ${pct(PLAN.hotWater.coverAnnual)} of a year's hot water, and all of it in the sunniest months. Worth about ${formatGBP(E.hotWaterSavingsGBP)} a year.`,
  },
];

export default function Hero() {
  return (
    <section id="overview" className="pt-32 pb-24 bg-gradient-to-br from-orange-50/80 via-white to-red-50/60 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/40 to-red-100/20"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-red-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-8">
            Open-Source DIY Solar · Power + Hot Water
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">Heat Loom</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Solar panels that power your home first — and turn the spare into hot water, instead of giving it to the grid
            for nothing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
            <div className="bg-white/80 rounded-2xl p-5 shadow-sm border border-orange-100">
              <div className="text-3xl font-black text-gray-900">{formatGBP(E.costGBP)}</div>
              <div className="text-gray-600 text-sm mt-1">in parts</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-5 shadow-sm border border-orange-100">
              <div className="text-3xl font-black text-green-700">{formatGBP(E.savingsGBP)} a year</div>
              <div className="text-gray-600 text-sm mt-1">saved on electricity and gas</div>
            </div>
            <div className="bg-white/80 rounded-2xl p-5 shadow-sm border border-orange-100">
              <div className="text-3xl font-black text-orange-700">{E.paybackYears.toFixed(1)} years</div>
              <div className="text-gray-600 text-sm mt-1">to pay for itself</div>
            </div>
          </div>
          <p className="text-gray-500 text-xs max-w-3xl mx-auto mb-12">
            Modelled for a southern England home that heats its water with gas, at October 2026 prices. In a poor year:{' '}
            {formatGBP(E.pessimisticSavingsGBP)} and {E.pessimisticPaybackYears.toFixed(1)} years. Parts only — the electrician
            who connects it and the scaffold for the roof are extra.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#build"
              className="group flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-2xl transition-all duration-300 font-semibold text-lg shadow-lg"
            >
              <span>See the build</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#calculator"
              className="flex items-center justify-center space-x-3 px-8 py-4 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 rounded-2xl transition-all duration-300 font-semibold text-lg"
            >
              <Calculator className="w-5 h-5" />
              <span>Run your numbers</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CARDS.map((c) => (
            <div key={c.title} className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-orange-100/50">
              <div className={`w-16 h-16 bg-gradient-to-br ${c.box} rounded-3xl flex items-center justify-center mb-6 shadow-lg`}>{c.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{c.title}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
