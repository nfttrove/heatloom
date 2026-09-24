import { Gavel, FileCheck2, ExternalLink, Scale, History } from 'lucide-react';
import {
  hybridPlan,
  hybridProductionKWhPerYear,
  rigOutput,
  COLLECTOR_EFFICIENCY,
  COLLECTOR_EFFICIENCY_RANGE,
  DEFAULT_HYBRID,
  REGISTERED_HYBRID_KWH_PER_YEAR,
  formatGBP,
} from '../utils/heatloom';

// The Medium Pilot claim as the model computes it: mean electric watts and its band.
const PILOT = rigOutput(20, 5);
const PILOT_W = (PILOT.electricKWhPerDay / 24) * 1000;
const PILOT_LOW_W = (PILOT.pessimisticElectricKWhPerDay / 24) * 1000;

const REGISTERED = Number(REGISTERED_HYBRID_KWH_PER_YEAR);
const NOW = hybridProductionKWhPerYear();
const PLAN = hybridPlan(DEFAULT_HYBRID);
const kwh = (x: number) => Math.round(x).toLocaleString('en-GB');

// As filed. The descriptions are history and stay as written; only the title
// and one value of each claim are inside its hash.
const CLAIMS = [
  {
    title: 'Heat Loom Hybrid rev B (sourced 2026 prices, UK)',
    value: '3,874 kWh/yr household energy, £3,100 system',
    committed: `"${REGISTERED_HYBRID_KWH_PER_YEAR}"`,
    hash: '1eec59b9…ec8d80',
    verdict:
      'As filed: same energy prediction as rev A — the audit changed costs, not physics: real panel/inverter prices (£550/kWp not £400) and the previously-forgotten pump station and controller (£500) raised the starter rig from £2,300 to £3,100 and payback from 3.7 to 5.0 years. Rev A stands below, unedited: that is what pre-registration is for.',
    status: 'Revised claim — superseding rev A, filed after a web-sourced cost audit',
  },
  {
    title: 'Heat Loom Medium Pilot (20 m², DNI 5)',
    value: `≈ ${Math.round(PILOT_W)} W mean electric (model band ${Math.round(PILOT_LOW_W)}–${Math.round(PILOT_W)} W)`,
    committed: '"450.775"',
    hash: '22c8b908…c4b30d3',
    verdict: `As filed: solar-thermal, books balance — ${(COLLECTOR_EFFICIENCY * 0.18 * 100).toFixed(1)}% of incident sunlight end-to-end (loss chain ${COLLECTOR_EFFICIENCY.toFixed(3)} × ORC 0.18); no conservation anomaly. The low end of the band uses ${COLLECTOR_EFFICIENCY_RANGE.low} efficiency and −10% sun.`,
    status: 'Concept ceiling — pre-registered before hardware',
  },
  {
    title: 'Heat Loom Hybrid (2 kWp PV + 3 m² thermal + 40 kWh sand, UK)',
    value: '3,874 kWh/yr household energy',
    committed: `"${REGISTERED_HYBRID_KWH_PER_YEAR}"`,
    hash: 'cacf361a…57ed364',
    verdict:
      'As filed: £2,300 of parts, £621/yr saved, 3.7-year payback — with December coverage honestly stated at 14% electric / 8% heat.',
    status: 'The buildable version — pre-registered before hardware',
  },
];

export default function OnTrial() {
  return (
    <section id="on-trial" className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium mb-8">
            <Gavel className="w-4 h-4 mr-2" />
            Public Accountability
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our numbers are on trial</h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-light">
            Before any Heat Loom hardware exists, our production predictions are pre-registered in the In Fini claim
            registry — an open-source project built to put extraordinary energy claims on trial with artifact budgets and
            error bars. When someone builds one and measures it, the comparison will be public. We decided to volunteer
            first — and our own audit has already found us optimistic.
          </p>
        </div>

        <div className="bg-orange-500/10 border border-orange-400/40 p-6 md:p-8 rounded-3xl mb-10">
          <div className="flex items-start space-x-3">
            <History className="w-7 h-7 text-orange-300 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Since registration: the corrected model predicts less</h3>
              <p className="text-gray-200 leading-relaxed">
                For the same default Hybrid the model now predicts {kwh(NOW)} kWh/yr of production —{' '}
                {Math.round((100 * (REGISTERED - NOW)) / REGISTERED)}% below the registered {kwh(REGISTERED)} — because the
                evacuated tubes no longer borrow the mirror troughs' loss chain and direct-sunlight input. Savings fell
                further: with half the PV used at home, monthly caps and heat valued at gas, the starter saves about{' '}
                {formatGBP(PLAN.economics.annualSavingsGBP)} a year, a {PLAN.economics.paybackYears.toFixed(1)}-year payback.
                Rev A and rev B stand unedited below; a rev C with the corrected prediction has not been filed yet.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {CLAIMS.map((c) => (
            <div key={c.title} className="bg-white/5 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-white/10">
              <div className="flex items-start space-x-3 mb-5">
                <FileCheck2 className="w-7 h-7 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white leading-snug">{c.title}</h3>
                  <p className="text-orange-300 font-mono text-sm mt-1">{c.value}</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm mb-5">{c.verdict}</p>
              <div className="bg-black/30 rounded-xl px-4 py-3 mb-4">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">SHA-256 commitment · value committed {c.committed}</div>
                <div className="font-mono text-xs text-emerald-400 break-all">{c.hash}</div>
              </div>
              <p className="text-gray-400 text-xs italic">{c.status}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl mb-12">
          <div className="flex items-start space-x-3">
            <Scale className="w-7 h-7 text-emerald-300 mt-1 flex-shrink-0" />
            <div className="text-gray-300 text-sm leading-relaxed space-y-2">
              <h3 className="text-lg font-bold text-white">What a commitment does and doesn't prove</h3>
              <p>
                Each hash commits one claim's title, the registry's claim type and a single value. For the Hybrid claims that
                value is annual production, "{REGISTERED_HYBRID_KWH_PER_YEAR}" kWh/yr — filed under the registry's "power"
                type — and the model at the time gave 3,874.39, rounded up when filed. Costs, savings, payback and December
                coverage in the descriptions are not inside any hash.
              </p>
              <p>
                Timestamps on filings made before In Fini began stamping them server-side (September 2026) are as the filing
                client sent them, so they show order rather than prove a date. A fair comparison with a built rig will also
                need a stated measurement protocol and weather normalisation, which we have not yet written.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="https://in-fini.com/?tab=registry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold transition-colors"
          >
            <span>Inspect the claims in the In Fini registry</span>
            <ExternalLink className="w-5 h-5" />
          </a>
          <p className="text-gray-400 text-sm mt-6 max-w-2xl mx-auto">
            No solar company we know of publishes pre-registered, hash-committed performance predictions before selling a
            product. If our rigs underperform their predictions, the record will show it — that is the point.
          </p>
        </div>
      </div>
    </section>
  );
}
