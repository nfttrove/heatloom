import { Ban, Gauge, Repeat, Lightbulb } from 'lucide-react';
import { COLLECTOR_EFFICIENCY, ORC_EFFICIENCY, ELECTRICITY_GBP_PER_KWH, HEAT_SOURCES } from '../utils/heatloom';

// Carnot from 250 °C sand to a 20 °C garden, and what the ORC does with a kWh of heat.
const T_HOT_K = 250 + 273.15;
const T_COLD_K = 20 + 273.15;
const CARNOT = 1 - T_COLD_K / T_HOT_K;
const SUN_TO_ELECTRIC = COLLECTOR_EFFICIENCY * ORC_EFFICIENCY;
const PENCE_VIA_ORC = ORC_EFFICIENCY * ELECTRICITY_GBP_PER_KWH * 100;
const pct = (x: number) => `${(x * 100).toFixed(x < 0.2 ? 1 : 0)}%`;

const ENGINES = [
  { name: 'Utility steam (600 °C, gigawatts)', eff: '40–45%', verdict: 'magnificent — at scale we will never own', tone: 'text-emerald-600' },
  { name: 'Organic Rankine Cycle (our former turbine)', eff: '15–18%', verdict: 'the best small heat engine — still the weakest link', tone: 'text-orange-600' },
  { name: 'Stirling engine', eff: '5–15% real', verdict: 'beautiful theory; seals and regenerators defeat garage builders', tone: 'text-gray-600' },
  { name: 'Thermoelectric (TEG)', eff: '3–6%', verdict: 'no moving parts, 5× efficiency tax', tone: 'text-gray-600' },
  { name: 'Photovoltaic panel', eff: '~22%', verdict: 'not a heat engine at all — no Carnot, no working fluid', tone: 'text-blue-600' },
];

export default function WhyNoTurbine() {
  return (
    <section id="why-no-turbine" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-8">
            <Ban className="w-4 h-4 mr-2" />
            The Feature We Removed
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why we deleted our own turbine</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Heat Loom started with an ORC — a steam engine running on refrigerant — making electricity from stored heat.
            We removed it, and the arithmetic that made us do it is the most honest page on this site.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 md:p-10 rounded-3xl border border-orange-200/50">
            <div className="flex items-center space-x-3 mb-6">
              <Gauge className="w-8 h-8 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">The wall is Carnot, not engineering</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              Every heat engine obeys <strong>η ≤ 1 − T<sub>cold</sub>/T<sub>hot</sub></strong>. Sand at 250 °C
              exhausting to a 20 °C garden: a ceiling of ~{pct(CARNOT)}, of which real small machines harvest a third to
              two-fifths. That's the 15–18% — not a flaw in the ORC, the arithmetic of boiling at modest temperatures.
            </p>
            <div className="bg-white p-6 rounded-2xl border border-orange-200/60 font-mono text-sm text-gray-800 space-y-1">
              <div>collector: {pct(COLLECTOR_EFFICIENCY)} of sunlight → heat</div>
              <div>ORC: {pct(ORC_EFFICIENCY)} of heat → electricity</div>
              <div className="text-red-700 font-bold">= {pct(SUN_TO_ELECTRIC)} sun → electricity</div>
              <div className="text-blue-700 font-bold">PV alone: ~22% sun → electricity (panel rating)</div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-6">
              Our turbine made electricity out of sunlight <em>worse than a £120 panel</em>. And each kWh of heat it
              consumed became about {PENCE_VIA_ORC.toFixed(1)}p of electricity — barely more than the{' '}
              {(HEAT_SOURCES.gas.gbpPerKWh * 100).toFixed(1)}p that heat is worth against gas, and much less than the{' '}
              {(HEAT_SOURCES.heatPump.gbpPerKWh * 100).toFixed(1)}p it is worth against a heat pump.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-10 rounded-3xl border border-blue-200/50">
            <div className="flex items-center space-x-3 mb-6">
              <Lightbulb className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">What an ORC actually is</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              A steam engine with a different fluid: pentane boils at 36 °C, so low-grade heat can run the loop —
              boil, expand through a turbine, condense, pump back. The power is in the expanding gas; resetting
              the fluid costs almost nothing because you pump it as a liquid.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              The best intuition: <strong>it's an air conditioner running backwards</strong>. Same hardware,
              opposite direction — an AC spends electricity moving heat uphill; an ORC lets heat flow downhill
              and skims electricity off the fall.
            </p>
            <div className="flex items-start space-x-2 bg-white p-4 rounded-xl border border-blue-200/60">
              <Repeat className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-sm leading-relaxed">
                At district-heating or industrial scale, big sand stores (Polar Night Energy's in Finland) earn
                their keep selling heat, and ORCs earn theirs on industrial waste heat. In a garden, the honest
                answer is: photons → electrons directly (PV); photons → heat when heat is the job.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-10 rounded-3xl border border-gray-200/60">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Heat-to-electricity, ranked honestly</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                  <th className="p-4 text-left font-bold rounded-tl-xl">Machine</th>
                  <th className="p-4 text-center font-bold">Real efficiency</th>
                  <th className="p-4 text-left font-bold rounded-tr-xl">Honest verdict</th>
                </tr>
              </thead>
              <tbody>
                {ENGINES.map((e) => (
                  <tr key={e.name} className="bg-white even:bg-gray-50/60">
                    <td className="p-4 font-medium text-gray-800">{e.name}</td>
                    <td className={`p-4 text-center font-bold font-mono ${e.tone}`}>{e.eff}</td>
                    <td className="p-4 text-gray-600">{e.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
