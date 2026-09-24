import { CheckCircle, AlertTriangle, Wrench, Package, Hammer, Cpu, Sun, Droplets } from 'lucide-react';
import {
  loomPlan,
  DEFAULT_LOOM,
  LOOM_CONTROLLER_PARTS,
  LOOM_CONTROLLER_PARTS_GBP,
  PANEL_WATTS,
  PV_GBP_PER_KWP,
  PV_AC_FITTINGS_GBP,
  G98_LIMIT_KW,
  COLLECTOR_GBP_PER_M2,
  THERMAL_BOP_GBP,
  WATER_STORE_GBP_PER_KWH,
  formatGBP,
} from '../utils/heatloom';

const PLAN = loomPlan(DEFAULT_LOOM);
const PANELS = Math.round((DEFAULT_LOOM.pvKwp * 1000) / PANEL_WATTS);
const TUBES_M2 = 3;
const WITH_TUBES = loomPlan({ ...DEFAULT_LOOM, tubesM2: TUBES_M2 });

const STEPS = [
  { title: 'Check the roof and the tank', text: `About ${Math.round(PANELS * 2)} m² of roof facing roughly south (east or west works, with less output), and a hot-water cylinder with an immersion heater. On a combi boiler there is no tank: add a cylinder (a qualified installer's job) or build the panels alone.`, icon: <CheckCircle className="w-5 h-5" /> },
  { title: 'Size it for G98', text: `Choose type-tested microinverters (on the ENA register) totalling no more than ${G98_LIMIT_KW} kW. Then it connects first and you tell the network operator within 28 days; anything bigger needs their approval before you start.`, icon: <Package className="w-5 h-5" /> },
  { title: 'Mount the panels', text: `${PANELS} × ${PANEL_WATTS} W panels on roof hooks and rails, from a scaffold — not a ladder.`, icon: <Sun className="w-5 h-5" /> },
  { title: 'Wire the microinverters', text: 'One microinverter per panel or pair, joined by the AC trunk cable, through an AC isolator. A registered electrician connects it to its own RCBO and certifies it.', icon: <Wrench className="w-5 h-5" /> },
  { title: 'Build the loom', text: 'Current clamp on the meter tails and an AC voltage adapter (together they tell import from export), ESP32, solid-state relay on its heatsink, tank sensor and 5 V supply, in one ventilated enclosure.', icon: <Cpu className="w-5 h-5" /> },
  { title: 'Connect it to the immersion', text: "The loom switches the immersion heater's supply, after a double-pole isolator and with the tank's thermostat left in circuit. This is mains work on a 3 kW circuit: the electrician connects and tests it.", icon: <Hammer className="w-5 h-5" /> },
  { title: 'Commission', text: "With a diverter running (the loom, or a bought one meanwhile), on a sunny day with the tank cool the meter should show almost no export while the tank heats. Set the boiler to heat water in the evening, after the sun, so the panels get first go, and run a weekly 60 °C hygiene cycle (an immersion timer does this until the loom's firmware can).", icon: <Droplets className="w-5 h-5" /> },
];

export default function BuildGuide() {
  return (
    <section id="build" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">The build</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Bought panels, a controller you build yourself, and the hot-water tank you probably already have.
          </p>
          <div className="mt-8 inline-flex flex-col sm:flex-row sm:items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-2xl border border-orange-200/50">
            <span className="text-2xl font-bold sm:mr-3">{formatGBP(PLAN.economics.costGBP)}</span>
            <span className="text-base font-medium">in parts for the {DEFAULT_LOOM.pvKwp} kWp build — plus the electrician</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 p-6 md:p-10 rounded-3xl border border-gray-100">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Parts list</h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between gap-3 mb-1">
                  <span className="font-bold text-gray-900">Solar panels</span>
                  <span className="font-bold text-orange-600 whitespace-nowrap">{formatGBP(PLAN.economics.pvCostGBP)}</span>
                </div>
                <p className="text-gray-600 text-sm">
                  {PANELS} × {PANEL_WATTS} W panels, microinverters, roof hooks, rails and cable ({formatGBP(PV_GBP_PER_KWP)} per
                  kWp), plus an AC isolator and RCBO ({formatGBP(PV_AC_FITTINGS_GBP)})
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-orange-200">
                <div className="flex justify-between gap-3 mb-2">
                  <span className="font-bold text-gray-900">The loom</span>
                  <span className="font-bold text-orange-600 whitespace-nowrap">{formatGBP(LOOM_CONTROLLER_PARTS_GBP)}</span>
                </div>
                <ul className="space-y-1">
                  {LOOM_CONTROLLER_PARTS.map((p) => (
                    <li key={p.item} className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-600">
                        <span className="text-gray-900 font-medium">{p.item}</span> — {p.detail}
                      </span>
                      <span className="text-gray-500 whitespace-nowrap">{formatGBP(p.gbp)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between gap-3 mb-1">
                  <span className="font-bold text-gray-900">Hot-water tank</span>
                  <span className="font-bold text-orange-600 whitespace-nowrap">your own</span>
                </div>
                <p className="text-gray-600 text-sm">Any cylinder with an immersion heater. Adding one costs about {formatGBP(DEFAULT_LOOM.tankKWh * WATER_STORE_GBP_PER_KWH)} plus a qualified installer.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50/50 to-red-50/30 p-6 md:p-10 rounded-3xl border border-orange-100">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Build steps</h3>
            <ol className="space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 flex items-center gap-2">{s.icon}{s.title}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mt-1">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-blue-50 p-6 md:p-8 rounded-3xl border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Add-on: solar tubes</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              For more hands-on building and more winter hot water: {TUBES_M2} m² of evacuated tubes on the same tank, through
              a pump station and a twin-coil solar cylinder — about {formatGBP(WITH_TUBES.economics.tubesCostGBP)} more.
            </p>
            <p className="text-gray-700 leading-relaxed">
              They lift December's hot water from {Math.round(PLAN.hotWater.coverDecember * 100)}% to{' '}
              {Math.round(WITH_TUBES.hotWater.coverDecember * 100)}%. In summer the panels already fill the tank, so they add
              about {formatGBP(WITH_TUBES.economics.savingsGBP - PLAN.economics.savingsGBP)} a year on top: choose them for
              the build and the winter, not the payback. Tube parts: {formatGBP(TUBES_M2 * COLLECTOR_GBP_PER_M2)} of
              collectors, {formatGBP(THERMAL_BOP_GBP)} of pump station and controller.
            </p>
          </div>
          <div className="bg-amber-50 p-6 md:p-8 rounded-3xl border border-amber-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Where the loom is up to</h3>
                <p className="text-gray-700 leading-relaxed">
                  The parts list and build steps are above; the loom's firmware and wiring diagram are still to be written.
                  The job it does is proven: the open-source Mk2 PV Router and bought diverters do it today, and either gives
                  the same savings in the meantime. Read the Safety section before you start.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
