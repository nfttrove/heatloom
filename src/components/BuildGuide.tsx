import { CheckCircle, AlertTriangle, Wrench, Package, Hammer, Cog, TrendingUp } from 'lucide-react';
import { RIG_BOM, RIG_BOM_TOTAL_GBP, DEFAULT_HYBRID, hybridPlan, formatGBP } from '../utils/heatloom';

const BOM_ICONS = [<Hammer className="w-5 h-5" />, <Package className="w-5 h-5" />, <CheckCircle className="w-5 h-5" />, <Package className="w-5 h-5" />, <Wrench className="w-5 h-5" />, <Cog className="w-5 h-5" />];
const HYBRID_COST = hybridPlan(DEFAULT_HYBRID).economics.systemCostGBP;

export default function BuildGuide() {
  const buildSteps = [
    { title: "Collector Assembly", description: "Frame troughs, mount mirrors, align receiver tubes", icon: <Hammer className="w-5 h-5" /> },
    { title: "Storage Preparation", description: "Line vessel with ceramic fiber + VIP panels; pack layers in sequence", icon: <Package className="w-5 h-5" /> },
    { title: "Charge Coil Installation", description: "Manifold headers + parallel SS loops in basalt zone", icon: <Cog className="w-5 h-5" /> },
    { title: "Use Coil Installation", description: "Centred in the core. Keep water out of the hot zone, or use pressure-rated parts with a relief valve (see Safety)", icon: <Wrench className="w-5 h-5" /> },
    { title: "Thermosiphon Loop", description: "Install lift leg, check valve, expansion pot", icon: <CheckCircle className="w-5 h-5" /> },
    { title: "Instrumentation", description: "Install sensors at top, mid, wall positions", icon: <Cog className="w-5 h-5" /> },
    { title: "Control Wiring", description: "Connect Pi/ESP32 to motor driver, wind sensor, limit switches — plus a spring or gravity return that defocuses the trough when the power fails", icon: <Wrench className="w-5 h-5" /> }
  ];

  const materials = RIG_BOM.map((b, i) => ({ category: b.item, items: b.detail, icon: BOM_ICONS[i], cost: formatGBP(b.gbp) }));

  return (
    <section id="build" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Build Your Heat Loom</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            An outline build for the research-grade thermal rig — parts, sequence and tests, not yet drawings or CAD.
            Two build paths exist: this one (silvered-glass troughs, evacuated receivers, ~{formatGBP(RIG_BOM_TOTAL_GBP)}) and
            the commodity Hybrid (~{formatGBP(HYBRID_COST)} at sourced 2026 prices). Both end in a sand store, run at very
            different temperatures. Read the Safety section before building either.
          </p>
          <div className="mt-8 inline-flex flex-col sm:flex-row sm:items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-2xl border border-orange-200/50">
            <span className="flex items-center font-bold text-lg"><Package className="w-5 h-5 mr-3" />Research-grade thermal rig: ~{formatGBP(RIG_BOM_TOTAL_GBP)}</span>
            <span className="text-sm text-gray-600 sm:ml-3">(experimenter's parts — a house system costs less: see the Hybrid's cost tiers)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 mb-20">
          <div>
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">Bill of Materials</h3>
                <p className="text-gray-500 font-medium">Research-grade components</p>
              </div>
            </div>
            <div className="space-y-6">
              {materials.map((material, index) => (
                <div key={index} className="group bg-gradient-to-r from-white to-orange-50/30 p-6 rounded-2xl border border-orange-100/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-4 min-w-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-200 transition-colors">
                        {material.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">{material.category}</h4>
                        <p className="text-gray-600 leading-relaxed">{material.items}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{material.cost}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wrench className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">Build Steps</h3>
                <p className="text-gray-500 font-medium">Assembly sequence</p>
              </div>
            </div>
            <div className="space-y-6">
              {buildSteps.map((step, index) => (
                <div key={index} className="group flex items-start space-x-4 md:space-x-6 p-5 md:p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-2xl hover:shadow-lg transition-all duration-300 border border-blue-100/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-blue-600">
                        {step.icon}
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 md:p-12 rounded-4xl border border-yellow-200/50 shadow-xl">
          <div className="flex items-start md:space-x-6">
            <div className="hidden md:flex w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl items-center justify-center flex-shrink-0 shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Testing Protocol</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h4 className="font-bold text-gray-900 mb-6 text-xl flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span>Performance Tests</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Charge Test</p>
                        <p className="text-gray-600 text-sm">Monitor core temp until {'>'}250°C</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Hold Test</p>
                        <p className="text-gray-600 text-sm">Log the overnight drop; fit the store's cooling time constant</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Discharge Test</p>
                        <p className="text-gray-600 text-sm">Fixed flow rate, log temps</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Electric Test</p>
                        <p className="text-gray-600 text-sm">ORC efficiency measurement</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-6 text-xl flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Safety Verification</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Relief Valve Test</p>
                        <p className="text-gray-600 text-sm">Lifts at its set pressure; sized for full boil-off</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">High-temp Cutoff</p>
                        <p className="text-gray-600 text-sm">Trips on its own, with the controller unplugged</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Defocus on Power Loss</p>
                        <p className="text-gray-600 text-sm">Cut the power at full sun: the trough must go off-focus by itself</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Pressure Testing</p>
                        <p className="text-gray-600 text-sm">Leak verification</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}