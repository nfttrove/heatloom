import { Heart, Mail, Sun } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          {/* Logo and Title */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sun className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Heat Loom
              </h3>
              <p className="text-xs text-orange-400 font-medium tracking-wider">SOLAR THERMAL SYSTEM</p>
            </div>
          </div>

          <p className="text-gray-300 mb-12 max-w-2xl mx-auto text-lg font-light">
            Open source solar thermal technology for distributed energy generation
          </p>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <a
              href="https://www.paypal.com/paypalme/2r0v3"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Support Trove</span>
            </a>
            
            <a
              href="mailto:nfttrove@gmail.com"
              className="group flex items-center space-x-3 px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Contact Us</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              © 2025 Heat Loom Project. Open source under MIT License.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}