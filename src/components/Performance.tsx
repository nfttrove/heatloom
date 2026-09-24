import { TrendingUp, MapPin, Calendar, Target, BarChart3, Battery, Thermometer, Zap } from 'lucide-react';
import {
  rigOutput,
  storeHeatLoss,
  RIG_STORE_U_W_PER_M2K,
  COLLECTOR_EFFICIENCY,
  COLLECTOR_EFFICIENCY_RANGE,
  ORC_EFFICIENCY,
  SAND_CP_KJ_PER_KG_K,
  SAND_KG_PER_KWH,
  RIG_STORE_DELTA_T_K,
  HYBRID_SAND_KG_PER_KWH,
  HYBRID_STORE_DELTA_T_K,
} from '../utils/heatloom';

// The modelled Spain case: 10 m² of troughs at a sunny site.
const SPAIN = { areaM2: 10, dni: 6 };
const SPAIN_RIG = rigOutput(SPAIN.areaM2, SPAIN.dni);
// A store holding one day of that collection, at the rig's temperatures.
const SPAIN_STORE = storeHeatLoss(SPAIN_RIG.thermalKWhPerDay, RIG_STORE_DELTA_T_K, RIG_STORE_U_W_PER_M2K);
const OVERNIGHT_H = 12;
const one = (x: number) => x.toFixed(1);

export default function Performance() {
  return (
    <section id="performance" className="py-24 bg-gradient-to-br from-orange-50/50 via-white to-red-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Modelled Performance — the research rig</h2>
          <div className="mb-8 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200/60">
            These figures describe the full research-rig design, turbine included. The recommended build path stops at heat and buys PV for the electrons — see “Why we deleted our own turbine”.
          </div>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Nothing has been built or measured yet. These figures come from the tested model at a sunny site; the tests
            below are how a builder would check them.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-20">
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-orange-100/50">
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Spain — modelled, not measured</h3>
                <p className="text-gray-500 font-medium">A sunny site for the concentrating rig</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-2xl text-white shadow-lg">
                <h4 className="text-xl font-bold mb-6">System Specifications</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-orange-100 text-sm mb-1">Collector Area</p>
                    <p className="text-2xl font-bold">{SPAIN.areaM2} m²</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-orange-100 text-sm mb-1">Daily DNI</p>
                    <p className="text-2xl font-bold">{SPAIN.dni} kWh/m²</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-orange-100 text-sm mb-1">Collector Efficiency</p>
                    <p className="text-2xl font-bold">{Math.round(COLLECTOR_EFFICIENCY * 100)}%</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-orange-100 text-sm mb-1">ORC Efficiency</p>
                    <p className="text-2xl font-bold">{Math.round(ORC_EFFICIENCY * 100)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-2xl text-white shadow-lg">
                <h4 className="text-xl font-bold mb-6">Daily Energy (modelled)</h4>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                    <p className="text-4xl font-black mb-2">{one(SPAIN_RIG.thermalKWhPerDay)}</p>
                    <p className="text-green-50 font-medium">kWh<sub>th</sub>/day collected</p>
                  </div>
                  <div className="text-center bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                    <p className="text-4xl font-black mb-2">{one(SPAIN_RIG.electricKWhPerDay)}</p>
                    <p className="text-green-50 font-medium">kWh<sub>e</sub>/day via the ORC</p>
                  </div>
                </div>
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm text-center">
                  <p className="text-green-50 font-medium leading-relaxed">
                    Either the electricity <em>or</em> the heat: the ORC's other {one(SPAIN_RIG.rejectHeatKWhPerDay)} kWh/day leaves at
                    about 30–40 °C, too cool to heat a home. Without the ORC, all {one(SPAIN_RIG.thermalKWhPerDay)} kWh/day is useful heat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-blue-100/50">
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">Sizing Calculator</h3>
                <p className="text-gray-500 font-medium">Engineering formulas</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200/50">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span>Collector Area Formula</span>
                </h4>
                <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
                  <div className="font-mono text-lg mb-4 text-gray-900">
                    A<sub>collector</sub> = Q<sub>daily</sub> / (DNI × η<sub>collector</sub>)
                  </div>
                  <div className="text-gray-600 space-y-2 text-sm">
                    <p><strong>Q<sub>daily</sub></strong> = Daily thermal requirement (kWh<sub>th</sub>)</p>
                    <p><strong>DNI</strong> = Direct Normal Irradiance (kWh/m²/day)</p>
                    <p><strong>η<sub>collector</sub></strong> = Collector efficiency ({COLLECTOR_EFFICIENCY_RANGE.low}–{COLLECTOR_EFFICIENCY_RANGE.high} for troughs; tubes use global sunlight and their own chain)</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200/50">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <Battery className="w-5 h-5 text-purple-600" />
                  <span>Storage Mass Formula</span>
                </h4>
                <div className="bg-white p-6 rounded-xl border-l-4 border-purple-500 shadow-sm">
                  <div className="font-mono text-lg mb-4 text-gray-900">
                    M<sub>storage</sub> = 3600 / (c<sub>p</sub> × ΔT) kg per kWh<sub>th</sub>
                  </div>
                  <div className="text-gray-600 space-y-2 text-sm">
                    <p><strong>c<sub>p</sub></strong> = {SAND_CP_KJ_PER_KG_K} kJ/kg·K for dry sand</p>
                    <p><strong>ΔT</strong> = {RIG_STORE_DELTA_T_K} K for the rig → {SAND_KG_PER_KWH} kg/kWh; {HYBRID_STORE_DELTA_T_K} K for the Hybrid → {HYBRID_SAND_KG_PER_KWH.toFixed(0)} kg/kWh</p>
                    <p><strong>Losses</strong> = the store's 90% round trip is in the loss chain, not this formula</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-12 rounded-4xl shadow-2xl border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Testing Protocol</h3>
            <p className="text-lg md:text-xl text-gray-600 font-light">How a builder would check the model — none of these has been run yet</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl border border-red-200/50 group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6 text-white shadow-md group-hover:scale-110 transition-transform">
                <Thermometer className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-red-800 mb-4 text-lg">Charge Test</h4>
              <p className="text-gray-700 leading-relaxed">Monitor core temperature until {'>'}250°C is reached</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200/50 group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6 text-white shadow-md group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-blue-800 mb-4 text-lg">Hold Test</h4>
              <p className="text-gray-700 leading-relaxed">
                Log the overnight cooling and fit the store's time constant. The model predicts about{' '}
                {one(SPAIN_STORE.timeConstantDays)} days for a one-day store behind 150 mm of mineral wool (which insulates about half as well at 250–420 °C) — about{' '}
                {Math.round(100 * (1 - Math.exp(-OVERNIGHT_H / 24 / SPAIN_STORE.timeConstantDays)))}% of its heat lost over {OVERNIGHT_H} hours.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200/50 group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-6 text-white shadow-md group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-green-800 mb-4 text-lg">Discharge Test</h4>
              <p className="text-gray-700 leading-relaxed">Fixed flow through the heat take-off exchanger, log inlet/outlet temperatures</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200/50 group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-6 text-white shadow-md group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-purple-800 mb-4 text-lg">Electric Test</h4>
              <p className="text-gray-700 leading-relaxed">Measure kWh<sub>e</sub> vs kWh<sub>th</sub> input ratio</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}