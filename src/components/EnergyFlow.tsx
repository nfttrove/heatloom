import { useEffect, useState } from 'react';
import { Sun, Battery, Lightbulb, Activity, Play, Pause, RotateCcw, ArrowRight, Thermometer, Scale } from 'lucide-react';
import {
  DEFAULT_HYBRID,
  HEAT_FLOW_START,
  HYBRID_COLLECT_EFFICIENCY,
  ORC_EFFICIENCY,
  heatFlowStep,
  hybridStoreTemperatureC,
  storeHeatLoss,
  type HeatFlowParams,
  type HeatFlowState,
} from '../utils/heatloom';

// Three simulated minutes per animation frame: about three hours a second.
const HOURS_PER_FRAME = 0.05;
const PEAK_SUN_KW_M2 = 1.0;
const CAPACITY_KWH = DEFAULT_HYBRID.storeKWh;
const HALF_LIFE_DAYS = storeHeatLoss(CAPACITY_KWH).halfLifeDays;

const one = (x: number) => x.toFixed(1);
const two = (x: number) => x.toFixed(2);

function FlowArrow({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center py-1 lg:py-0" aria-hidden="true">
      <ArrowRight className={`w-7 h-7 rotate-90 lg:rotate-0 ${active ? 'text-orange-400 animate-pulse' : 'text-gray-600'}`} />
    </div>
  );
}

