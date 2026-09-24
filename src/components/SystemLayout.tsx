import { Settings, Shield, Cpu, Sun, Thermometer } from 'lucide-react';

// Static class names: Tailwind only ships classes it can find written out in full.
const RIG = [
  {
    title: 'Collector Array',
    icon: <Settings className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-orange-400 to-orange-600',
    dot: 'bg-orange-500',
    features: [
      'Silvered-glass parabolic troughs (target ≥ 94% reflectivity)',
      'Single-axis tracker, east–west',
      'Evacuated receiver tubes with selective coating',
    ],
  },
  {
    title: 'Control System',
    icon: <Cpu className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-blue-400 to-blue-600',
    dot: 'bg-blue-500',
    features: [
      'Raspberry Pi/ESP32 with a solar position algorithm',
      'K-type thermocouples for temperature monitoring',
      'Wind sensor and storm stow',
    ],
  },
  {
    title: 'Safety Systems',
    icon: <Shield className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-green-400 to-green-600',
    dot: 'bg-green-500',
    features: [
      'Relief valves and expansion vessels',
      'Over-temperature cutoff independent of the controller',
      'Defocus without power (spring or gravity return)',
    ],
  },
];

export default function SystemLayout() {
  return (
    <section className="py-24 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">System Components</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            The research rig's design, as specified — not yet built or tested. The Hybrid swaps most of it for bought parts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mb-16">
          {RIG.map((component) => (
            <div key={component.title} className="bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100">
              <div className={`w-16 h-16 ${component.box} rounded-3xl flex items-center justify-center mb-8 shadow-lg text-white`}>
                {component.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{component.title}</h3>
              <ul className="space-y-4">
                {component.features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-4">
                    <div className={`w-3 h-3 ${component.dot} rounded-full mt-2 flex-shrink-0`}></div>
                    <span className="text-gray-600 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white p-6 md:p-12 rounded-4xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">The Hybrid instead</h3>
                <p className="text-white/90 leading-relaxed">
                  Bought PV panels and microinverters for electricity; commodity evacuated-tube collectors on a pumped glycol
                  loop for heat. No mirrors, no tracker, no turbine.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Maintenance</h3>
                <p className="text-white/90 leading-relaxed">
                  Regular checks, not "maintenance-free": the schedule and the hazards are in{' '}
                  <a href="#safety" className="underline hover:text-white">
                    Safety &amp; Maintenance
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
