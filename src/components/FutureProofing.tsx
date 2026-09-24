import { Layers, Settings, Cpu, FlaskConical, ClipboardCheck, Ruler } from 'lucide-react';
import {
  DEFAULT_HYBRID,
  HYBRID_SAND_KG_PER_KWH,
  HYBRID_STORE_TOP_C,
  HYBRID_STORE_USEFUL_MIN_C,
  HYBRID_WATER_KG_PER_KWH,
  storeRetention,
} from '../utils/heatloom';

const WATER_SHARE_PCT = Math.round((100 * HYBRID_WATER_KG_PER_KWH) / HYBRID_SAND_KG_PER_KWH);
const HOLDS_LONGER =
  storeRetention(DEFAULT_HYBRID.storeKWh, 'water').usefulHalfLifeDays /
  storeRetention(DEFAULT_HYBRID.storeKWh, 'sand').usefulHalfLifeDays;

// A roadmap, in order, with what each step would have to show. Nothing here is built yet.
const NEXT = [
  {
    title: 'Build and measure one Hybrid',
    description:
      'Metered PV, heat meters on the collector loop and the store, and a year of data filed against the pre-registered prediction.',
    icon: <ClipboardCheck className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    dot: 'bg-emerald-500',
    shows: ['Real collector efficiency', 'Real store standing loss', 'Real December coverage'],
  },
  {
    title: 'Write the measurement protocol',
    description:
      'What is metered, where, how weather is normalised, and what counts as meeting or missing the claim — written before the data arrives.',
    icon: <Ruler className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-blue-400 to-blue-600',
    dot: 'bg-blue-500',
    shows: ['A fair comparison', 'No moving the goalposts'],
  },
  {
    title: 'Measure the water store',
    description:
      `Decided on paper: at the Hybrid’s ${HYBRID_STORE_USEFUL_MIN_C}–${HYBRID_STORE_TOP_C} °C, water stores the same heat in about ${WATER_SHARE_PCT}% of sand’s weight and, with the same insulation, keeps it about ${HOLDS_LONGER.toFixed(1)}× as long — so the Hybrid now uses water. What a real cylinder does is still to be measured.`,
    icon: <FlaskConical className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-purple-400 to-purple-600',
    dot: 'bg-purple-500',
    shows: ['Standing loss of a real, jacketed cylinder', 'How fast the coil charges it', 'Cost per kWh actually built'],
  },
  {
    title: 'Controls that fail safe',
    description:
      'Open-source controller code with an independent over-temperature cutoff, pump-failure handling and, for any concentrator, defocus without power.',
    icon: <Cpu className="w-7 h-7" />,
    box: 'bg-gradient-to-br from-orange-400 to-orange-600',
    dot: 'bg-orange-500',
    shows: ['Tested failure modes', 'Logged data for builders'],
  },
];

export default function FutureProofing() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">What Comes Next</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            A roadmap, not a feature list: nothing below exists yet, and each step says what it would have to show.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-16 md:mb-20">
          {NEXT.map((step, index) => (
            <div key={step.title} className="bg-white p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-14 h-14 ${step.box} rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  {step.icon}
                </div>
                <div className="text-sm font-semibold text-gray-500">Step {index + 1}</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">{step.description}</p>
              <div className="space-y-2">
                {step.shows.map((s) => (
                  <div key={s} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${step.dot} rounded-full flex-shrink-0`}></div>
                    <span className="text-gray-700 font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-6 md:p-12 rounded-4xl shadow-2xl border border-gray-700/50">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Parked, not promised</h3>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light">
              Ideas we have looked at and set aside until the basics are measured.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            <div className="bg-white/10 p-6 md:p-8 rounded-2xl border border-white/10">
              <Layers className="w-8 h-8 text-orange-300 mb-4" />
              <div className="text-xl font-bold text-orange-300 mb-3">Bigger arrays</div>
              <p className="text-gray-300 leading-relaxed">
                More collectors raise summer surplus faster than December coverage. Worth it only where summer heat has a use.
              </p>
            </div>
            <div className="bg-white/10 p-6 md:p-8 rounded-2xl border border-white/10">
              <Settings className="w-8 h-8 text-purple-300 mb-4" />
              <div className="text-xl font-bold text-purple-300 mb-3">Other power cycles</div>
              <p className="text-gray-300 leading-relaxed">
                Supercritical CO₂ and similar cycles want 500 °C and more, at power-station scale. At house scale, bought PV
                is still the cheaper way to make electricity.
              </p>
            </div>
            <div className="bg-white/10 p-6 md:p-8 rounded-2xl border border-white/10">
              <Cpu className="w-8 h-8 text-emerald-300 mb-4" />
              <div className="text-xl font-bold text-emerald-300 mb-3">Smart dispatch</div>
              <p className="text-gray-300 leading-relaxed">
                Forecast-driven charging and tariff-aware PV use could lift self-use. It is software on top of hardware
                that has not been measured yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
