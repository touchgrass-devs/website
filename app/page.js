import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Expertise from '@/components/Expertise';
import Philosophy from '@/components/Philosophy';

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Expertise />
      <Philosophy />
      {/* TEMP: scroll-lock test spacer, remove once Philosophy pin is finalized */}
      <section className="h-screen bg-white border-t border-luxury-border" />
    </main>
  );
}
