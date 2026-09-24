import { Github, BookOpen, Users, GitFork, Rocket, ClipboardList } from 'lucide-react';

const REPO = 'https://github.com/nfttrove/heatloom';

// What exists today, and what does not yet — stated plainly.
const HAVE = [
  'This website and its tested engineering module (MIT)',
  'The research rig\'s bill of materials and build steps (Build Guide)',
  'The loss chains, monthly model and every cost assumption, with sources',
  'Pre-registered production claims in the In Fini registry (On Trial)',
];
const NOT_YET = [
  'CAD drawings, wiring diagrams or photo guides',
  'Any built rig or measured performance data',
  'A builder community — be the first to file measured yields',
];

export default function OpenSource() {
  return (
    <section id="open-source" className="py-24 bg-gradient-to-br from-white to-orange-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Open Source & Community</h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-light">
            The model, the site and the plans that exist are open. Here is exactly what is there — and what isn't yet.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 md:p-10 rounded-3xl shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Github className="w-7 h-7 text-gray-900" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">In the repository</h3>
                <p className="text-gray-400">MIT licensed</p>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {HAVE.map((h) => (
                <li key={h} className="flex items-start space-x-3 text-gray-200">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-bold shadow-lg"
            >
              <Github className="w-5 h-5" />
              <span>View on GitHub</span>
            </a>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-10 rounded-3xl shadow-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Not yet</h3>
                <p className="text-blue-100">Help wanted</p>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {NOT_YET.map((n) => (
                <li key={n} className="flex items-start space-x-3 text-white">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="#build"
                className="flex items-center justify-center space-x-2 px-6 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-colors font-bold shadow-lg"
              >
                <BookOpen className="w-5 h-5" />
                <span>Read the Build Guide</span>
              </a>
              <a
                href={`${REPO}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 px-6 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors font-bold"
              >
                <Users className="w-5 h-5" />
                <span>Open an issue</span>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white p-8 md:p-12 rounded-4xl text-center shadow-2xl">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Rocket className="w-10 h-10" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-6">Build one and prove us wrong (or right)</h3>
          <p className="text-lg md:text-xl mb-10 text-white max-w-3xl mx-auto font-light leading-relaxed">
            Nothing here has been built and measured yet. If you build a rig, fork the repo, log what it actually does,
            and file your measurements against our pre-registered predictions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`${REPO}/fork`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-3 px-8 py-4 bg-white text-orange-700 rounded-2xl hover:bg-orange-50 transition-colors font-bold text-lg shadow-xl"
            >
              <GitFork className="w-6 h-6" />
              <span>Fork on GitHub</span>
            </a>
            <a
              href="#on-trial"
              className="flex items-center justify-center space-x-3 px-8 py-4 border-2 border-white text-white rounded-2xl hover:bg-white/10 transition-colors font-bold text-lg"
            >
              <ClipboardList className="w-6 h-6" />
              <span>See the claims on trial</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
