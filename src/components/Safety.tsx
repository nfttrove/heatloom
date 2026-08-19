import { Shield, AlertCircle, CheckCircle, Wrench, Eye, Bell, Cog } from 'lucide-react';

export default function Safety() {
  const safetyFeatures = [
    {
      category: "Steam Loop Protection",
      icon: <Shield className="w-7 h-7" />,
      color: "red",
      items: ["Relief valve for pressure management", "Expansion tank for thermal expansion", "Manual vent for maintenance"]
    },
    {
      category: "HTF Loop Safety",
      icon: <AlertCircle className="w-7 h-7" />,
      color: "orange", 
      items: ["Relief valve protection", "High-temperature cutoff system", "Automatic park mode in emergencies"]
    },
    {
      category: "Installation Safety",
      icon: <CheckCircle className="w-7 h-7" />,
      color: "green",
      items: ["Waterproof tank shell", "Drainage layer system", "Service hatch for maintenance access"]
    }
  ];

  const maintenanceSchedule = [
    { frequency: "Daily", tasks: ["Clean mirrors", "Inspect for leaks"], color: "blue", icon: <Eye className="w-5 h-5" /> },
    { frequency: "Weekly", tasks: ["Verify tracker movement", "Inspect coil connections"], color: "green", icon: <CheckCircle className="w-5 h-5" /> },
    { frequency: "Quarterly", tasks: ["Check insulation integrity", "Verify coil seating"], color: "orange", icon: <Wrench className="w-5 h-5" /> },
    { frequency: "Annually", tasks: ["Replace HTF if degraded", "Recalibrate sensors"], color: "red", icon: <Cog className="w-5 h-5" /> }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-orange-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-8">Safety & Maintenance</h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Comprehensive safety systems and maintenance protocols ensure reliable, long-term operation with peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
          {safetyFeatures.map((feature, index) => (
            <div key={index} className="group bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2">
              <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-3xl flex items-center justify-center mb-8 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{feature.category}</h3>
              <ul className="space-y-4">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-4">
                    <div className={`w-3 h-3 bg-${feature.color}-500 rounded-full mt-2 flex-shrink-0`}></div>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white p-12 rounded-4xl shadow-2xl border border-gray-100">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Maintenance Schedule</h3>
            <p className="text-xl text-gray-600 font-light">Systematic care for optimal performance</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {maintenanceSchedule.map((schedule, index) => (
              <div key={index} className={`group bg-gradient-to-br from-${schedule.color}-50 to-${schedule.color}-100 p-8 rounded-2xl border border-${schedule.color}-200/50 hover:shadow-lg transition-all duration-300`}>
                <div className={`w-12 h-12 bg-gradient-to-br from-${schedule.color}-500 to-${schedule.color}-600 rounded-xl flex items-center justify-center mb-6 text-white shadow-md group-hover:scale-110 transition-transform`}>
                  {schedule.icon}
                </div>
                <h4 className={`text-xl font-bold text-${schedule.color}-800 mb-6`}>{schedule.frequency}</h4>
                <ul className="space-y-3">
                  {schedule.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 bg-${schedule.color}-600 rounded-full mt-2 flex-shrink-0`}></div>
                      <span className="text-gray-700 leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-2xl shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-3">Critical Safety Advisory</h4>
                <p className="text-white/90 leading-relaxed">
                  Always follow proper high-temperature safety procedures. Never operate without functional relief valves, 
                  temperature monitoring, and emergency shutoff systems. Consult local building codes and safety regulations 
                  before installation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}