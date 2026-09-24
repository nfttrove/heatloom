import { useState } from 'react';
import { Calculator, Zap, TrendingUp, MapPin, Settings, CheckCircle, AlertTriangle, PoundSterling, Thermometer, Coffee, BarChart3, Snowflake } from 'lucide-react';
import {
  recommendRig,
  annualSavingsGBP,
  systemCostGBP,
  lossBudget,
  SizingMode,
  RigOutput,
  COLLECTOR_EFFICIENCY_RANGE,
  COST_GBP_PER_M2,
  ELECTRICITY_GBP_PER_KWH,
  HEAT_GBP_PER_KWH,
  ORC_EFFICIENCY,
  SAND_KG_PER_KWH,
  formatGBP,
} from '../utils/heatloom';

const RIG_NAMES: Record<number, string> = { 10: 'Small Yard', 20: 'Medium Pilot', 30: 'Container Scale' };

interface ConfigResult {
  recommended: RigOutput;
  meetsTarget: boolean;
  rigs: RigOutput[];
  seasonalAdj: string;
  seasonalSerious: boolean;
  costGBP: number;
  savingsPerYear: number;
  savingsNaive: number;
  lossRows: { label: string; kwhIn: number; kwhLost: number; kwhOut: number; note: string }[];
  incidentKWh: number;
  collectedKWh: number;
}

const one = (x: number) => x.toFixed(1);

