import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Gauge, Thermometer, Zap, Sun, Activity } from 'lucide-react';
import {
  COLLECTOR_EFFICIENCY,
  DEMO_DAY_END_MIN,
  DEMO_DAY_START_MIN,
  ORC_EFFICIENCY,
  RIG_COLLECT_EFFICIENCY,
  RIG_STORE_TOP_C,
  rigDemoMinute,
  rigStoreAfterC,
  type RigDemoParams,
  type RigDemoState,
} from '../utils/heatloom';

interface SimState extends RigDemoState {
  speed: number;
  running: boolean;
  series: Array<{ T: number; Pth: number; Pe: number }>;
}

// Annual-average direct sunlight, kWh/m² per day — a clear day is higher, a UK winter day far lower.
const PRESETS = [
  { key: 'UK', label: 'Southern England (DNI ≈ 2.5)', dni: 2.5 },
  { key: 'ES', label: 'Southern Spain (DNI ≈ 6)', dni: 6 },
  { key: 'AZ', label: 'Desert (DNI ≈ 8)', dni: 8 },
] as const;
const START_C = 50;
const ORC_MAX = 0.25;
const OVERNIGHT_H = (24 * 60 - DEMO_DAY_END_MIN + DEMO_DAY_START_MIN) / 60;

const fresh = (): SimState => ({
  minute: DEMO_DAY_START_MIN,
  storeC: START_C,
  collectedKWh: 0,
  electricKWh: 0,
  rejectKWh: 0,
  lostKWh: 0,
  defocusedKWh: 0,
  speed: 1,
  running: false,
  series: [],
});

/**
 * A number box that lets you type freely: the draft text is kept while
 * editing, the value updates only when the text parses inside [min, max],
 * and leaving the box shows the value actually in use.
 */
function NumberField(props: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValue: (v: number) => void;
  className: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-300 mb-2">
        {props.label}
      </label>
      <input
        id={props.id}
        type="number"
        min={props.min}
        max={props.max}
        step={props.step}
        value={draft ?? String(props.value)}
        onChange={(e) => {
          setDraft(e.target.value);
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v) && v >= props.min && v <= props.max) props.onValue(v);
        }}
        onBlur={() => setDraft(null)}
        className={props.className}
      />
    </div>
  );
}