export default function EnergyFlow() {
  const [sunPct, setSunPct] = useState(60);
  const [area, setArea] = useState(DEFAULT_HYBRID.collectorM2);
  const [demandKW, setDemandKW] = useState(0.5);
  const [running, setRunning] = useState(true);
  const [sim, setSim] = useState<HeatFlowState>(HEAT_FLOW_START);

  useEffect(() => {
    if (!running) return;
    const p: HeatFlowParams = {
      sunKWPerM2: (sunPct / 100) * PEAK_SUN_KW_M2,
      areaM2: area,
      demandKW,
      capacityKWh: CAPACITY_KWH,
    };
    let frame = requestAnimationFrame(function tick() {
      setSim((prev) => heatFlowStep(prev, p, HOURS_PER_FRAME));
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [running, sunPct, area, demandKW]);

  const sunlightKW = (sunPct / 100) * PEAK_SUN_KW_M2 * area;
  const collectedKW = sunlightKW * HYBRID_COLLECT_EFFICIENCY;
  const storeFull = sim.storedKWh >= CAPACITY_KWH - 1e-9;
  const storeEmpty = sim.storedKWh <= 1e-9;
  // Instantaneous delivery: what the next few simulated seconds would deliver.
  const probeH = 0.01;
  const probe = heatFlowStep(
    sim,
    { sunKWPerM2: (sunPct / 100) * PEAK_SUN_KW_M2, areaM2: area, demandKW, capacityKWh: CAPACITY_KWH },
    probeH
  );
  const deliveredKW = (probe.deliveredKWh - sim.deliveredKWh) / probeH;
  const storeC = hybridStoreTemperatureC(sim.storedKWh, CAPACITY_KWH);
  const books = sim.collectedKWh - (sim.deliveredKWh + sim.lostKWh + sim.dumpedKWh + sim.storedKWh);
  const ledger: Array<[string, number, string]> = [
    ['Collected', sim.collectedKWh, 'text-orange-300'],
    ['Delivered', sim.deliveredKWh, 'text-blue-300'],
    ['Lost from store', sim.lostKWh, 'text-red-300'],
    ['Parked (store full)', sim.dumpedKWh, 'text-yellow-300'],
    ['In the store', sim.storedKWh, 'text-purple-300'],
    ['Unmet demand', sim.unmetKWh, 'text-gray-300'],
  ];

  return (
    <section id="energy-flow" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Energy Flow
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light">
            The Hybrid's heat side as a toy balance: sunlight on the tubes, heat into the {CAPACITY_KWH} kWh sand store,
            heat out to the house. Constant sun and constant demand, simulated at about three hours a second — and the
            books balance at every step.
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-8 rounded-3xl shadow-2xl border border-gray-700 mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Heat balance</h3>
                <p className="text-gray-400 text-sm">Simulated {one(sim.hours)} h</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl transition-all duration-300 font-semibold shadow-lg"
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{running ? 'Pause' : 'Play'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSim(HEAT_FLOW_START)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-2 lg:gap-3 items-stretch mb-8">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-5 rounded-2xl border border-yellow-500/30 text-center">
              <Sun className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-bold text-white">Sunlight on tubes</h4>
              <p className="text-yellow-300 text-lg mt-1">{two(sunlightKW)} kW</p>
              <p className="text-gray-400 text-xs mt-1">
                {sunPct}% of 1 kW/m² × {area} m²
              </p>
            </div>
            <FlowArrow active={collectedKW > 0} />
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-5 rounded-2xl border border-orange-500/30 text-center">
              <Thermometer className="w-10 h-10 text-orange-400 mx-auto mb-2" />
              <h4 className="font-bold text-white">Heat collected</h4>
              <p className="text-orange-300 text-lg mt-1">{two(collectedKW)} kW</p>
              <p className="text-gray-400 text-xs mt-1">
                {Math.round(HYBRID_COLLECT_EFFICIENCY * 100)}% after tube optics, tube heat loss, soiling and pipework
              </p>
            </div>
            <FlowArrow active={collectedKW > 0 && !storeFull} />
            <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-5 rounded-2xl border border-purple-500/30 text-center">
              <Battery className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <h4 className="font-bold text-white">Sand store</h4>
              <p className="text-purple-300 text-lg mt-1">
                {one(sim.storedKWh)} / {CAPACITY_KWH} kWh
              </p>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-violet-500"
                  style={{ width: `${Math.min(100, (100 * sim.storedKWh) / CAPACITY_KWH)}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-1">
                ≈ {Math.round(storeC)} °C{storeFull ? ' · full: loop parked' : storeEmpty ? ' · below useful heat' : ''}
              </p>
            </div>
            <FlowArrow active={deliveredKW > 0} />
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-5 rounded-2xl border border-blue-500/30 text-center">
              <Lightbulb className="w-10 h-10 text-blue-400 mx-auto mb-2" />
              <h4 className="font-bold text-white">Heat delivered</h4>
              <p className="text-blue-300 text-lg mt-1">
                {two(deliveredKW)} of {two(demandKW)} kW
              </p>
              <p className="text-gray-400 text-xs mt-1">{deliveredKW < demandKW - 1e-6 ? 'the boiler makes up the rest' : 'demand met'}</p>
            </div>
          </div>

          <div className="bg-black/30 rounded-2xl p-4 sm:p-6 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold">The books, since reset</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
              {ledger.map(([label, value, color]) => (
                <div key={label} className="bg-white/5 rounded-xl p-3">
                  <div className="text-gray-400 text-xs">{label}</div>
                  <div className={`font-bold ${color}`}>{one(value)} kWh</div>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs mt-4">
              Collected − (delivered + lost + parked + stored) = {two(Math.abs(books) < 0.005 ? 0 : books)} kWh. Nothing is
              created: heat that is neither used nor stored is lost, or never collected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl border border-yellow-500/20">
              <label htmlFor="flow-sun" className="flex items-center space-x-3 mb-4 text-lg font-bold">
                <Sun className="w-6 h-6 text-yellow-400" />
                <span>Sunlight</span>
              </label>
              <input
                id="flow-sun"
                type="range"
                min="0"
                max="100"
                value={sunPct}
                onChange={(e) => setSunPct(Number(e.target.value))}
                className="w-full mb-2 accent-orange-500"
              />
              <div className="text-2xl font-bold text-yellow-400">{sunPct}%</div>
              <p className="text-gray-400 text-xs mt-1">of a clear-sky 1 kW/m²</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 rounded-2xl border border-orange-500/20">
              <label htmlFor="flow-area" className="flex items-center space-x-3 mb-4 text-lg font-bold">
                <Thermometer className="w-6 h-6 text-orange-400" />
                <span>Tube area</span>
              </label>
              <input
                id="flow-area"
                type="range"
                min="1"
                max="20"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full mb-2 accent-orange-500"
              />
              <div className="text-2xl font-bold text-orange-400">{area} m²</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-6 rounded-2xl border border-blue-500/20">
              <label htmlFor="flow-demand" className="flex items-center space-x-3 mb-4 text-lg font-bold">
                <Lightbulb className="w-6 h-6 text-blue-400" />
                <span>Heat demand</span>
              </label>
              <input
                id="flow-demand"
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={demandKW}
                onChange={(e) => setDemandKW(Number(e.target.value))}
                className="w-full mb-2 accent-blue-500"
              />
              <div className="text-2xl font-bold text-blue-400">{one(demandKW)} kW</div>
              <p className="text-gray-400 text-xs mt-1">
                The default household's {DEFAULT_HYBRID.heatKWhPerDay} kWh/day averages {two(DEFAULT_HYBRID.heatKWhPerDay / 24)} kW
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6 md:p-8 rounded-2xl border border-orange-500/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-3 text-orange-400">What this toy leaves out</h4>
              <p className="text-gray-300 leading-relaxed">
                Real skies change by the minute and by the month; the Hybrid's headline numbers come from its monthly model,
                not from this panel. The store here loses heat with the same time constant as that model — half in about{' '}
                {Math.round(HALF_LIFE_DAYS)} days — which is why it smooths days, not seasons. The retired research rig
                added an ORC turbine after the store, turning about {Math.round(ORC_EFFICIENCY * 100)}% of its heat into
                electricity:{' '}
                <a href="#why-no-turbine" className="text-orange-300 underline hover:text-orange-200">
                  why we deleted it
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
