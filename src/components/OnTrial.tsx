import { Gavel, FileCheck2, ExternalLink } from 'lucide-react';

const CLAIMS = [
  {
    title: 'Heat Loom Hybrid rev B (sourced 2026 prices, UK)',
    value: '3,874 kWh/yr household energy, £3,100 system',
    hash: '1eec59b9…ec8d80',
    verdict:
      'Same energy prediction as rev A — the audit changed costs, not physics: real panel/inverter prices (£550/kWp not £400) and the previously-forgotten pump station and controller (£500) raised the starter rig from £2,300 to £3,100 and payback from 3.7 to 5.0 years. Rev A stands below, unedited: that is what pre-registration is for.',
    status: 'Revised claim — superseding rev A, filed after a web-sourced cost audit',
  },
  {
    title: 'Heat Loom Medium Pilot (20 m², DNI 5)',
    value: '450.77 W mean electric',
    hash: '22c8b908…c4b30d3',
    verdict:
      'Solar-thermal, books balance: 10.8% of incident sunlight end-to-end (loss chain 0.601 × ORC 0.18); no conservation anomaly.',
    status: 'Concept ceiling — pre-registered before hardware',
  },
  {
    title: 'Heat Loom Hybrid (2 kWp PV + 3 m² thermal + 40 kWh sand, UK)',
    value: '3,874 kWh/yr household energy',
    hash: 'cacf361a…57ed364',
    verdict:
      '£2,300 of parts, £621/yr saved, 3.7-year payback — with December coverage honestly stated at 14% electric / 8% heat.',
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
          <h2 className="text-5xl font-bold text-white mb-6">Our numbers are on trial</h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-light">
            Before any Heat Loom hardware exists, our performance predictions are pre-registered in the
            In Fini claim registry — an open-source project built to put extraordinary energy claims on trial
            with artifact budgets and error bars. When someone builds one and measures it, the comparison
            will be public, mechanical, and hash-verified. We decided to volunteer first.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {CLAIMS.map((c) => (
            <div key={c.title} className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
              <div className="flex items-start space-x-3 mb-5">
                <FileCheck2 className="w-7 h-7 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white leading-snug">{c.title}</h3>
                  <p className="text-orange-300 font-mono text-sm mt-1">{c.value}</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm mb-5">{c.verdict}</p>
              <div className="bg-black/30 rounded-xl px-4 py-3 mb-4">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">SHA-256 commitment</div>
                <div className="font-mono text-xs text-emerald-400 break-all">{c.hash}</div>
              </div>
              <p className="text-gray-400 text-xs italic">{c.status}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://in-fini.com/?tab=registry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-semibold transition-colors"
          >
            <span>Inspect the claims in the In Fini registry</span>
            <ExternalLink className="w-5 h-5" />
          </a>
          <p className="text-gray-500 text-sm mt-6 max-w-2xl mx-auto">
            No solar company we know of publishes pre-registered, hash-committed performance predictions
            before selling a product. If our rigs underperform their predictions, the record will show it —
            that is the point.
          </p>
        </div>
      </div>
    </section>
  );
}
