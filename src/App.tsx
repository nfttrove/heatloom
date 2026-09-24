import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BuildGuide from './components/BuildGuide';
import Calculator from './components/Calculator';
import Safety from './components/Safety';
import OurNumbers from './components/OurNumbers';
import OpenSource from './components/OpenSource';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <HowItWorks />
      <BuildGuide />
      <Calculator />
      <Safety />
      <OurNumbers />
      <OpenSource />
      <Footer />
    </div>
  );
}

export default App;
