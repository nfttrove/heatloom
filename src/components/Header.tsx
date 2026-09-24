import { useState } from 'react';
import { Github, Menu, X } from 'lucide-react';
import SunLoomIcon from './SunLoomIcon';

const LINKS = [
  { href: '#how', label: 'How It Works' },
  { href: '#build', label: 'The Build' },
  { href: '#calculator', label: 'Your Numbers' },
  { href: '#safety', label: 'Safety' },
  { href: '#numbers', label: 'Our Numbers' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-2xl border-b border-orange-100/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-20 gap-3">
          <a href="#overview" className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <SunLoomIcon className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Heat Loom
              </div>
              <p className="text-xs text-orange-500 font-medium tracking-wider">SOLAR POWER + HOT WATER</p>
            </div>
          </a>

          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8" aria-label="Main">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-gray-700 hover:text-orange-600 transition-colors font-medium relative group">
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
            <a
              href="https://github.com/nfttrove/heatloom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Source code on GitHub"
              className="flex items-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Source</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="lg:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="lg:hidden border-t border-orange-100 bg-white">
          <ul className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-gray-800 font-medium border-b border-gray-100 hover:text-orange-600"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
