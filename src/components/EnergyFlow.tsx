import { useRef, useEffect, useState } from 'react';
import { Sun, Zap, Battery, Settings, Thermometer, Lightbulb, Activity, Play, Pause, RotateCcw } from 'lucide-react';

interface FlowState {
  sunlight: number;
  area: number;
  usage: number;
  storage: number;
  arrowPhase: number;
  running: boolean;
}

export default function EnergyFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [state, setState] = useState<FlowState>({
    sunlight: 60,
    area: 10,
    usage: 3,
    storage: 0,
    arrowPhase: 0,
    running: true
  });

  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, intensity: number = 1) => {
    const segments = 8;
    ctx.lineWidth = 4;
    
    for (let i = 0; i < segments; i++) {
      const progress = (i / segments + state.arrowPhase) % 1;
      const alpha = Math.sin(progress * Math.PI) * intensity * 0.8;
      
      const sx = x1 + (x2 - x1) * progress;
      const sy = y1 + (y2 - y1) * progress;
      const ex = sx + (x2 - x1) / segments * 0.6;
      const ey = sy + (y2 - y1) / segments * 0.6;
      
      const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = color + alphaHex;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      
      // Arrow head on last segment
      if (i === segments - 1 && alpha > 0.3) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 15 * Math.cos(angle - 0.5), y2 - 15 * Math.sin(angle - 0.5));
        ctx.lineTo(x2 - 15 * Math.cos(angle + 0.5), y2 - 15 * Math.sin(angle + 0.5));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Fixed canvas size to prevent stretching
    canvas.width = 800;
    canvas.height = 200;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate energy flows
    const creation = (state.sunlight / 100) * state.area * 0.6;
    const netFlow = creation - state.usage;
    
    if (state.running) {
      setState(prev => ({
        ...prev,
        storage: Math.max(0, prev.storage + netFlow * 0.05),
        arrowPhase: (prev.arrowPhase + 0.03) % 1
      }));
    }

    // Draw animated arrows between component positions
    const positions = [
      { x: 80, y: 100 },   // Solar
      { x: 240, y: 100 },  // Heat Exchange
      { x: 400, y: 100 },  // Storage
      { x: 560, y: 100 },  // Generator
      { x: 720, y: 100 }   // Output
    ];

    const flowIntensity = Math.max(0.2, creation / 10);
    const storageIntensity = Math.max(0.2, state.storage / 50);
    const outputIntensity = Math.max(0.2, state.usage / 10);

    // Energy flow arrows
    drawArrow(ctx, positions[0].x + 40, positions[0].y, positions[1].x - 40, positions[1].y, '#fbbf24', flowIntensity);
    drawArrow(ctx, positions[1].x + 40, positions[1].y, positions[2].x - 40, positions[2].y, '#f97316', flowIntensity);
    drawArrow(ctx, positions[2].x + 40, positions[2].y, positions[3].x - 40, positions[3].y, '#dc2626', storageIntensity);
    drawArrow(ctx, positions[3].x + 40, positions[3].y, positions[4].x - 40, positions[4].y, '#10b981', outputIntensity);

    // Draw energy bars at bottom
    const barY = 160;
    const barHeight = 20;
    
    // Creation bar
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(50, barY, Math.min(creation * 30, 200), barHeight);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, barY, 200, barHeight);
    
    // Storage bar
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(300, barY, Math.min(state.storage * 3, 200), barHeight);
    ctx.strokeStyle = '#7f1d1d';
    ctx.strokeRect(300, barY, 200, barHeight);
    
    // Usage bar
    ctx.fillStyle = '#10b981';
    ctx.fillRect(550, barY, Math.min(state.usage * 30, 200), barHeight);
    ctx.strokeStyle = '#047857';
    ctx.strokeRect(550, barY, 200, barHeight);
  };

  useEffect(() => {
    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state]);

  const resetSystem = () => {
    setState(prev => ({ ...prev, storage: 0, arrowPhase: 0 }));
  };

  return (
    <section id="energy-flow" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Energy Flow Visualization
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto font-light">
            Watch energy flow through the complete Heat Loom system in real-time. Adjust parameters to see how different conditions affect energy generation and storage.
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-700 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">System Workflow</h3>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setState(prev => ({ ...prev, running: !prev.running }))}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl transition-all duration-300 font-semibold shadow-lg"
              >
                {state.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{state.running ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={resetSystem}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Component visualization with proper HTML layout */}
          <div className="relative bg-gradient-to-b from-gray-900/50 to-gray-800/50 rounded-2xl p-8 border border-gray-600/50 mb-8">
            <div className="grid grid-cols-5 gap-4 mb-8">
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-2xl border border-yellow-500/30 text-center group hover:scale-105 transition-transform">
                <Sun className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <h4 className="font-bold text-white">Solar Collector</h4>
                <p className="text-yellow-300 text-sm mt-2">
                  {((state.sunlight / 100) * state.area * 0.6).toFixed(2)} kW
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-2xl border border-orange-500/30 text-center group hover:scale-105 transition-transform">
                <Thermometer className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <h4 className="font-bold text-white">Heat Exchange</h4>
                <p className="text-orange-300 text-sm mt-2">
                  {Math.round(250 + (state.sunlight / 100) * 150)}°C
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-6 rounded-2xl border border-purple-500/30 text-center group hover:scale-105 transition-transform">
                <Battery className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h4 className="font-bold text-white">Thermal Storage</h4>
                <p className="text-purple-300 text-sm mt-2">
                  {state.storage.toFixed(1)} kWh
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl border border-green-500/30 text-center group hover:scale-105 transition-transform">
                <Zap className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h4 className="font-bold text-white">ORC Generator</h4>
                <p className="text-green-300 text-sm mt-2">
                  {(Math.min(state.storage * 0.18, state.usage * 0.3)).toFixed(2)} kW
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-6 rounded-2xl border border-blue-500/30 text-center group hover:scale-105 transition-transform">
                <Lightbulb className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h4 className="font-bold text-white">Energy Output</h4>
                <p className="text-blue-300 text-sm mt-2">
                  {state.usage} kWh/h
                </p>
              </div>
            </div>

            {/* Canvas for animated arrows only */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full rounded-xl border border-gray-600/50"
                style={{ height: '200px' }}
              />
            </div>
          </div>

          {/* Energy flow bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 rounded-2xl border border-yellow-500/30">
              <div className="flex items-center space-x-3 mb-4">
                <Sun className="w-6 h-6 text-yellow-400" />
                <h4 className="text-lg font-bold">Energy Creation</h4>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((state.sunlight / 100) * state.area * 0.6) * 10)}%` }}
                  />
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {((state.sunlight / 100) * state.area * 0.6).toFixed(2)} kWh/h
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-6 rounded-2xl border border-purple-500/30">
              <div className="flex items-center space-x-3 mb-4">
                <Battery className="w-6 h-6 text-purple-400" />
                <h4 className="text-lg font-bold">Thermal Storage</h4>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-violet-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, state.storage * 2)}%` }}
                  />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {state.storage.toFixed(1)} kWh
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-6 rounded-2xl border border-blue-500/30">
              <div className="flex items-center space-x-3 mb-4">
                <Lightbulb className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-bold">Energy Usage</h4>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, state.usage * 10)}%` }}
                  />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {state.usage} kWh/h
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl border border-yellow-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <Sun className="w-6 h-6 text-yellow-400" />
                <h4 className="text-lg font-bold">Solar Input</h4>
              </div>
              <label className="block text-sm text-gray-300 mb-2">Sunlight Intensity (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={state.sunlight}
                onChange={(e) => setState(prev => ({ ...prev, sunlight: parseInt(e.target.value) }))}
                className="w-full mb-2 accent-orange-500"
              />
              <div className="text-2xl font-bold text-yellow-400">{state.sunlight}%</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 rounded-2xl border border-orange-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-6 h-6 text-orange-400" />
                <h4 className="text-lg font-bold">Collector Area</h4>
              </div>
              <label className="block text-sm text-gray-300 mb-2">Area (m²)</label>
              <input
                type="range"
                min="1"
                max="20"
                value={state.area}
                onChange={(e) => setState(prev => ({ ...prev, area: parseInt(e.target.value) }))}
                className="w-full mb-2 accent-orange-500"
              />
              <div className="text-2xl font-bold text-orange-400">{state.area} m²</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-6 rounded-2xl border border-blue-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <Lightbulb className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-bold">Energy Usage</h4>
              </div>
              <label className="block text-sm text-gray-300 mb-2">Usage Rate (kWh/h)</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={state.usage}
                onChange={(e) => setState(prev => ({ ...prev, usage: parseFloat(e.target.value) }))}
                className="w-full mb-2 accent-blue-500"
              />
              <div className="text-2xl font-bold text-blue-400">{state.usage} kWh/h</div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 rounded-2xl border border-orange-500/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h4 className="font-bold text-xl mb-3 text-orange-400">Energy Flow Notes</h4>
              <p className="text-gray-300 leading-relaxed">
                This visualization shows energy flowing through each stage of the Heat Loom system. Solar energy is collected, 
                converted to high-temperature thermal energy, stored in the thermal mass, then converted to electricity via ORC 
                while providing useful heat. Adjust the controls to see how different conditions affect system performance and energy balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}