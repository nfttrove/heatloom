import { Sun, Waves, Battery, ArrowUp, ArrowDown, Thermometer } from 'lucide-react';

export default function Theory() {
  return (
    <section id="theory" className="py-24 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-8">How It Works</h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Advanced concentrated solar power with breakthrough thermal storage and passive heat transfer technology.
          </p>
        </div>

        <div className="mb-20">
          <div className="bg-gradient-to-br from-white to-orange-50/50 p-8 rounded-4xl shadow-2xl border border-orange-100/50">
            <img 
              src="/file_0000000067a06230975fbbcc17f8a777.png" 
              alt="Heat Loom System Diagram"
              className="w-full max-w-5xl mx-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
          <div className="group bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-orange-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Solar Collection</h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              High-precision parabolic troughs with silvered-glass mirrors focus sunlight onto evacuated receiver tubes.
            </p>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200/50">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Concentration Ratio:</span>
                  <span className="font-bold text-orange-600">20-40x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Operating Temperature:</span>
                  <span className="font-bold text-red-600">250-400°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Mirror Reflectivity:</span>
                  <span className="font-bold text-orange-600">{'≥'}94%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Waves className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Thermosiphon Loop</h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              Density-driven convection circulates heat transfer fluid without pumps for ultimate reliability and minimal maintenance.
            </p>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200/50">
              <div className="flex items-center justify-center space-x-8">
                <div className="flex flex-col items-center space-y-2 text-red-500">
                  <ArrowUp className="w-6 h-6" />
                  <span className="text-sm font-medium">Hot HTF rises</span>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div className="flex flex-col items-center space-y-2 text-blue-500">
                  <ArrowDown className="w-6 h-6" />
                  <span className="text-sm font-medium">Cool HTF sinks</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Battery className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Thermal Storage</h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              Advanced layered granular core optimizes heat retention through strategic material selection and thermal engineering.
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

        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-12 rounded-4xl shadow-2xl border border-gray-700/50">
          <div className="text-center mb-12">
            <Thermometer className="w-16 h-16 mx-auto mb-6 text-orange-400" />
            <h3 className="text-3xl font-bold mb-6">Energy Storage Engineering</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Precise calculations ensure optimal performance and cost-effectiveness
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-8 rounded-2xl border border-orange-500/20">
              <h4 className="text-2xl font-bold mb-6 text-orange-400">Collector Sizing</h4>
              <div className="bg-gray-900/50 p-6 rounded-xl font-mono border border-gray-700/50">
                <div className="text-lg mb-4 text-white">
                  A<sub>collector</sub> = Q<sub>daily</sub> / (DNI × η<sub>collector</sub>)
                </div>
                <div className="text-gray-400 space-y-2 text-sm">
                  <p>Q<sub>daily</sub> = Daily thermal requirement (kWh<sub>th</sub>)</p>
                  <p>DNI = Direct Normal Irradiance (kWh/m²/day)</p>
                  <p>η<sub>collector</sub> = Collector efficiency (0.55-0.60)</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-blue-500/20">
              <h4 className="text-2xl font-bold mb-6 text-blue-400">Storage Mass</h4>
              <div className="bg-gray-900/50 p-6 rounded-xl font-mono border border-gray-700/50">
                <div className="text-lg mb-4 text-white">
                  M<sub>storage</sub> = 11.25 kg per kWh<sub>th</sub>
                </div>
                <div className="text-gray-400 space-y-2 text-sm">
                  <p>ΔT = 400 K temperature difference</p>
                  <p>Mixed media specific heat capacity</p>
                  <p>90% storage efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}