import { Shield, CheckCircle, Wrench, Eye, Bell, Cog, Zap, Droplets, Thermometer, HardHat, Cpu } from 'lucide-react';
import { G98_LIMIT_KW, HYBRID_STORE_TOP_C } from '../utils/heatloom';

const HAZARDS = [
  {
    icon: <HardHat className="w-6 h-6" />,
    title: 'Working at height',
    text: 'Falls from roofs are the biggest risk in any solar job. Work from a scaffold with edge protection, never a ladder alone, and keep people out of the drop zone below.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Electricity',
    text: `Panels are live whenever light falls on them and cannot be switched off; microinverters keep the high-voltage DC short and on the roof. A registered electrician connects the system to its own breaker with RCD protection and certifies it under Part P. Tell the network operator within 28 days (G98, up to ${G98_LIMIT_KW} kW of inverter output).`,
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'The loom switches mains power',
    text: "It controls a 3 kW immersion heater. Mount the relay on its heatsink inside an earthed or insulated IP-rated enclosure, fuse it correctly, and keep the tank's own thermostat and cut-out in circuit, so the loom can only ever give the tank less heat than they allow. The electrician connects and tests it.",
  },
  {
    icon: <Droplets className="w-6 h-6" />,
    title: 'Water hygiene (legionella)',
    text: 'Legionella bacteria grow in stored water between about 20 and 45 °C. Keep the top of the tank at 60 °C or above (the boiler or immersion tops it up) and heat the whole tank to 60 °C once a week. The loom is designed to schedule this, using the sun when there is any; until then, a timer on the immersion does it.',
  },
  {
    icon: <Thermometer className="w-6 h-6" />,
    title: 'Hot water and pressure',
    text: `Water at 60 °C and above scalds in seconds: fit a thermostatic mixing valve rated for the hottest water the tank delivers. An unvented cylinder needs both of its safety devices — a non-self-resetting energy cut-out and a temperature-and-pressure relief valve discharging through a tundish — and must be fitted by a G3-qualified installer; a vented one needs its open vent kept clear. With solar tubes, the cut-out must stop the solar pump before the relief valve opens (the tank charges to about ${HYBRID_STORE_TOP_C} °C).`,
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Stagnation (tubes add-on)',
    text: 'When the tank is full, the pump stops or the power fails, evacuated tubes keep absorbing sunlight with no flow and can pass 200 °C (the stagnation temperature is on the collector datasheet). The glycol boils and the loop pressure jumps. Size the expansion vessel and relief valve for stagnation, use high-temperature glycol, or choose a drainback loop that empties the collectors whenever the pump stops. Tubes cannot be defocused.',
  },
];

const CHECKLISTS = [
  { category: 'Electrical', icon: <Zap className="w-7 h-7" />, box: 'bg-gradient-to-br from-yellow-400 to-orange-500', dot: 'bg-orange-500', items: ['Own breaker with RCD protection', 'Electrician-certified connection (Part P)', 'G98 notification to the network operator', 'Loom in an IP-rated enclosure, relay on its heatsink'] },
  { category: 'Hot water', icon: <Droplets className="w-7 h-7" />, box: 'bg-gradient-to-br from-red-400 to-red-600', dot: 'bg-red-500', items: ['Tank thermostat and cut-out left in circuit', 'Weekly 60 °C hygiene cycle', 'Mixing valve rated for the tank', 'Relief-valve discharge through a tundish to a safe, visible place'] },
  { category: 'Roof', icon: <HardHat className="w-7 h-7" />, box: 'bg-gradient-to-br from-green-400 to-green-600', dot: 'bg-green-500', items: ['Scaffold with edge protection', 'Roof hooks fixed to rafters, not battens', 'Weatherproofed cable entry'] },
];

const MAINTENANCE = [
  { frequency: 'Monthly', tasks: ['Glance at the meter on a sunny day: export should be near zero until the tank is hot', 'Check the hygiene cycle ran'], box: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50', badge: 'bg-gradient-to-br from-blue-500 to-blue-600', title: 'text-blue-800', dot: 'bg-blue-600', icon: <Eye className="w-5 h-5" /> },
  { frequency: 'Twice a year', tasks: ['Test the RCD', 'Look over panels and cable entry for damage'], box: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200/50', badge: 'bg-gradient-to-br from-green-500 to-green-600', title: 'text-green-800', dot: 'bg-green-600', icon: <CheckCircle className="w-5 h-5" /> },
  { frequency: 'Yearly', tasks: ['Service an unvented cylinder (relief valves, expansion vessel)', 'Check the loom enclosure for heat marks'], box: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200/50', badge: 'bg-gradient-to-br from-orange-500 to-orange-600', title: 'text-orange-800', dot: 'bg-orange-600', icon: <Wrench className="w-5 h-5" /> },
  { frequency: 'Tubes add-on', tasks: ['Check glycol strength and loop pressure each autumn', 'Replace glycol as its datasheet says'], box: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200/50', badge: 'bg-gradient-to-br from-red-500 to-red-600', title: 'text-red-800', dot: 'bg-red-600', icon: <Cog className="w-5 h-5" /> },
];

export default function Safety() {
  return (
    <section id="safety" className="py-24 bg-gradient-to-br from-gray-50 to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Safety</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Roofs, mains electricity and hot water under pressure can hurt people. This is a checklist, not a certification:
            the electrician and, for unvented cylinders, a G3-qualified installer sign off their parts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {HAZARDS.map((h) => (
            <div key={h.title} className="bg-white p-6 md:p-8 rounded-2xl border-2 border-red-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0">{h.icon}</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">{h.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{h.text}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {CHECKLISTS.map((c) => (
            <div key={c.category} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <div className={`w-16 h-16 ${c.box} rounded-3xl flex items-center justify-center mb-6 text-white shadow-lg`}>{c.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{c.category}</h3>
              <ul className="space-y-4">
                {c.items.map((item) => (
                  <li key={item} className="flex items-start space-x-4">
                    <div className={`w-3 h-3 ${c.dot} rounded-full mt-2 flex-shrink-0`}></div>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 md:p-12 rounded-4xl shadow-2xl border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Maintenance</h3>
            <p className="text-lg md:text-xl text-gray-600 font-light">A few small checks.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MAINTENANCE.map((s) => (
              <div key={s.frequency} className={`${s.box} p-8 rounded-2xl border`}>
                <div className={`w-12 h-12 ${s.badge} rounded-xl flex items-center justify-center mb-6 text-white shadow-md`}>{s.icon}</div>
                <h4 className={`text-xl font-bold ${s.title} mb-6`}>{s.frequency}</h4>
                <ul className="space-y-3">
                  {s.tasks.map((task) => (
                    <li key={task} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 ${s.dot} rounded-full mt-2 flex-shrink-0`}></div>
                      <span className="text-gray-700 leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 md:p-8 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-3">Before you start</h4>
                <p className="text-white leading-relaxed">
                  Get the electrician lined up before the panels go on the roof, and never bypass a tank's thermostat, cut-out or
                  relief valve to make the loom work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
