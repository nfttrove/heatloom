import { DollarSign, TrendingUp, Calculator, Clock } from 'lucide-react';
import { hybridPlan } from '../utils/heatloom';

const PLAN = hybridPlan({ electricKWhPerDay: 8, heatKWhPerDay: 30, pvKwp: 2, collectorM2: 3, storeKWh: 40, dniAnnual: 3 });

export default function ROI() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Return on Investment</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-world economics for the default Hybrid rig — computed by the same tested module as every other number on this site.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 md:p-12 rounded-3xl shadow-lg mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Calculator className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">Field Prototype ROI</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                  <h4 className="font-bold text-gray-900 mb-2">System Cost</h4>
                  <p className="text-3xl font-bold text-green-600">£{PLAN.economics.systemCostGBP.toLocaleString()}</p>
                  <p className="text-gray-600 text-sm">2 kWp PV + 3 m² collector + 40 kWh sand store + pump/controller (real 2026 prices)</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-bold text-gray-900 mb-2">Annual Savings</h4>
                  <p className="text-3xl font-bold text-blue-600">£{Math.round(PLAN.economics.annualSavingsGBP)}</p>
                  <p className="text-gray-600 text-sm">Coverage-capped: winter days counted at winter output</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-600">
                  <h4 className="font-bold text-gray-900 mb-2">Payback Period</h4>
                  <p className="text-3xl font-bold text-orange-600">{PLAN.economics.paybackYears.toFixed(1)} years</p>
                  <p className="text-gray-600 text-sm">Shorter in sunnier sites; the naive number is shown below, unearned</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Annual Energy Production</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Electricity (PV, 2 kWp)</span>
                    <span className="font-bold text-yellow-600">1,900 kWh/year</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Value @ £0.28/kWh</span>
                    <span className="font-bold text-green-600">£532/year</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Heat (collector + sand)</span>
                    <span className="font-bold text-red-600">1,974 kWh<sub>th</sub>/year</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Value @ £0.045/kWh<sub>th</sub></span>
                    <span className="font-bold text-green-600">£89/year</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-xl text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-6 h-6" />
                  <h4 className="text-lg font-bold">Accelerated Payback Scenarios</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Sunnier sites: DNI scales the thermal side linearly</li>
                  <li>• Bigger sand store: the cheapest component to oversize</li>
                  <li>• Rising heat prices: the thermal share appreciates</li>
                  <li>• Field data: filed measurements will replace these predictions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
            <TrendingUp className="w-10 h-10 text-orange-600 mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-3">Scalability Benefits</h4>
            <p className="text-gray-700 text-sm">
              Parallel installations reduce per-unit costs through shared infrastructure and bulk material purchasing.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <DollarSign className="w-10 h-10 text-green-600 mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-3">Long-term Value</h4>
            <p className="text-gray-700 text-sm">
              25+ year system life with modular upgrades provides sustained value and adaptability to future technologies.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <Calculator className="w-10 h-10 text-blue-600 mb-4" />
            <h4 className="text-lg font-bold text-gray-900 mb-3">Custom Sizing</h4>
            <p className="text-gray-700 text-sm">
              Use our sizing methodology to calculate optimal collector area and storage mass for your specific requirements.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}