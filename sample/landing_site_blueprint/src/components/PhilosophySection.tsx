import { motion } from "motion/react";
import { Trees, Zap, CircleDollarSign } from "lucide-react";
import { PHILOSOPHY } from "../data";

const iconMap = [Trees, Zap, CircleDollarSign];

export default function PhilosophySection() {
  return (
    <section 
      id="philosophy" 
      className="py-24 md:py-32 bg-white relative overflow-hidden border-t border-luxury-border"
    >
      {/* Light subtle visual gradients */}
      <div className="absolute top-[30%] left-[5%] w-[400px] h-[400px] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Intro Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20 md:mb-28">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
              <span className="text-xs font-mono tracking-[0.3em] text-gold-accent uppercase font-bold">
                OUR PHILOSOPHY
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-sage-950 leading-tight">
              Why touchgrass<span className="text-gold-accent">.DEVS</span>?
            </h2>
            <p className="mt-6 text-xs sm:text-sm md:text-base text-sage-600 font-light leading-relaxed max-w-xl">
              "Touch grass" is a reminder to ground digital products in real human connection and tactile simplicity. We replace over-engineered complexity and over-stimulated noise with clean, honest software that serves business goals, runs blazing fast, and looks stunning.
            </p>
          </div>
          <div className="lg:col-span-5 flex justify-start lg:justify-end">
            <div className="relative p-8 rounded-3xl border border-luxury-border bg-sage-50 shadow-sm max-w-sm">
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-2xl bg-sage-950 text-white flex items-center justify-center font-mono font-bold text-lg border border-sage-800 shadow-md">
                ”
              </div>
              <p className="text-xs sm:text-sm text-sage-800 italic font-light leading-relaxed pl-4">
                We believe in stripping away the excess to deliver high-contrast, beautiful digital craftsmanship that performs reliably without the unnecessary digital fatigue.
              </p>
              <div className="mt-4 pl-4 flex items-center gap-2">
                <div className="w-6 h-[1px] bg-gold-accent" />
                <span className="text-[9px] font-mono tracking-widest text-gold-accent uppercase font-bold">
                  Core Mandate
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PHILOSOPHY.map((item, idx) => {
            const IconComponent = iconMap[idx];

            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                key={idx}
                className="p-8 rounded-2xl border border-luxury-border bg-sage-50/50 hover:bg-sage-50 hover:border-gold-accent/30 transition-all duration-400 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-luxury-border text-sage-900 mb-6 group-hover:bg-sage-950 group-hover:text-white transition-all duration-400">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-sans font-bold text-sage-900 tracking-wide uppercase mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-sage-600 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center gap-1 text-[9px] font-mono text-gold-accent tracking-wider uppercase font-bold group-hover:translate-x-1.5 transition-transform">
                  <span>Standard of Exec</span>
                  <span className="text-xs">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
