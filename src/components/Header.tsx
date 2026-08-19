import { Github, Menu } from 'lucide-react';
import SunLoomIcon from './SunLoomIcon';

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-2xl border-b border-orange-100/50 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <SunLoomIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Heat Loom
              </h1>
              <p className="text-xs text-orange-500 font-medium tracking-wider">SOLAR THERMAL SYSTEM</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#hybrid" className="text-gray-700 hover:text-orange-600 transition-colors font-medium relative group">
              The Hybrid
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
            </a>
            <a href="#theory" className="text-gray-700 hover:text-orange-600 transition-colors font-medium relative group">
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
            </a>
            <a href="#configurator" className="text-gray-700 hover:text-orange-600 transition-colors font-medium relative group">
              Configurator
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
            </a>
            <a href="#build" className="text-gray-700 hover:text-orange-600 transition-colors font-medium relative group">
              Build Guide
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
            </a>
            <a href="#why-no-turbine" className="text-gray-700 hover:text-orange-600 transition-colors font-medium relative group">
              Why No Turbine
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
            </a>
            <a href="#on-trial" className="text-gray-700 hover:text-orange-600 transition-colors font-medium relative group">
              On Trial
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/nfttrove/heatloom"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Source</span>
            </a>
            <button className="lg:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}