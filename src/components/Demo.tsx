import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Gauge, Thermometer, Zap, Sun, Activity } from 'lucide-react';

interface SimState {
  t: number;
  speed: number;
  running: boolean;
  Qcol: number;
  Qe: number;
  Qheat: number;
  T: number;
  series: Array<{ T: number; Pth: number; Pe: number; time: number }>;
}

interface SimParams {
  dni: number;
  area: number;
  etaCol: number;
  mSand: number;
  dTdesign: number;
  tAmb: number;
  UA: number;
  orcOn: boolean;
  etaORC: number;
  tDispatch: number;
  fracDispatch: number;
}

export default function Demo() {
  const [params, setParams] = useState<SimParams>({
    dni: 6,
    area: 10,
    etaCol: 0.60,
    mSand: 1500,
    dTdesign: 400,
    tAmb: 20,
    UA: 18,
    orcOn: true,
    etaORC: 0.18,
    tDispatch: 150,
    fracDispatch: 0.6
  });

  const [state, setState] = useState<SimState>({
    t: 6 * 60, // 06:00
    speed: 1,
    running: false,
    Qcol: 0,
    Qe: 0,
    Qheat: 0,
    T: 50,
    series: []
  });

  const chartRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const tMin = 6 * 60;
  const tMax = 20 * 60;

  // Utility functions
  const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const fmtKWh = (x: number) => (Math.round(x * 10) / 10).toFixed(1) + " kWh";
  const hms = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60).toString().padStart(2, '0');
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  // Solar profile generation
  const solarProfile = (dni: number) => {
    const minutes = tMax - tMin;
    const arr = new Array(minutes).fill(0);
    let sum = 0;
    for (let i = 0; i < minutes; i++) {
      const x = i / minutes;
      const val = Math.max(0, Math.sin(Math.PI * x));
      arr[i] = val;
      sum += val;
    }
    const scale = dni / sum;
    return arr.map(v => v * scale);
  };

  const profile = solarProfile(params.dni);

  // Color for temperature
  const colorForTemp = (T: number) => {
    const t = clamp((T - 20) / 330, 0, 1);
    const r = Math.floor(lerp(59, 239, t));
    const g = Math.floor(lerp(130, 68, t));
    const b = Math.floor(lerp(246, 68, t));
    return `rgb(${r},${g},${b})`;
  };


  // Animation loop
  useEffect(() => {
    const tick = () => {
      if (state.running) {
        setState(prev => {
          if (prev.t >= tMax) {
            return { ...prev, running: false };
          }
          
          let newState = { ...prev };
          for (let s = 0; s < prev.speed; s++) {
            if (newState.t >= tMax) break;
            
            const i = Math.floor(newState.t - tMin);
            const dniMin = profile[i] || 0;
            
            const QcolMin = dniMin * params.area * params.etaCol;
            const loss = Math.max(0, params.UA * (newState.T - params.tAmb) * 60 / 3.6e6);
            
            let Qdispatch = 0, Qe = 0;
            if (params.orcOn && newState.T > params.tDispatch) {
              Qdispatch = params.fracDispatch * QcolMin;
              Qe = Qdispatch * params.etaORC;
            }

            const Qnet = QcolMin - loss - Qdispatch;
            const cp_kWh = 0.0002306;
            const dT = Qnet / (params.mSand * cp_kWh);
            
            const newT = Math.max(params.tAmb, newState.T + dT);
            const Pth = Math.max(0, (QcolMin - loss) * 60);
            const Pe = Math.max(0, Qe * 60);

            newState = {
              ...newState,
              t: newState.t + 1,
              Qcol: newState.Qcol + QcolMin,
              Qe: newState.Qe + Qe,
              Qheat: newState.Qheat + Math.max(0, Qdispatch - Qe),
              T: newT,
              series: [...newState.series, { T: newT, Pth, Pe, time: newState.t + 1 }]
            };
          }
          return newState;
        });
      }
      animationRef.current = requestAnimationFrame(tick);
    };
    
    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.running, state.speed, params]);

  // Chart drawing
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    
    // Clear and setup
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, h - 30);
    ctx.lineTo(w - 10, h - 30);
    ctx.stroke();

    if (state.series.length > 1) {
      const maxQ = Math.max(1, ...state.series.map(s => s.Pth * 2));
      const maxT = 400;
      
      const yQ = (v: number) => (h - 30) - (v / maxQ) * (h - 60);
      const yT = (v: number) => (h - 30) - (v / maxT) * (h - 60);
      const x = (i: number) => 40 + (i / state.series.length) * (w - 60);

      // Draw thermal power line
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      state.series.forEach((s, i) => {
        const Y = yQ(s.Pth);
        if (i === 0) ctx.moveTo(x(i), Y);
        else ctx.lineTo(x(i), Y);
      });
      ctx.stroke();

      // Draw electric power line
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      state.series.forEach((s, i) => {
        const Y = yQ(s.Pe);
        if (i === 0) ctx.moveTo(x(i), Y);
        else ctx.lineTo(x(i), Y);
      });
      ctx.stroke();

      // Draw temperature line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      state.series.forEach((s, i) => {
        const Y = yT(s.T);
        if (i === 0) ctx.moveTo(x(i), Y);
        else ctx.lineTo(x(i), Y);
      });
      ctx.stroke();
    }
  }, [state.series]);

  const resetSim = () => {
    setState({
      t: tMin,
      speed: 1,
      running: false,
      Qcol: 0,
      Qe: 0,
      Qheat: 0,
      T: 50,
      series: []
    });
  };

  const handlePresetChange = (preset: string) => {
    const presetValues: Record<string, number> = { UK: 3, ES: 6, AZ: 8 };
    setParams(prev => ({ ...prev, dni: presetValues[preset] }));
  };

  // Sun position calculation
  const frac = (state.t - tMin) / (tMax - tMin);
  const sunAngle = frac * Math.PI;
  const troughAngle = lerp(-20, 35, Math.sin(sunAngle));

  return (
    <section id="demo" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Interactive Demo
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto font-light">
            Watch the Heat Loom system in action. Adjust parameters, press play, and see real-time energy generation.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Controls Panel */}
          <div className="xl:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-700">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Simulation Controls</h3>
            </div>

            <div className="space-y-6">
              {/* Preset Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location Preset</label>
                <select 
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="UK">UK (DNI 3 kWh/m²·day)</option>
                  <option value="ES">Spain (DNI 6 kWh/m²·day)</option>
                  <option value="AZ">Desert (DNI 8 kWh/m²·day)</option>
                </select>
              </div>

              {/* Key Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">DNI (kWh/m²·day)</label>
                  <input
                    type="number"
                    value={params.dni}
                    onChange={(e) => setParams(prev => ({ ...prev, dni: parseFloat(e.target.value) }))}
                    className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-orange-500 focus:outline-none"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Collector Area (m²)</label>
                  <input
                    type="number"
                    value={params.area}
                    onChange={(e) => setParams(prev => ({ ...prev, area: parseFloat(e.target.value) }))}
                    className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-orange-500 focus:outline-none"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Storage Mass (kg)</label>
                  <input
                    type="number"
                    value={params.mSand}
                    onChange={(e) => setParams(prev => ({ ...prev, mSand: parseFloat(e.target.value) }))}
                    className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-orange-500 focus:outline-none"
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ORC Efficiency</label>
                  <input
                    type="number"
                    value={params.etaORC}
                    onChange={(e) => setParams(prev => ({ ...prev, etaORC: parseFloat(e.target.value) }))}
                    className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-orange-500 focus:outline-none"
                    step="0.01"
                    min="0"
                    max="1"
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setState(prev => ({ ...prev, running: !prev.running }))}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl transition-all duration-300 font-semibold shadow-lg"
                >
                  {state.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{state.running ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={resetSim}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <div className="flex gap-2">
                  {[1, 5, 20].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setState(prev => ({ ...prev, speed }))}
                      className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                        state.speed === speed 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {speed}×
                    </button>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-xl border border-blue-500/30">
                  <div className="text-blue-300 text-sm mb-1">Sim Time</div>
                  <div className="text-2xl font-bold text-white">{hms(state.t)}</div>
                </div>
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-4 rounded-xl border border-red-500/30">
                  <div className="text-red-300 text-sm mb-1">Store Temp</div>
                  <div className="text-2xl font-bold text-white">{Math.round(state.T)}°C</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-4 rounded-xl border border-orange-500/30">
                  <div className="text-orange-300 text-sm mb-1">Thermal Collected</div>
                  <div className="text-lg font-bold text-white">{fmtKWh(state.Qcol)}</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-4 rounded-xl border border-yellow-500/30">
                  <div className="text-yellow-300 text-sm mb-1">Electric Generated</div>
                  <div className="text-lg font-bold text-white">{fmtKWh(state.Qe)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="xl:col-span-3 space-y-8">
            {/* System Visualization */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">System Animation</h3>
              </div>
              
              <div className="relative bg-gradient-to-b from-blue-900/20 to-gray-900/50 rounded-2xl p-8 border border-gray-600/50" style={{ height: '300px' }}>
                {/* Sun */}
                <div 
                  className="absolute w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg transition-all duration-1000"
                  style={{
                    left: `${20 + 60 * frac}%`,
                    top: `${20 + 30 * (1 - Math.sin(sunAngle))}%`,
                  }}
                >
                  <Sun className="w-8 h-8 text-white m-2" />
                </div>

                {/* Collector */}
                <div 
                  className="absolute bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-lg transition-all duration-500"
                  style={{
                    left: '30%',
                    top: '60%',
                    width: '120px',
                    height: '8px',
                    transform: `rotate(${troughAngle}deg)`,
                    transformOrigin: 'center'
                  }}
                />

                {/* Storage Tank */}
                <div className="absolute right-8 bottom-8 w-24 h-32 rounded-xl border-2 border-gray-600 overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full transition-all duration-1000 rounded-b-lg"
                    style={{
                      height: `${Math.min(100, ((state.T - params.tAmb) / params.dTdesign) * 100)}%`,
                      background: colorForTemp(state.T)
                    }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-2">
                    <Thermometer className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 text-sm text-gray-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span>Solar Collector</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Thermal Storage</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Real-time Performance</h3>
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
                  <span className="text-gray-300">Thermal Power (kW)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">Electric Power (kW)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Storage Temperature (°C)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 rounded-2xl border border-orange-500/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-3 text-orange-400">Demo Notes</h4>
              <p className="text-gray-300 leading-relaxed">
                This interactive simulation models the complete Heat Loom system dynamics including solar collection,
                thermal storage, and electricity generation. Adjust parameters to explore different configurations 
                and see how they affect daily energy output. The model uses simplified physics for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}