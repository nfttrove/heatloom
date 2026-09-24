import { Shield, AlertCircle, CheckCircle, Wrench, Eye, Bell, Cog, Flame, Sun, Gauge, Weight, Thermometer } from 'lucide-react';
import { storeRetention, sandKgPerKWh, DEFAULT_HYBRID, HOUSE_TIERS, HYBRID_STORE_TOP_C, RIG_STORE_TOP_C, SAND_KG_PER_KWH } from '../utils/heatloom';

// The research rig's concentration (Theory) and a clear-sky direct beam.
const CONCENTRATION = { low: 20, high: 40 };
const CLEAR_SKY_DNI_KW_M2 = 0.8;
// Saturation pressure of water (bar absolute, steam tables) at the temperatures that matter here.
const STEAM_BAR_AT_250C = 39.7;
const STEAM_BAR_AT_350C = 165.3;
const WATER_CRITICAL_C = 374;
const DEFAULT_STORE = storeRetention(DEFAULT_HYBRID.storeKWh, 'water');
const BIGGEST_TIER = HOUSE_TIERS[HOUSE_TIERS.length - 1];
const BIGGEST_STORE = storeRetention(BIGGEST_TIER.storeKWh, 'water');

const HAZARDS = [
  {
    icon: <Sun className="w-6 h-6" />,
    title: 'Concentrated sunlight (research rig)',
    text: `At ${CONCENTRATION.low}–${CONCENTRATION.high} suns the focus line carries roughly ${Math.round(CONCENTRATION.low * CLEAR_SKY_DNI_KW_M2)}–${Math.round(CONCENTRATION.high * CLEAR_SKY_DNI_KW_M2)} kW/m² on a clear day — more than enough to ignite wood, cloth and dry leaves, and to burn skin in seconds. Never look along the mirrors or put a hand in the focus. The trough must fall off-focus with no power (spring or gravity return) and stow whenever it is unattended; a "park mode" that needs electricity is not enough. Check glare towards neighbours, roads and footpaths.`,
  },
  {
    icon: <Gauge className="w-6 h-6" />,
    title: 'Steam and pressure',
    text: `Water boils wherever it meets a surface above 100 °C once the flow stops. Trapped in the rig's store it would reach about ${STEAM_BAR_AT_250C.toFixed(0)} bar at 250 °C and ${STEAM_BAR_AT_350C.toFixed(0)} bar at 350 °C, and the store runs to ${RIG_STORE_TOP_C} °C — past water's ${WATER_CRITICAL_C} °C critical point, beyond anything a DIY coil can hold. Keep water out of the rig's store entirely: take heat out through the oil loop and an external exchanger with its own temperature limit. The Hybrid's water store stays below 100 °C (it charges to ${HYBRID_STORE_TOP_C} °C) but is still a pressure hazard: an unvented cylinder must have its temperature-and-pressure relief valve and be fitted by a G3-qualified installer; a vented store needs its open vent kept clear. Fit a thermostatic mixing valve rated for the hottest water the store delivers — water at 60 °C and above scalds in seconds.`,
  },
  {
    icon: <Thermometer className="w-6 h-6" />,
    title: 'Stagnation (Hybrid tubes)',
    text: 'When the store is full, the pump stops or the power fails, evacuated tubes keep absorbing sunlight with no flow and can pass 200 °C (the stagnation temperature is on the collector datasheet). The glycol boils and degrades and the loop pressure jumps. Size the expansion vessel and relief valve for stagnation, use high-temperature glycol, and consider a drainback loop that empties the collectors whenever the pump stops. Tubes cannot be defocused.',
  },
  {
    icon: <Flame className="w-6 h-6" />,
    title: 'Fire: sand doesn\'t burn, the system can',
    text: `The rig's loop runs on heat-transfer oil, and its ${RIG_STORE_TOP_C} °C top is hotter than common oils are rated for: mineral oils to roughly 300 °C, synthetic ones to 345–400 °C (the hottest only when pressurised), and at that temperature some are near or past autoignition — a leak can catch fire with nothing else involved. Run the loop no hotter than its fluid's rating: charging only to 300 °C still works, at about ${Math.round(sandKgPerKWh(280))} kg of sand per kWh instead of ${Math.round(SAND_KG_PER_KWH)}. Oil that soaks into insulation can self-ignite well below its flash point (a "lagging fire"). Use non-combustible insulation, catch trays under joints, and an over-temperature cutoff that works independently of the controller.`,
  },
  {
    icon: <Weight className="w-6 h-6" />,
    title: 'Weight and hot surfaces',
    text: `The default ${DEFAULT_HYBRID.storeKWh} kWh Hybrid store is about ${Math.round(DEFAULT_STORE.massKg)} kg of water plus its cylinder — check the floor can carry it. The ${BIGGEST_TIER.name.toLowerCase()} tier's ${BIGGEST_TIER.storeKWh} kWh is about ${(BIGGEST_STORE.massKg / 1000).toFixed(1)} t and belongs on a ground-level slab. The retired rig's hot sand store weighs tonnes too. Guard hot vessels and pipes from children and pets.`,
  },
];

