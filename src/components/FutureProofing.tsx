import { Zap, Layers, Settings, Globe, Cpu } from 'lucide-react';

export default function FutureProofing() {
  const upgrades = [
    {
      title: "Parallel Expansion",
      description: "Scale horizontally with multiple storage units and collector arrays",
      icon: <Layers className="w-7 h-7" />,
      benefits: ["Increased capacity", "System redundancy", "Economies of scale"],
      color: "blue"
    },
    {
      title: "Advanced Power Cycles",
      description: "Upgrade from ORC to supercritical CO₂ or multi-stage thermal systems",
      icon: <Zap className="w-7 h-7" />,
      benefits: ["Higher efficiency", "Better performance", "Future technology"],
      color: "purple"
    },
    {
      title: "Hybrid Integration",
      description: "Combine with photovoltaic panels for complementary energy generation",
      icon: <Settings className="w-7 h-7" />,
      benefits: ["Balanced output", "Weather resilience", "Optimized land use"],
      color: "green"
    },
    {
      title: "Smart Automation",
      description: "AI-driven predictive tracking, weather forecasting, and grid integration",
      icon: <Cpu className="w-7 h-7" />,
      benefits: ["Predictive operation", "Grid services", "Remote monitoring"],
      color: "orange"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-8">Future-Proofing</h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Heat Loom's modular architecture enables seamless upgrades and expansion as technology advances and energy requirements evolve.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
          {upgrades.map((upgrade, index) => (
            <div key={index} className="group bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100">
              <div className={`w-16 h-16 bg-gradient-to-br from-${upgrade.color}-400 to-${upgrade.color}-600 rounded-3xl flex items-center justify-center mb-8 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {upgrade.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{upgrade.title}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">{upgrade.description}</p>
              <div className="space-y-3">
                {upgrade.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 bg-${upgrade.color}-500 rounded-full`}></div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-12 rounded-4xl shadow-2xl border border-gray-700/50">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold mb-6">Bridging Industrial Performance with DIY Accessibility</h3>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto font-light">
              Heat Loom delivers technically elegant, serviceable, and efficient CSP technology that makes
              industrial-grade solar thermal accessible for local, community-scale deployment worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-8 rounded-2xl backdrop-blur-sm border border-orange-500/30 group-hover:bg-orange-500/30 transition-all">
                <div className="text-4xl font-black text-orange-400 mb-4">Open Source</div>
                <p className="text-gray-300 leading-relaxed">Complete transparency and community-driven development</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-8 rounded-2xl backdrop-blur-sm border border-purple-500/30 group-hover:bg-purple-500/30 transition-all">
                <div className="text-4xl font-black text-purple-400 mb-4">Modular</div>
                <p className="text-gray-300 leading-relaxed">Scalable design with clear upgrade pathways</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-8 rounded-2xl backdrop-blur-sm border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-all">
                <div className="text-4xl font-black text-emerald-400 mb-4">Reliable</div>
                <p className="text-gray-300 leading-relaxed">Passive operation for maximum uptime and minimal maintenance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}