export default function Configurator() {
  const [dailyUse, setDailyUse] = useState(8);
  const [dni, setDni] = useState(5);
  const [showHeatOnly, setShowHeatOnly] = useState(true);
  const [sizingMode, setSizingMode] = useState<SizingMode>('annual');
  const [result, setResult] = useState<ConfigResult | null>(null);

  const calculate = () => {
    const use = Math.max(0.1, dailyUse || 0);
    const sun = Math.max(0.1, dni || 0);
    const { rigs, recommended, meetsTarget } = recommendRig([10, 20, 30], use, sun, sizingMode);
    const costGBP = systemCostGBP(recommended.areaM2);
    const savingsPerYear = annualSavingsGBP(use, recommended);
    const w = recommended.winterElectricKWhPerDay;
    const seasonalSerious = w < use * 0.5;
    const seasonalAdj = seasonalSerious
      ? `At this sunshine the rig's December output is about ${one(w)} kWh/day — ${(100 * w / use).toFixed(0)}% of your ${use} kWh/day target. The annual-average numbers will not hold in winter; the grid stays part of an honest design.`
      : w < use
        ? `Winter output (${one(w)} kWh/day) sits below your ${use} kWh/day target — expect partial winter coverage, with a midsummer surplus (${one(recommended.summerElectricKWhPerDay)} kWh/day).`
        : `Winter output (${one(w)} kWh/day) still covers your ${use} kWh/day at this sunshine.`;
    const budget = lossBudget(sun, recommended.areaM2);
    setResult({
      recommended,
      meetsTarget,
      rigs,
      seasonalAdj,
      seasonalSerious,
      costGBP,
      savingsPerYear,
      savingsNaive: use * 365 * ELECTRICITY_GBP_PER_KWH,
      lossRows: budget.rows.map((r) => ({ label: r.label, kwhIn: r.kwhIn, kwhLost: r.kwhLost, kwhOut: r.kwhOut, note: r.note })),
      incidentKWh: budget.incidentKWhPerDay,
      collectedKWh: budget.collectedKWhPerDay,
    });
  };

  const rec = result?.recommended;
  const payback = result ? result.costGBP / Math.max(result.savingsPerYear, 1) : 0;
  const heatOnlyGBP = rec ? rec.thermalKWhPerDay * 365 * HEAT_GBP_PER_KWH : 0;

  return (
    <section id="configurator" className="py-24 bg-gradient-to-br from-gray-50 to-orange-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Heat Loom Configurator</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Size the research rig — mirror troughs, a hot sand store and an ORC for electricity — and see
            honestly why we retired it as a house system. For a house, use the Hybrid above.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Input Section */}
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-orange-100/50">
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">System Requirements</h3>
                <p className="text-gray-500 font-medium">Tell us about your energy needs</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200/50">
                <label htmlFor="cfg-use" className="block text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span>Daily Electricity Use (kWh/day)</span>
                </label>
                <input
                  id="cfg-use"
                  type="number"
                  min={0.1}
                  value={dailyUse}
                  onChange={(e) => setDailyUse(parseFloat(e.target.value))}
                  className="w-full p-4 rounded-xl border border-orange-200 focus:border-orange-500 focus:outline-none text-lg font-medium"
                />
                <p className="text-gray-600 text-sm mt-2">A typical UK home uses about 7.4 kWh/day (Ofgem's medium figure, 2,700 kWh/yr).</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200/50">
                <label htmlFor="cfg-dni" className="block text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>DNI (Direct Normal Irradiance, kWh/m²/day)</span>
                </label>
                <input
                  id="cfg-dni"
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={dni}
                  onChange={(e) => setDni(parseFloat(e.target.value))}
                  className="w-full p-4 rounded-xl border border-blue-200 focus:border-blue-500 focus:outline-none text-lg font-medium"
                />
                <p className="text-gray-600 text-sm mt-2">
                  Direct sunlight only — troughs can't focus diffuse light. Roughly: southern England 2.5, southern Spain 5.5–6, deserts 7–8.
                </p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Snowflake className="w-5 h-5 text-slate-600" />
                  <span className="text-lg font-bold text-gray-900">Size the rig for…</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {([
                    { v: 'annual' as SizingMode, label: 'Annual average', hint: 'smaller rig, admits a winter shortfall' },
                    { v: 'winter' as SizingMode, label: 'Dark December', hint: 'bigger rig, aims at the worst month' },
                  ]).map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setSizingMode(o.v)}
                      aria-pressed={sizingMode === o.v}
                      title={o.hint}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        sizingMode === o.v
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-gray-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Sizing on the annual average is how solar projects end up apologizing in December. December here uses
                  southern England's tilted-panel sunshine shape; direct beam, which troughs need, falls further in a UK
                  winter, so the rig's UK December figure is optimistic.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200/50">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showHeatOnly}
                    onChange={(e) => setShowHeatOnly(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded"
                  />
                  <span className="text-gray-900 font-bold flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-purple-600" />
                    <span>Also show the heat-only alternative</span>
                  </span>
                </label>
                <p className="text-gray-600 text-sm mt-2">
                  The same troughs without the ORC: all the collected heat, none of the electricity.
                </p>
              </div>

              <button
                onClick={calculate}
                className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl"
              >
                <Calculator className="w-6 h-6" />
                <span>Get My Recommendation</span>
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100">
            {result && rec ? (
              <div>
                <div className="flex items-center space-x-4 mb-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${result.meetsTarget ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-yellow-500 to-orange-600'}`}>
                    {result.meetsTarget ? <CheckCircle className="w-7 h-7 text-white" /> : <AlertTriangle className="w-7 h-7 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {result.meetsTarget ? 'Recommended' : 'Largest option'}: {RIG_NAMES[rec.areaM2]}
                    </h3>
                    <p className="text-gray-500 font-medium">
                      {result.meetsTarget
                        ? 'The smallest size that meets your target on this basis'
                        : 'No size here meets your target on this basis — this is the largest'}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-8 rounded-2xl border border-green-200/50 mb-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-orange-600 mb-2">{rec.areaM2}</div>
                      <p className="text-gray-600 font-medium">m² Mirror Area</p>
                    </div>
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{one(rec.electricKWhPerDay)}</div>
                      <p className="text-gray-600 font-medium">kWh/day Electric</p>
                      <p className="text-gray-500 text-xs mt-1">
                        band {one(rec.pessimisticElectricKWhPerDay)}–{one(rec.summerElectricKWhPerDay)} · December {one(rec.winterElectricKWhPerDay)}
                      </p>
                    </div>
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-red-600 mb-2">{one(rec.thermalKWhPerDay)}</div>
                      <p className="text-gray-600 font-medium">kWh/day Heat collected</p>
                    </div>
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{Math.round(rec.sandMassKg)}</div>
                      <p className="text-gray-600 font-medium">kg Sand (one day)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <PoundSterling className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-gray-900">Economics (electricity)</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-600">Estimated cost:</span>
                          <span className="font-bold text-gray-900">{formatGBP(result.costGBP)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-600">Annual savings:</span>
                          <span className="font-bold text-green-600">{formatGBP(result.savingsPerYear)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-600">Payback period:</span>
                          <span className="font-bold text-orange-600">{payback.toFixed(0)} years</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs mt-3">
                        Research-rig parts from the Build Guide, about {formatGBP(COST_GBP_PER_M2)} per m², scaled; the ORC itself is not priced.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <Coffee className="w-5 h-5 text-orange-600" />
                        <h4 className="font-bold text-gray-900">In kettles</h4>
                      </div>
                      <p className="text-gray-600">~{(rec.electricKWhPerDay * 8.3).toFixed(0)} kettle boils per day of electricity.</p>
                      <p className="text-gray-500 text-xs mt-3">
                        The ORC's other {one(rec.rejectHeatKWhPerDay)} kWh/day leaves its condenser at about 30–40 °C — too cool to heat a home.
                      </p>
                    </div>
                  </div>
                </div>

                {showHeatOnly && (
                  <div className="p-6 rounded-2xl mb-10 bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200/50">
                    <h4 className="font-bold text-lg mb-2 text-purple-900">Heat-only alternative (no ORC)</h4>
                    <p className="text-gray-700 leading-relaxed">
                      The same {rec.areaM2} m² delivers {one(rec.thermalKWhPerDay)} kWh/day of heat on average instead of{' '}
                      {one(rec.electricKWhPerDay)} kWh/day of electricity — worth about {formatGBP(heatOnlyGBP)} a year against gas
                      if every kWh met demand, which in summer it would not. That trade is why the Hybrid keeps the heat and buys PV
                      for electricity.
                    </p>
                  </div>
                )}

                <div className={`p-6 rounded-2xl mb-10 ${result.seasonalSerious ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${result.seasonalSerious ? 'bg-yellow-500' : 'bg-green-500'}`}>
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg mb-2 ${result.seasonalSerious ? 'text-yellow-800' : 'text-green-800'}`}>
                        Seasonal Performance
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{result.seasonalAdj}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 rounded-2xl border border-gray-200/50 mb-10">
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-gray-700" />
                    <span>Loss Budget — where each day of sunlight goes</span>
                  </h4>
                  <p className="text-gray-600 text-sm mb-6">
                    {result.incidentKWh.toFixed(0)} kWh/day of direct sunshine lands on {rec.areaM2} m² of mirrors;{' '}
                    {one(result.collectedKWh)} kWh/day survives. Each factor is a stated estimate (hover a row), and the whole chain
                    carries a {COLLECTOR_EFFICIENCY_RANGE.low}–{COLLECTOR_EFFICIENCY_RANGE.high} band.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                          <th className="p-3 text-left font-bold rounded-tl-xl">Stage</th>
                          <th className="p-3 text-right font-bold">kWh in</th>
                          <th className="p-3 text-right font-bold">kWh lost</th>
                          <th className="p-3 text-right font-bold rounded-tr-xl">kWh out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.lossRows.map((row) => (
                          <tr key={row.label} className="bg-white even:bg-gray-50/60" title={row.note}>
                            <td className="p-3 text-gray-800 font-medium">{row.label}</td>
                            <td className="p-3 text-right text-gray-600 font-mono">{one(row.kwhIn)}</td>
                            <td className="p-3 text-right text-red-600 font-mono">−{one(row.kwhLost)}</td>
                            <td className="p-3 text-right text-emerald-700 font-mono">{one(row.kwhOut)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 rounded-2xl border border-gray-200/50">
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-gray-700" />
                    <span>Size Comparison</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          <th className="p-4 text-left font-bold rounded-tl-xl">System Size</th>
                          <th className="p-4 text-center font-bold">Area (m²)</th>
                          <th className="p-4 text-center font-bold">Heat collected (kWh/day)</th>
                          <th className="p-4 text-center font-bold">Electric via ORC (kWh/day)</th>
                          <th className="p-4 text-center font-bold rounded-tr-xl">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rigs.map((rig) => (
                          <tr
                            key={rig.areaM2}
                            className={`${rig.areaM2 === rec.areaM2
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500'
                              : 'bg-white hover:bg-gray-50'
                            } transition-colors`}
                          >
                            <td className="p-4 font-bold text-gray-900">
                              <div className="flex items-center space-x-2">
                                {rig.areaM2 === rec.areaM2 && <CheckCircle className="w-4 h-4 text-green-600" />}
                                <span>{RIG_NAMES[rig.areaM2]}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center text-gray-700 font-medium">{rig.areaM2}</td>
                            <td className="p-4 text-center text-red-600 font-bold">{one(rig.thermalKWhPerDay)}</td>
                            <td className="p-4 text-center text-blue-600 font-bold">{one(rig.electricKWhPerDay)}</td>
                            <td className="p-4 text-center text-gray-800 font-bold">{formatGBP(systemCostGBP(rig.areaM2))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready for Your Recommendation</h3>
                <p className="text-gray-600 text-lg">
                  Enter your requirements and click "Get My Recommendation" to size the research rig.
                </p>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-12 bg-white p-6 md:p-8 rounded-2xl border border-orange-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calculator className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-3 text-orange-700">Sizing Notes (the honest ones)</h4>
                <p className="text-gray-700 leading-relaxed">
                  Numbers come from the tested engineering module (open source, in the repo): a trough loss chain
                  multiplying to ≈60% (the Loss Budget above), {Math.round(ORC_EFFICIENCY * 100)}% ORC conversion, and{' '}
                  {SAND_KG_PER_KWH} kg of sand per thermal kWh — which assumes a generous 400 K store swing.
                  Savings count only electricity the rig generates in each month, so they sit below the naive{' '}
                  {formatGBP(result.savingsNaive)} a flat calculation would promise. The pessimistic case assumes −10%
                  sun and the low end of the efficiency band. Nothing here has been built and measured.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