const SAFETY_FEATURES = [
  {
    category: 'Water and steam circuits',
    icon: <Shield className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-red-400 to-red-600',
    dot: 'bg-red-500',
    items: ['Relief valve sized for full boil-off', 'Expansion vessel sized for stagnation, or a drainback loop', 'Mixing valve rated for the hottest water the coil delivers', 'Manual vent for maintenance'],
  },
  {
    category: 'Hot loop and optics',
    icon: <AlertCircle className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-orange-400 to-orange-600',
    dot: 'bg-orange-500',
    items: ['Over-temperature cutoff independent of the controller', 'Fail-safe defocus without power', 'Stow when unattended or in high wind'],
  },
  {
    category: 'Installation',
    icon: <CheckCircle className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-green-400 to-green-600',
    dot: 'bg-green-500',
    items: ['Ground-level slab for the store\'s weight', 'Waterproof tank shell with a drainage layer', 'Non-combustible insulation; service hatch'],
  },
];

const MAINTENANCE = [
  { frequency: 'Daily (rig)', tasks: ['Check the trough is tracking or stowed', 'Look for leaks'], box: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50', badge: 'bg-gradient-to-br from-blue-500 to-blue-600', title: 'text-blue-800', dot: 'bg-blue-600', icon: <Eye className="w-5 h-5" /> },
  { frequency: 'Weekly', tasks: ['Clean mirrors or tubes if dusty', 'Inspect coil connections'], box: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200/50', badge: 'bg-gradient-to-br from-green-500 to-green-600', title: 'text-green-800', dot: 'bg-green-600', icon: <CheckCircle className="w-5 h-5" /> },
  { frequency: 'Quarterly', tasks: ['Check insulation integrity', 'Test relief valves and cutoffs'], box: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200/50', badge: 'bg-gradient-to-br from-orange-500 to-orange-600', title: 'text-orange-800', dot: 'bg-orange-600', icon: <Wrench className="w-5 h-5" /> },
  { frequency: 'Annually', tasks: ['Test and replace heat-transfer fluid or glycol', 'Recalibrate sensors'], box: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200/50', badge: 'bg-gradient-to-br from-red-500 to-red-600', title: 'text-red-800', dot: 'bg-red-600', icon: <Cog className="w-5 h-5" /> },
];

export default function Safety() {
  return (
    <section id="safety" className="py-24 bg-gradient-to-br from-gray-50 to-orange-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Safety & Maintenance</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Concentrated sunlight, hot oil, steam, scalding water and tonnes of hot material can hurt people. This is a checklist, not a
            certification: have hot, pressurised or concentrating systems checked by a competent professional, and follow
            local building codes.
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
          {SAFETY_FEATURES.map((feature) => (
            <div key={feature.category} className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100">
              <div className={`w-16 h-16 ${feature.box} rounded-3xl flex items-center justify-center mb-8 text-white shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{feature.category}</h3>
              <ul className="space-y-4">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-start space-x-4">
                    <div className={`w-3 h-3 ${feature.dot} rounded-full mt-2 flex-shrink-0`}></div>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 md:p-12 rounded-4xl shadow-2xl border border-gray-100">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Maintenance Schedule</h3>
            <p className="text-lg md:text-xl text-gray-600 font-light">Small, regular checks — not "maintenance-free".</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MAINTENANCE.map((s) => (
              <div key={s.frequency} className={`${s.box} p-8 rounded-2xl border`}>
                <div className={`w-12 h-12 ${s.badge} rounded-xl flex items-center justify-center mb-6 text-white shadow-md`}>
                  {s.icon}
                </div>
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
                <h4 className="font-bold text-xl mb-3">Critical Safety Advisory</h4>
                <p className="text-white leading-relaxed">
                  Never run a hot or pressurised circuit without working relief valves, temperature monitoring and an
                  emergency shutoff, and never leave a concentrator focused and unattended. Consult local building codes
                  and a competent installer before building.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
