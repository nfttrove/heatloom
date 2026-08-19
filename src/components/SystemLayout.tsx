import { Settings, Shield, Wrench, Cpu } from 'lucide-react';

export default function SystemLayout() {
  const components = [
    {
      title: "Collector Array",
      icon: <Settings className="w-7 h-7" />,
      color: "orange",
      features: [
        "Silvered-glass parabolic troughs (≥94% reflectivity)",
        "Single-axis tracker for east-west solar tracking",
        "Evacuated receiver tubes with selective coating"
      ]
    },
    {
      title: "Control System",
      icon: <Cpu className="w-7 h-7" />,
      color: "blue",
      features: [
        "Raspberry Pi/ESP32 with Solar Position Algorithm",
        "K-type thermocouples for temperature monitoring",
        "Wind sensor and automatic storm position"
      ]
    },
    {
      title: "Safety Systems",
      icon: <Shield className="w-7 h-7" />,
      color: "green",
      features: [
        "Relief valves and expansion tanks",
        "High-temperature cutoff and park mode",
        "Waterproof installations with drainage"
      ]
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-8">System Components</h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Precision-engineered for optimal performance, longevity, and serviceability in demanding conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
          {components.map((component, index) => (
            <div key={index} className="group bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2">
              <div className={`w-16 h-16 bg-gradient-to-br from-${component.color}-400 to-${component.color}-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                  {component.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">{component.title}</h3>
              <ul className="space-y-5">
                {component.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-4">
                    <div className={`w-3 h-3 bg-${component.color}-500 rounded-full mt-2 flex-shrink-0`}></div>
                    <span className="text-gray-600 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white p-12 rounded-4xl shadow-2xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold mb-6">Maintenance Excellence</h3>
            <p className="text-xl text-orange-100 font-light max-w-3xl mx-auto">
              Structured maintenance ensures peak performance and system longevity
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white/10 p-6 rounded-2xl mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                <h4 className="font-bold text-lg mb-3">Daily</h4>
                <div className="space-y-2 text-sm text-orange-100">
                  <p>Mirror cleaning</p>
                  <p>Leak inspection</p>
                </div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 p-6 rounded-2xl mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                <h4 className="font-bold text-lg mb-3">Weekly</h4>
                <div className="space-y-2 text-sm text-orange-100">
                  <p>Tracker verification</p>
                  <p>Connection check</p>
                </div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 p-6 rounded-2xl mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                <h4 className="font-bold text-lg mb-3">Quarterly</h4>
                <div className="space-y-2 text-sm text-orange-100">
                  <p>Insulation integrity</p>
                  <p>Coil seating</p>
                </div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 p-6 rounded-2xl mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                <h4 className="font-bold text-lg mb-3">Annually</h4>
                <div className="space-y-2 text-sm text-orange-100">
                  <p>HTF replacement</p>
                  <p>Sensor calibration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}