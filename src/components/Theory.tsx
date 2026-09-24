import { Sun, Waves, Battery, ArrowUp, ArrowDown, Thermometer } from 'lucide-react';
import {
  COLLECTOR_EFFICIENCY_RANGE,
  HYBRID_EFFICIENCY_RANGE,
  SAND_CP_KJ_PER_KG_K,
  SAND_KG_PER_KWH,
  RIG_STORE_DELTA_T_K,
  sandKgPerKWh,
  HYBRID_SAND_KG_PER_KWH,
  HYBRID_STORE_DELTA_T_K,
  HYBRID_STORE_TOP_C,
  DEFAULT_HYBRID,
  storeHeatLoss,
  usefulHeatHalfLifeDays,
} from '../utils/heatloom';

const DEFAULT_STORE = storeHeatLoss(DEFAULT_HYBRID.storeKWh);
const USEFUL_HALF_LIFE_DAYS = usefulHeatHalfLifeDays(DEFAULT_STORE.timeConstantDays);

/** A plain schematic: sunlight → collector → loop → sand store → home, with PV beside it. */
function SystemDiagram() {
  const box = 'fill-white stroke-orange-300';
  return (
    <svg viewBox="0 0 760 260" role="img" aria-labelledby="hl-diagram-title" className="w-full max-w-4xl mx-auto h-auto">
      <title id="hl-diagram-title">
        Heat Loom schematic: the sun heats a collector; a fluid loop carries the heat into a sand store; a coil draws heat
        from the store for the home. Solar panels supply the home's electricity separately.
      </title>
      <defs>
        <marker id="hl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-orange-500" />
        </marker>
      </defs>
      <circle cx="60" cy="60" r="30" className="fill-yellow-300" />
      <text x="60" y="112" textAnchor="middle" className="fill-gray-700 text-[13px] font-semibold">Sun</text>
      <line x1="95" y1="60" x2="165" y2="60" className="stroke-orange-500" strokeWidth="3" markerEnd="url(#hl-arrow)" />
      <rect x="170" y="25" width="150" height="70" rx="12" className={box} strokeWidth="2" />
      <text x="245" y="55" textAnchor="middle" className="fill-gray-900 text-[14px] font-bold">Collector</text>
      <text x="245" y="75" textAnchor="middle" className="fill-gray-600 text-[11px]">troughs (rig) · tubes (Hybrid)</text>
      <line x1="320" y1="60" x2="400" y2="60" className="stroke-orange-500" strokeWidth="3" markerEnd="url(#hl-arrow)" />
      <text x="360" y="48" textAnchor="middle" className="fill-gray-600 text-[11px]">fluid loop</text>
      <rect x="405" y="20" width="150" height="120" rx="14" className="fill-amber-100 stroke-amber-400" strokeWidth="2" />
      <text x="480" y="70" textAnchor="middle" className="fill-gray-900 text-[14px] font-bold">Sand store</text>
      <text x="480" y="90" textAnchor="middle" className="fill-gray-600 text-[11px]">holds days, not seasons</text>
      <line x1="555" y1="80" x2="635" y2="80" className="stroke-red-500" strokeWidth="3" markerEnd="url(#hl-arrow)" />
      <text x="595" y="68" textAnchor="middle" className="fill-gray-600 text-[11px]">heat coil</text>
      <rect x="640" y="45" width="100" height="70" rx="12" className={box} strokeWidth="2" />
      <text x="690" y="85" textAnchor="middle" className="fill-gray-900 text-[14px] font-bold">Home</text>
      <rect x="170" y="175" width="150" height="60" rx="12" className="fill-blue-50 stroke-blue-300" strokeWidth="2" />
      <text x="245" y="202" textAnchor="middle" className="fill-gray-900 text-[14px] font-bold">Solar panels</text>
      <text x="245" y="220" textAnchor="middle" className="fill-gray-600 text-[11px]">bought PV (Hybrid)</text>
      <path d="M320 205 H690 V120" fill="none" className="stroke-blue-500" strokeWidth="3" markerEnd="url(#hl-arrow)" />
      <text x="500" y="197" textAnchor="middle" className="fill-gray-600 text-[11px]">electricity</text>
    </svg>
  );
}