export default function Demo() {
  const [params, setParams] = useState<RigDemoParams>({
    dniKWhPerM2Day: 6,
    areaM2: 10,
    sandKg: 1500,
    ambientC: 20,
    orcOn: true,
    orcEfficiency: ORC_EFFICIENCY,
    dispatchAboveC: 150,
    dispatchFraction: 0.6,
  });
  const [state, setState] = useState<SimState>(fresh);

  const chartRef = useRef<HTMLCanvasElement>(null);

  const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const fmtKWh = (x: number) => x.toFixed(1) + ' kWh';
  const hms = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60).toString().padStart(2, '0');
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  const colorForTemp = (T: number) => {
    const t = clamp((T - 20) / 330, 0, 1);
    const r = Math.floor(lerp(59, 239, t));
    const g = Math.floor(lerp(130, 68, t));
    const b = Math.floor(lerp(246, 68, t));
    return `rgb(${r},${g},${b})`;
  };

  // Animation loop: `speed` simulated minutes per frame.
  useEffect(() => {
    if (!state.running) return;
    let frame = requestAnimationFrame(function tick() {
      setState((prev) => {
        if (prev.minute >= DEMO_DAY_END_MIN) return { ...prev, running: false };
        let next: SimState = prev;
        const added: SimState['series'] = [];
        for (let s = 0; s < prev.speed && next.minute < DEMO_DAY_END_MIN; s++) {
          const stepped = rigDemoMinute(next, params);
          added.push({
            T: stepped.storeC,
            Pth: (stepped.collectedKWh - next.collectedKWh) * 60,
            Pe: (stepped.electricKWh - next.electricKWh) * 60,
          });
          next = { ...next, ...stepped };
        }
        return { ...next, series: [...prev.series, ...added] };
      });
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [state.running, params]);

  // Chart drawing
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, h - 30);
    ctx.lineTo(w - 10, h - 30);
    ctx.stroke();

    if (state.series.length > 1) {
      const maxQ = Math.max(1, ...state.series.map((s) => s.Pth * 1.2));
      const maxT = RIG_STORE_TOP_C;
      const total = DEMO_DAY_END_MIN - DEMO_DAY_START_MIN;
      const yQ = (v: number) => h - 30 - (v / maxQ) * (h - 60);
      const yT = (v: number) => h - 30 - (v / maxT) * (h - 60);
      const x = (i: number) => 40 + (i / total) * (w - 60);
      const line = (color: string, y: (s: SimState['series'][number]) => number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        state.series.forEach((s, i) => (i === 0 ? ctx.moveTo(x(i), y(s)) : ctx.lineTo(x(i), y(s))));
        ctx.stroke();
      };
      line('#f97316', (s) => yQ(s.Pth));
      line('#dc2626', (s) => yQ(s.Pe));
      line('#3b82f6', (s) => yT(s.T));
    }
  }, [state.series]);

  const resetSim = () => setState(fresh());

  const preset = PRESETS.find((p) => p.dni === params.dniKWhPerM2Day)?.key ?? 'custom';
  const handlePresetChange = (key: string) => {
    const p = PRESETS.find((x) => x.key === key);
    if (p) setParams((prev) => ({ ...prev, dniKWhPerM2Day: p.dni }));
  };
  const overnightC = rigStoreAfterC(state.storeC, params.sandKg, params.ambientC, OVERNIGHT_H);
  const dayDone = state.minute >= DEMO_DAY_END_MIN;

  // Sun position calculation
  const frac = clamp((state.minute - DEMO_DAY_START_MIN) / (DEMO_DAY_END_MIN - DEMO_DAY_START_MIN), 0, 1);
  const sunAngle = frac * Math.PI;
  const troughAngle = lerp(-20, 35, Math.sin(sunAngle));

  const inputClass =
    'w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-orange-500 focus:outline-none';

  return (
    <section id="demo" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Interactive Demo
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light">
            One clear day of the retired research rig — mirror troughs, a hot sand store and a small ORC turbine —
            simulated minute by minute from the same tested module as the rest of the site. The Hybrid we would build has
            no turbine.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Controls Panel */}
          <div className="xl:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-5 sm:p-8 rounded-3xl shadow-2xl border border-gray-700">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Simulation Controls</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="demo-preset" className="block text-sm font-medium text-gray-300 mb-2">
                  Location (annual-average direct sunlight, kWh/m²·day)
                </label>
                <select id="demo-preset" value={preset} onChange={(e) => handlePresetChange(e.target.value)} className={inputClass}>
                  {PRESETS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                  <option value="custom" disabled>
                    Custom
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField id="demo-dni" label="DNI (kWh/m²·day)" value={params.dniKWhPerM2Day} min={0} max={12} step={0.1}
                  onValue={(v) => setParams((prev) => ({ ...prev, dniKWhPerM2Day: v }))} className={inputClass} />
                <NumberField id="demo-area" label="Mirror Area (m²)" value={params.areaM2} min={1} max={100} step={1}
                  onValue={(v) => setParams((prev) => ({ ...prev, areaM2: v }))} className={inputClass} />
                <NumberField id="demo-sand" label="Sand Mass (kg)" value={params.sandKg} min={100} max={20000} step={100}
                  onValue={(v) => setParams((prev) => ({ ...prev, sandKg: v }))} className={inputClass} />
                <NumberField id="demo-orc" label={`ORC Efficiency (max ${ORC_MAX})`} value={params.orcEfficiency} min={0} max={ORC_MAX} step={0.01}
                  onValue={(v) => setParams((prev) => ({ ...prev, orcEfficiency: v }))} className={inputClass} />
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setState((prev) => (prev.minute >= DEMO_DAY_END_MIN ? prev : { ...prev, running: !prev.running }))}
                  disabled={dayDone}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 rounded-xl transition-all duration-300 font-semibold shadow-lg"
                >
                  {state.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{state.running ? 'Pause' : dayDone ? 'Day done' : 'Play'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetSim}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <div className="flex gap-2" role="group" aria-label="Simulation speed">
                  {[1, 5, 20].map((speed) => (
                    <button
                      type="button"
                      key={speed}
                      aria-pressed={state.speed === speed}
                      onClick={() => setState((prev) => ({ ...prev, speed }))}
                      className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                        state.speed === speed ? 'bg-orange-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {speed}×
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-700">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-xl border border-blue-500/30">
                  <div className="text-blue-300 text-sm mb-1">Sim Time</div>
                  <div className="text-2xl font-bold text-white">{hms(state.minute)}</div>
                </div>
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-4 rounded-xl border border-red-500/30">
                  <div className="text-red-300 text-sm mb-1">Store Temp</div>
                  <div className="text-2xl font-bold text-white">{Math.round(state.storeC)}°C</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-4 rounded-xl border border-orange-500/30">
                  <div className="text-orange-300 text-sm mb-1">Heat Collected</div>
                  <div className="text-lg font-bold text-white">{fmtKWh(state.collectedKWh)}</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-4 rounded-xl border border-yellow-500/30">
                  <div className="text-yellow-300 text-sm mb-1">Electricity (ORC)</div>
                  <div className="text-lg font-bold text-white">{fmtKWh(state.electricKWh)}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-gray-300 text-sm mb-1">ORC reject heat</div>
                  <div className="text-lg font-bold text-white">{fmtKWh(state.rejectKWh)}</div>
                  <div className="text-gray-400 text-xs">~30–40 °C: too cool to heat a home</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-gray-300 text-sm mb-1">Lost from store</div>
                  <div className="text-lg font-bold text-white">{fmtKWh(state.lostKWh + state.defocusedKWh)}</div>
                  <div className="text-gray-400 text-xs">incl. {fmtKWh(state.defocusedKWh)} defocused at {RIG_STORE_TOP_C} °C</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {dayDone ? 'By' : 'If the day ended now, by'} 06:00 tomorrow the sealed store would be at about{' '}
                {Math.round(overnightC)} °C ({OVERNIGHT_H} hours of standing loss, nothing drawn off).
              </p>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="xl:col-span-3 space-y-8 min-w-0">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 sm:p-8 rounded-3xl shadow-2xl border border-gray-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">System Animation</h3>
              </div>

              <div
                className="relative bg-gradient-to-b from-blue-900/20 to-gray-900/50 rounded-2xl p-8 border border-gray-600/50 overflow-hidden"
                style={{ height: '300px' }}
              >
                <div
                  className="absolute w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg transition-all duration-1000"
                  style={{ left: `${10 + 60 * frac}%`, top: `${20 + 30 * (1 - Math.sin(sunAngle))}%` }}
                >
                  <Sun className="w-8 h-8 text-white m-2" />
                </div>

                <div
                  className="absolute bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-lg transition-all duration-500"
                  style={{
                    left: '20%',
                    top: '60%',
                    width: '30%',
                    height: '8px',
                    transform: `rotate(${troughAngle}deg)`,
                    transformOrigin: 'center',
                  }}
                />

                <div className="absolute right-4 sm:right-8 bottom-8 w-16 sm:w-24 h-32 rounded-xl border-2 border-gray-600 overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full transition-all duration-1000 rounded-b-lg"
                    style={{
                      height: `${clamp(((state.storeC - params.ambientC) / (RIG_STORE_TOP_C - params.ambientC)) * 100, 0, 100)}%`,
                      background: colorForTemp(state.storeC),
                    }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <Thermometer className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="absolute top-4 left-4 text-sm text-gray-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Mirror trough</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Sand store</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 sm:p-8 rounded-3xl shadow-2xl border border-gray-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Gauge className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Simulated Day</h3>
              </div>

              <canvas
                ref={chartRef}
                width={800}
                height={240}
                className="w-full rounded-xl bg-gray-900/50 border border-gray-600/50"
              />

              <div className="flex flex-wrap gap-6 mt-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-300">Heat collected (kW)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">Electric (kW)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Store temperature (°C, 0–{RIG_STORE_TOP_C})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6 md:p-8 rounded-2xl border border-orange-500/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-3 text-orange-400">Demo Notes</h4>
              <p className="text-gray-300 leading-relaxed">
                Simplified physics, stated: sunshine follows a sine from 06:00 to 20:00; the troughs collect{' '}
                {Math.round(RIG_COLLECT_EFFICIENCY * 100)}% of it into the store (the site's {Math.round(COLLECTOR_EFFICIENCY * 100)}%
                loss chain without its storage stage, because the store's standing loss is simulated here instead, through
                150 mm of mineral wool that insulates about half as well at these temperatures); once the store passes {params.dispatchAboveC} °C the ORC takes{' '}
                {Math.round(params.dispatchFraction * 100)}% of the incoming heat; at {RIG_STORE_TOP_C} °C the troughs defocus.
                Nothing here has been built and measured.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
