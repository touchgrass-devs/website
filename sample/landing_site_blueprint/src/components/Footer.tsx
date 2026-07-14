import { Terminal, Shield, ArrowUp } from "lucide-react";

export default function Footer() {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-luxury-border relative overflow-hidden">
      {/* Subtle bottom glows */}
      <div className="absolute bottom-[-20%] right-[10%] w-[350px] h-[350px] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-[-25%] left-[10%] w-[350px] h-[350px] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      {/* Main Footer Matrix */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-16 border-b border-luxury-border">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-6">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-sage-950 flex items-center justify-center border border-sage-800">
                <Terminal className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-mono text-sm tracking-[0.25em] text-sage-900 font-bold uppercase">
                touchgrass<span className="text-gold-accent">.DEVS</span>
              </span>
            </a>
            <p className="text-xs text-sage-600 font-light leading-relaxed max-w-sm">
              We design and develop modern, high-performance websites and browser applications that combine exceptional user experience with bulletproof engineering.
            </p>
            {/* Status dot */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sage-50 border border-luxury-border">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider text-sage-700 uppercase font-semibold">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Services Portfolio", href: "#services" },
                { name: "Tech Expertise", href: "#tech-stack" },
                { name: "Work Philosophy", href: "#philosophy" },
                { name: "Commission Brief", href: "#contact" }
              ].map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href} 
                    className="text-xs text-sage-600 hover:text-grass-accent hover:font-medium transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech focus */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
              CORE ARCHITECTURE
            </h4>
            <ul className="space-y-2.5 text-xs text-sage-600 font-light">
              <li>React / Next.js</li>
              <li>Tailwind Design</li>
              <li>Cloud Databases</li>
              <li>OpenAI & Gemini API</li>
            </ul>
          </div>

          {/* Legal / Dev notes */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
              SECURITY
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-sage-700 font-semibold">
              <Shield className="w-3.5 h-3.5 text-gold-accent" />
              <span>AES-256 Encrypted</span>
            </div>
            <p className="text-[10px] text-sage-500 font-light leading-relaxed">
              All interactions inside our client portal environment are secured and cached strictly client-side.
            </p>
          </div>

        </div>

        {/* Bottom Col */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-mono text-sage-500 tracking-wide text-center sm:text-left">
            © 2026 touchgrass.DEVS. All rights reserved. Designed & Engineered with absolute care.
          </div>
          
          <button
            onClick={handleScrollTop}
            className="flex items-center justify-center p-2.5 rounded-lg bg-sage-50 hover:bg-sage-100 border border-luxury-border hover:border-gold-accent/40 text-sage-600 hover:text-sage-950 transition-all cursor-pointer group shadow-sm"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </footer>
  );
}
