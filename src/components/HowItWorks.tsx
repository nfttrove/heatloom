import { Home, Droplets, PlugZap } from 'lucide-react';
import { loomPlan, DEFAULT_LOOM, storeRetention } from '../utils/heatloom';

const PLAN = loomPlan(DEFAULT_LOOM);
const kwh = (x: number) => Math.round(x).toLocaleString('en-GB');
const pct = (x: number) => `${Math.round(x * 100)}%`;

// How much a hot tank cools overnight, indoors at 18 °C: jacketed, and with a
// typical cylinder's thinner factory foam (up to about 3.5× the heat loss).
const TANK = storeRetention(DEFAULT_LOOM.tankKWh, 'water');
const overnightDrop = (uFactor: number, fromC = 60, roomC = 18, hours = 12) => {
  const tauH = (TANK.timeConstantDays * 24) / uFactor;
  return (fromC - roomC) * (1 - Math.exp(-hours / tauH));
};

/** Sun → panels → loom → house first, tank second, grid last; tubes optional. */
function LoomDiagram() {
  return (
    <svg viewBox="0 0 760 300" role="img" aria-labelledby="loom-diagram-title" className="w-full max-w-4xl mx-auto h-auto">
      <title id="loom-diagram-title">
        Heat Loom: sunlight reaches the solar panels; their electricity goes to the loom controller, which feeds the house
        first, sends spare power to the hot-water tank second, and lets only what is left go to the grid. Optional solar
        tubes heat the same tank directly.
      </title>
      <defs>
        <marker id="lm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-gray-500" />
        </marker>
      </defs>
      <circle cx="60" cy="120" r="34" className="fill-yellow-300" />
      <text x="60" y="125" textAnchor="middle" className="fill-gray-800 text-[13px] font-semibold">Sun</text>
      <line x1="96" y1="120" x2="148" y2="120" className="stroke-gray-500" strokeWidth="2" markerEnd="url(#lm-arrow)" />
      <rect x="152" y="85" width="140" height="70" rx="12" className="fill-blue-100 stroke-blue-500" strokeWidth="2" />
      <text x="222" y="115" textAnchor="middle" className="fill-gray-900 text-[14px] font-bold">Solar panels</text>
      <text x="222" y="135" textAnchor="middle" className="fill-gray-600 text-[11px]">{DEFAULT_LOOM.pvKwp} kWp</text>
      <line x1="292" y1="120" x2="340" y2="120" className="stroke-gray-500" strokeWidth="2" markerEnd="url(#lm-arrow)" />
      <rect x="344" y="80" width="130" height="80" rx="14" className="fill-orange-100 stroke-orange-500" strokeWidth="2" />
      <text x="409" y="115" textAnchor="middle" className="fill-gray-900 text-[15px] font-bold">The loom</text>
      <text x="409" y="135" textAnchor="middle" className="fill-gray-600 text-[11px]">decides where it goes</text>
      <line x1="474" y1="100" x2="560" y2="55" className="stroke-gray-500" strokeWidth="2" markerEnd="url(#lm-arrow)" />
      <line x1="474" y1="120" x2="560" y2="140" className="stroke-gray-500" strokeWidth="2" markerEnd="url(#lm-arrow)" />
      <line x1="474" y1="145" x2="560" y2="230" className="stroke-gray-400" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#lm-arrow)" />
      <rect x="564" y="25" width="170" height="56" rx="12" className="fill-green-100 stroke-green-500" strokeWidth="2" />
      <text x="649" y="50" textAnchor="middle" className="fill-gray-900 text-[14px] font-bold">1 · Your home</text>
      <text x="649" y="68" textAnchor="middle" className="fill-gray-600 text-[11px]">lights, fridge, washing</text>
      <rect x="564" y="112" width="170" height="56" rx="12" className="fill-red-100 stroke-red-500" strokeWidth="2" />
      <text x="649" y="137" textAnchor="middle" className="fill-gray-900 text-[14px] font-bold">2 · Hot-water tank</text>
      <text x="649" y="155" textAnchor="middle" className="fill-gray-600 text-[11px]">the spare, as hot water</text>
      <rect x="564" y="203" width="170" height="56" rx="12" className="fill-gray-100 stroke-gray-400" strokeWidth="2" />
      <text x="649" y="228" textAnchor="middle" className="fill-gray-900 text-[14px] font-bold">3 · The grid</text>
      <text x="649" y="246" textAnchor="middle" className="fill-gray-600 text-[11px]">only when the tank is full</text>
      <rect x="152" y="215" width="140" height="56" rx="12" className="fill-white stroke-gray-400" strokeWidth="2" strokeDasharray="5 4" />
      <text x="222" y="240" textAnchor="middle" className="fill-gray-900 text-[13px] font-bold">Solar tubes</text>
      <text x="222" y="258" textAnchor="middle" className="fill-gray-600 text-[11px]">optional add-on</text>
      <path d="M292 243 C 420 243, 470 200, 560 158" fill="none" className="stroke-gray-400" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#lm-arrow)" />
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How it works</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Every unit of sunshine goes to the most useful place first.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-4 md:p-8 mb-16">
          <LoomDiagram />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-100">
            <Home className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">1 · Your home first</h3>
            <p className="text-gray-600 leading-relaxed">
              Whatever the house is using right now comes straight from the panels. Over a year that is about{' '}
              {kwh(PLAN.pv.houseKWh)} kWh of electricity you don't buy.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100">
            <Droplets className="w-10 h-10 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">2 · The spare heats your water</h3>
            <p className="text-gray-600 leading-relaxed">
              A diverter — the loom, or a bought one meanwhile — measures the power flowing out to the grid and turns the
              tank's immersion heater up by that much, so little is exported while the tank can take it: about{' '}
              {kwh(PLAN.pv.toTankKWh)} kWh a year that would otherwise be given away.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
            <PlugZap className="w-10 h-10 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">3 · Only then the grid</h3>
            <p className="text-gray-600 leading-relaxed">
              When the tank is hot, the rest goes to the grid. A DIY install isn't paid for exports, which is exactly why
              the tank comes first.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-3xl border border-orange-200/60">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why a hot-water tank?</h3>
            <p className="text-gray-700 leading-relaxed">
              It stores energy as the thing you were going to buy anyway, and many homes already have one — any
              cylinder with an immersion heater will do. It holds its heat well: a {Math.round(TANK.massKg)}-litre tank at 60 °C loses only about{' '}
              {overnightDrop(1).toFixed(0)}–{overnightDrop(3.5).toFixed(0)} °C overnight, depending on its insulation — so
              an afternoon's sun is still there for the evening and the next morning. It sits indoors, and the panels hold
              no water, so there is nothing outside to freeze.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-200/60">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Through the year</h3>
            <p className="text-gray-700 leading-relaxed">
              From spring to autumn the panels cover up to {pct(PLAN.hotWater.coverBestMonth)} of your hot water. In
              December they make far less, and cover about {pct(PLAN.hotWater.coverDecember)} — your boiler does the rest,
              and keeps the tank at a safe 60 °C. Heat Loom heats water, not radiators.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