export default function Theory() {
  return (
    <section id="theory" className="py-24 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">How It Works</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Two ways to collect the sun, one way to store it: the research rig concentrates direct sunlight with mirror
            troughs; the Hybrid uses commodity evacuated tubes. Both charge a sand store, and bought panels make the
            electricity.
          </p>
        </div>

        <div className="mb-16">
          <div className="bg-gradient-to-br from-white to-orange-50/50 p-4 md:p-8 rounded-4xl shadow-2xl border border-orange-100/50">
            <SystemDiagram />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-orange-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Solar Collection</h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              The research rig's parabolic troughs focus direct sunlight onto evacuated receiver tubes. The Hybrid skips the
              mirrors: evacuated tubes on the roof, charging the store to about {HYBRID_STORE_TOP_C} °C.
            </p>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200/50">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Research rig design targets</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-gray-700 font-medium">Concentration Ratio:</span>
                  <span className="font-bold text-orange-700">20-40x</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-gray-700 font-medium">Operating Temperature:</span>
                  <span className="font-bold text-red-700">250-400°C</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-gray-700 font-medium">Mirror Reflectivity:</span>
                  <span className="font-bold text-orange-700">{'≥'}94%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-blue-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
              <Waves className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Thermosiphon Loop</h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              In the research rig, with the collector below the store, density-driven convection moves the heat-transfer
              fluid with no pump. The Hybrid's roof-mounted tubes sit above the store, so they need a small pump station.
            </p>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200/50">
              <div className="flex items-center justify-center space-x-8">
                <div className="flex flex-col items-center space-y-2 text-red-600">
                  <ArrowUp className="w-6 h-6" />
                  <span className="text-sm font-medium">Hot fluid rises</span>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="flex flex-col items-center space-y-2 text-blue-600">
                  <ArrowDown className="w-6 h-6" />
                  <span className="text-sm font-medium">Cool fluid sinks</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-purple-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
              <Battery className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Thermal Storage</h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              A layered granular core: dense basalt around the charge coil, quartz sand as the bulk, perlite to insulate.
              It holds days of heat, not seasons — the default Hybrid store, full, loses half its useful heat in about{' '}
              {USEFUL_HALF_LIFE_DAYS.toFixed(0)} days.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200/50">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Basalt core (20%)</span>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200/50">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Quartz sand (70%)</span>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200/50">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-gray-700 font-medium">Perlite insulation (10%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 md:p-12 rounded-4xl shadow-2xl border border-gray-700/50">
          <div className="text-center mb-12">
            <Thermometer className="w-16 h-16 mx-auto mb-6 text-orange-400" />
            <h3 className="text-3xl font-bold mb-6">Energy Storage Engineering</h3>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light">
              The formulas the tested module uses — with their assumptions in view
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 md:p-8 rounded-2xl border border-orange-500/20">
              <h4 className="text-2xl font-bold mb-6 text-orange-400">Collector Sizing</h4>
              <div className="bg-gray-900/50 p-6 rounded-xl font-mono border border-gray-700/50">
                <div className="text-base md:text-lg mb-4 text-white break-words">
                  A<sub>collector</sub> = Q<sub>daily</sub> / (Sun × η<sub>collector</sub>)
                </div>
                <div className="text-gray-300 space-y-2 text-sm">
                  <p>Q<sub>daily</sub> = daily heat wanted (kWh<sub>th</sub>)</p>
                  <p>Sun = direct sunlight (DNI) for troughs; global sunlight on the tilt for tubes (kWh/m²/day)</p>
                  <p>η<sub>collector</sub> = {COLLECTOR_EFFICIENCY_RANGE.low}–{COLLECTOR_EFFICIENCY_RANGE.high} for troughs; {HYBRID_EFFICIENCY_RANGE.low}–{HYBRID_EFFICIENCY_RANGE.high} for tubes charging the store</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 md:p-8 rounded-2xl border border-blue-500/20">
              <h4 className="text-2xl font-bold mb-6 text-blue-400">Storage Mass</h4>
              <div className="bg-gray-900/50 p-6 rounded-xl font-mono border border-gray-700/50">
                <div className="text-base md:text-lg mb-4 text-white break-words">
                  M<sub>storage</sub> = 3600 / (c<sub>p</sub> × ΔT) kg per kWh<sub>th</sub>
                </div>
                <div className="text-gray-300 space-y-2 text-sm">
                  <p>c<sub>p</sub> = {SAND_CP_KJ_PER_KG_K} kJ/kg·K for dry sand</p>
                  <p>Rig: ΔT = {RIG_STORE_DELTA_T_K} K → {SAND_KG_PER_KWH} kg/kWh (generous: an oil loop kept to about 300 °C gives ~{Math.round(sandKgPerKWh(280))} kg/kWh — see Safety)</p>
                  <p>Hybrid: ΔT = {HYBRID_STORE_DELTA_T_K} K → {HYBRID_SAND_KG_PER_KWH.toFixed(0)} kg/kWh</p>
                  <p>The store's 90% round trip sits in the loss chain, not here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
