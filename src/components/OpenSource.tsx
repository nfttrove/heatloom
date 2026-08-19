import { Github, Download, Users, BookOpen, Star, GitFork, Heart, Rocket } from 'lucide-react';

export default function OpenSource() {
  return (
    <section id="open-source" className="py-24 bg-gradient-to-br from-white to-orange-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-8">Open Source & Community</h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            Complete documentation, build plans, and source code available for transparency, collaboration, and global impact.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-10">
            <div className="group bg-gradient-to-br from-gray-900 to-black p-10 rounded-3xl shadow-2xl hover:shadow-gray-900/25 transition-all duration-500 transform hover:scale-105">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Github className="w-7 h-7 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Repository Access</h3>
                  <p className="text-gray-400">MIT Licensed</p>
                </div>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                Complete access to CAD files, control software, assembly instructions, and performance data. 
                Licensed under MIT for maximum freedom and innovation.
              </p>
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold">2.1k</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <GitFork className="w-4 h-4 text-blue-400" />
                  <span className="font-bold">487</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="font-bold">Active</span>
                </div>
              </div>
              <button className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-bold shadow-lg">
                <Github className="w-5 h-5" />
                <span>View on GitHub</span>
              </button>
            </div>

            <div className="group bg-gradient-to-br from-blue-500 to-indigo-600 p-10 rounded-3xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Build Plans</h3>
                  <p className="text-blue-200">Complete documentation</p>
                </div>
              </div>
              <div className="space-y-4 text-white mb-8">
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-blue-100">Complete CAD drawings and assembly guides</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-blue-100">Bill of materials with supplier recommendations</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-blue-100">Step-by-step photo documentation</span>
                </div>
              </div>
              <button className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-bold shadow-lg">
                <Download className="w-5 h-5" />
                <span>Download Plans</span>
              </button>
            </div>
          </div>

          <div className="space-y-10">
            <div className="group bg-gradient-to-br from-green-500 to-emerald-600 p-10 rounded-3xl shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Global Community</h3>
                  <p className="text-green-200">Worldwide collaboration</p>
                </div>
              </div>
              <p className="text-green-100 mb-8 leading-relaxed text-lg">
                Join builders worldwide sharing experiences, improvements, and troubleshooting. 
                Contribute to the evolution of distributed solar thermal technology.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 p-6 rounded-xl text-center backdrop-blur-sm">
                  <div className="text-3xl font-black text-white mb-2">150+</div>
                  <p className="text-green-200 font-medium">Active builders</p>
                </div>
                <div className="bg-white/10 p-6 rounded-xl text-center backdrop-blur-sm">
                  <div className="text-3xl font-black text-white mb-2">25</div>
                  <p className="text-green-200 font-medium">Countries</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-colors font-bold shadow-lg">
                <Users className="w-5 h-5" />
                <span>Join Community</span>
              </button>
            </div>

            <div className="group bg-gradient-to-br from-purple-500 to-violet-600 p-10 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Documentation</h3>
                  <p className="text-purple-200">Comprehensive resources</p>
                </div>
              </div>
              <div className="space-y-4 text-white">
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-purple-100">Theory and design principles</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-purple-100">Testing protocols and performance data</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-purple-100">Troubleshooting guides and FAQs</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-purple-100">Video tutorials and live builds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white p-12 rounded-4xl text-center shadow-2xl">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Rocket className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold mb-6">Ready to Join the Solar Thermal Revolution?</h3>
          <p className="text-xl mb-12 text-orange-100 max-w-3xl mx-auto font-light leading-relaxed">
            Start building your own HeatLoom system today. Access comprehensive plans, join our global community, 
            and contribute to the future of distributed renewable energy.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="group flex items-center justify-center space-x-3 px-10 py-5 bg-white text-orange-600 rounded-2xl hover:bg-orange-50 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105">
              <Github className="w-6 h-6" />
              <span>Fork on GitHub</span>
            </button>
            <button className="group flex items-center justify-center space-x-3 px-10 py-5 border-2 border-white text-white rounded-2xl hover:bg-white/10 transition-all duration-300 font-bold text-lg backdrop-blur-sm">
              <Users className="w-6 h-6" />
              <span>Join Community</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}