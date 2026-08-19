import Header from './components/Header';
import Hero from './components/Hero';
import Theory from './components/Theory';
import SystemLayout from './components/SystemLayout';
import BuildGuide from './components/BuildGuide';
import Performance from './components/Performance';
import Safety from './components/Safety';
import FutureProofing from './components/FutureProofing';
import OpenSource from './components/OpenSource';
import ROI from './components/ROI';
import Demo from './components/Demo';
import EnergyFlow from './components/EnergyFlow';
import Configurator from './components/Configurator';
import Hybrid from './components/Hybrid';
import WhyNoTurbine from './components/WhyNoTurbine';
import OnTrial from './components/OnTrial';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Theory />
      <SystemLayout />
      <Demo />
      <EnergyFlow />
      <BuildGuide />
      <Configurator />
      <Hybrid />
      <WhyNoTurbine />
      <Performance />
      <ROI />
      <Safety />
      <OnTrial />
      <FutureProofing />
      <OpenSource />
      <Footer />
    </div>
  );
}

export default App;