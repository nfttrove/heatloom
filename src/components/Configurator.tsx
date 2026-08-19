import { useState } from 'react';
import { Calculator, Zap, Home, TrendingUp, MapPin, Settings, CheckCircle, DollarSign, Thermometer, Coffee, Droplets, BarChart3, Snowflake } from 'lucide-react';
import {
  rigOutput,
  annualSavingsGBP,
  systemCostGBP,
  lossBudget,
  SizingMode,
} from '../utils/heatloom';

interface RigOption {
  name: string;
  area: number;
  thermal: number;
  electric: number;
  heat: number;
  sandMass: number;
  winterElectric: number;
  summerElectric: number;
  pessimisticElectric: number;
  cost?: number;
  roi?: number;
}

interface ConfigResult {
  recommended: RigOption;
  rigs: RigOption[];
  seasonalAdj: string;
  seasonalSerious: boolean;
  savingsPerYear: number;
  savingsNaive: number;
  lossRows: { label: string; kwhIn: number; kwhLost: number; kwhOut: number; note: string }[];
  incidentKWh: number;
  collectedKWh: number;
}

export default function Configurator() {
  const [dailyUse, setDailyUse] = useState(8);
  const [dni, setDni] = useState(5);
  const [wantHeat, setWantHeat] = useState(true);
  const [sizingMode, setSizingMode] = useState<SizingMode>('annual');
  const [result, setResult] = useState<ConfigResult | null>(null);

  const calculate = () => {
    const areas = [10, 20, 30];
    const rigs: RigOption[] = areas.map((area) => {
      const r = rigOutput(area, dni);
      return {
        name:
          area === 10 ? 'Small Yard' : area === 20 ? 'Medium Pilot' : 'Container Scale',
        area,
        thermal: +r.thermalKWhPerDay.toFixed(1),
        electric: +r.electricKWhPerDay.toFixed(1),
        heat: +r.heatKWhPerDay.toFixed(1),
        sandMass: +r.sandMassKg.toFixed(0),
        winterElectric: +r.winterElectricKWhPerDay.toFixed(1),
        summerElectric: +r.summerElectricKWhPerDay.toFixed(1),
        pessimisticElectric: +r.pessimisticElectricKWhPerDay.toFixed(1),
      };
    });

    const key = (r: RigOption) =>
      sizingMode === 'winter' ? r.winterElectric : r.electric;
    const recommended = rigs.find((r) => key(r) >= dailyUse) || rigs[rigs.length - 1];

    recommended.cost = systemCostGBP(recommended.area);
    const savingsPerYear = annualSavingsGBP(dailyUse, rigOutput(recommended.area, dni));
    recommended.roi = +(recommended.cost / Math.max(savingsPerYear, 1)).toFixed(1);

    const seasonalSerious = recommended.winterElectric < dailyUse * 0.5;
    const seasonalAdj = seasonalSerious
      ? `Honest seasonal note: at this DNI the rig's December output is about ${recommended.winterElectric} kWh/day — ${(100 * recommended.winterElectric / Math.max(dailyUse, 0.1)).toFixed(0)}% of your ${dailyUse} kWh/day target. The annual-average numbers above will not hold in winter; backup heating is part of an honest design.`
      : recommended.winterElectric < dailyUse
        ? `Winter output (${recommended.winterElectric} kWh/day) sits below your ${dailyUse} kWh/day target — expect partial winter coverage, with high-summer surplus (${recommended.summerElectric} kWh/day).`
        : `Winter output (${recommended.winterElectric} kWh/day) still covers your ${dailyUse} kWh/day — year-round coverage is plausible at this sizing.`;

    const budget = lossBudget(dni, recommended.area);

    setResult({
      recommended,
      rigs,
      seasonalAdj,
      seasonalSerious,
      savingsPerYear,
      savingsNaive: dailyUse * 365 * 0.28,
      lossRows: budget.rows.map((r) => ({
        label: r.label, kwhIn: r.kwhIn, kwhLost: r.kwhLost, kwhOut: r.kwhOut, note: r.note,
      })),
      incidentKWh: budget.incidentKWhPerDay,
      collectedKWh: budget.collectedKWhPerDay,
    });
  };

  return (
    <section id="configurator" className="py-24 bg-gradient-to-br from-gray-50 to-orange-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-8">Heat Loom Configurator</h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Get personalized system recommendations based on your energy needs and local solar conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Input Section */}
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-orange-100/50">
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">System Requirements</h3>
                <p className="text-gray-500 font-medium">Tell us about your energy needs</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200/50">
                <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span>Daily Electricity Use (kWh/day)</span>
                </label>
                <input
                  type="number"
                  value={dailyUse}
                  onChange={(e) => setDailyUse(parseFloat(e.target.value))}
                  className="w-full p-4 rounded-xl border border-orange-200 focus:border-orange-500 focus:outline-none text-lg font-medium"
                />
                <p className="text-gray-600 text-sm mt-2">Average UK household: 8-12 kWh/day</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200/50">
                <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>DNI (Direct Normal Irradiance)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={dni}
                  onChange={(e) => setDni(parseFloat(e.target.value))}
                  className="w-full p-4 rounded-xl border border-blue-200 focus:border-blue-500 focus:outline-none text-lg font-medium"
                />
                <p className="text-gray-600 text-sm mt-2">UK: 3, Spain: 6, Desert: 8+ kWh/m²/day</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Snowflake className="w-5 h-5 text-slate-600" />
                  <label className="text-lg font-bold text-gray-900">Size the rig for…</label>
                </div>
                <div className="flex items-center space-x-3">
                  {([
                    { v: 'annual' as SizingMode, label: 'Annual average', hint: 'smaller rig, admits a winter shortfall' },
                    { v: 'winter' as SizingMode, label: 'Dark December', hint: 'bigger rig, covers the worst month' },
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
                  Sizing on the annual average is how solar projects end up apologizing in December.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200/50">
                <div className="flex items-center space-x-3 mb-4">
                  <Thermometer className="w-5 h-5 text-purple-600" />
                  <label className="text-lg font-bold text-gray-900">Additional Heat Requirements</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={wantHeat}
                    onChange={(e) => setWantHeat(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded"
                  />
                  <span className="text-gray-700 font-medium">I also want hot water/space heating</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">Heat Loom provides both electricity and thermal energy</p>
              </div>

              <button
                onClick={calculate}
                className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <Calculator className="w-6 h-6" />
                <span>Get My Recommendation</span>
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
            {result ? (
              <div>
                <div className="flex items-center space-x-4 mb-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">Recommended: {result.recommended.name}</h3>
                    <p className="text-gray-500 font-medium">Optimized for your requirements</p>
                  </div>
                </div>

                {/* Recommendation Details */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200/50 mb-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-orange-600 mb-2">{result.recommended.area}</div>
                      <p className="text-gray-600 font-medium">m² Mirror Area</p>
                    </div>
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {result.recommended.electric}
                        <span className="text-sm font-medium text-gray-400"> ({result.recommended.pessimisticElectric}–{result.recommended.summerElectric})</span>
                      </div>
                      <p className="text-gray-600 font-medium">kWh/day Electric</p>
                      <p className="text-gray-400 text-xs mt-1">pessimistic–summer band · winter avg {result.recommended.winterElectric}</p>
                    </div>
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-red-600 mb-2">{result.recommended.heat}</div>
                      <p className="text-gray-600 font-medium">kWh/day Heat</p>
                    </div>
                    <div className="text-center bg-white p-4 rounded-xl shadow-sm">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{result.recommended.sandMass}</div>
                      <p className="text-gray-600 font-medium">kg Sand Mass</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-gray-900">Economics</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated cost:</span>
                          <span className="font-bold text-gray-900">£{result.recommended.cost?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Annual savings:</span>
                          <span className="font-bold text-green-600">£{result.savingsPerYear.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payback period:</span>
                          <span className="font-bold text-orange-600">{result.recommended.roi} years</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <Home className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-gray-900">Home Equivalents</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Coffee className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-600">~{(result.recommended.electric * 8.3).toFixed(0)} kettle boils per day</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600">~{(result.recommended.heat / 1.7).toFixed(0)} hot showers per day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seasonal Advisory */}
                <div className={`p-6 rounded-2xl mb-10 ${result.seasonalSerious ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.seasonalSerious ? 'bg-yellow-500' : 'bg-green-500'}`}>
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

                {/* Loss budget: where the sunlight actually goes */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200/50 mb-10">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-gray-700" />
                    <span>Loss Budget — where each day of sunlight goes</span>
                  </h4>
                  <p className="text-gray-600 text-sm mb-6">
                    {result.incidentKWh.toFixed(0)} kWh/day of sunshine lands on {result.recommended.area} m² of mirrors;
                    {result.collectedKWh.toFixed(1)} kWh/day survives the physics. No step is hand-waved.
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
                            <td className="p-3 text-right text-gray-600 font-mono">{row.kwhIn.toFixed(1)}</td>
                            <td className="p-3 text-right text-red-600 font-mono">−{row.kwhLost.toFixed(1)}</td>
                            <td className="p-3 text-right text-emerald-700 font-mono">{row.kwhOut.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200/50">
                  <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-gray-700" />
                    <span>Size Comparison</span>
                  </h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                          <th className="p-4 text-left font-bold rounded-tl-xl">System Size</th>
                          <th className="p-4 text-center font-bold">Area (m²)</th>
                          <th className="p-4 text-center font-bold">Thermal (kWh/day)</th>
                          <th className="p-4 text-center font-bold">Electric (kWh/day)</th>
                          <th className="p-4 text-center font-bold rounded-tr-xl">Useful Heat (kWh/day)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rigs.map((rig, index) => (
                          <tr 
                            key={index}
                            className={`${rig.name === result.recommended.name 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500' 
                              : 'bg-white hover:bg-gray-50'
                            } transition-colors`}
                          >
                            <td className="p-4 font-bold text-gray-900">
                              <div className="flex items-center space-x-2">
                                {rig.name === result.recommended.name && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                <span>{rig.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center text-gray-700 font-medium">{rig.area}</td>
                            <td className="p-4 text-center text-red-600 font-bold">{rig.thermal}</td>
                            <td className="p-4 text-center text-blue-600 font-bold">{rig.electric}</td>
                            <td className="p-4 text-center text-orange-600 font-bold">{rig.heat}</td>
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
                  Enter your requirements on the left and click "Get My Recommendation" to see the optimal Heat Loom system for your needs.
                </p>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-12 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 rounded-2xl border border-orange-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calculator className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-3 text-orange-400">Sizing Notes (the honest ones)</h4>
                <p className="text-gray-300 leading-relaxed">
                  Numbers come from the tested engineering module (open source, in the repo):
                  a loss chain multiplying to ≈60% collector efficiency (see the Loss Budget table
                  above), 18% ORC electrical conversion, 11.25 kg of sand per thermal kWh.
                  Savings are computed from electricity you can actually generate — winter days
                  capped at winter output — so they sit below the naive
                  £{result ? result.savingsNaive.toLocaleString() : '—'} a flat calculation
                  would promise. DNI is your annual-average input; pessimistic case assumes
                  −10% sun and the low end of the efficiency band. Individual results vary
                  with local conditions, usage patterns, and integration complexity.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}