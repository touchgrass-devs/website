import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import TechStack from "./components/TechStack";
import PhilosophySection from "./components/PhilosophySection";
import InquirySection from "./components/InquirySection";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="relative min-h-screen bg-luxury-bg text-sage-900 font-sans selection:bg-gold-accent/20 selection:text-sage-950 overflow-x-hidden antialiased">
      {/* Cinematic subtle grid backdrop for light theme */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0" />
      
      {/* Floating Header */}
      <Navbar />

      {/* Main Sections Stack */}
      <main className="relative z-10">
        <Hero />
        <Services />
        <TechStack />
        <PhilosophySection />
        <InquirySection />
      </main>

      {/* Footnote and contact parameters */}
      <Footer />
    </div>
  );
}
