import { Ban, Gauge, Repeat, Lightbulb } from 'lucide-react';

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
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Why we deleted our own turbine</h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Heat Loom started with an ORC — a steam engine running on refrigerant — making electricity from stored heat.
            We removed it, and the arithmetic that made us do it is the most honest page on this site.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-10 rounded-3xl border border-orange-200/50">
            <div className="flex items-center space-x-3 mb-6">
              <Gauge className="w-8 h-8 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">The wall is Carnot, not engineering</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              Every heat engine obeys <strong>η ≤ 1 − T<sub>cold</sub>/T<sub>hot</sub></strong>. Sand at 250 °C
              exhausting to a 20 °C garden: a ceiling of ~44%, of which real small machines harvest about a third.
              That's the 15–18% — not a flaw in the ORC, the arithmetic of boiling at modest temperatures.
            </p>
            <div className="bg-white p-6 rounded-2xl border border-orange-200/60 font-mono text-sm text-gray-800 space-y-1">
              <div>collector: 60% of sunlight → heat</div>
              <div>ORC: 18% of heat → electricity</div>
              <div className="text-red-600 font-bold">= 10.8% sun → electricity</div>
              <div className="text-blue-600 font-bold">PV alone: 22% sun → electricity</div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-6">
              Our turbine made electricity out of sunlight <em>worse than a £120 panel</em> — while consuming the
              heat that was the valuable product all along.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-3xl border border-blue-200/50">
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
                At district-heating or industrial scale — with Polar-Night-style sand stores — ORCs and steam
                earn their keep. In a garden, the honest answer is: photons → electrons directly (PV);
                photons → heat when heat is the job (sand).
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
