import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Cpu, Sparkles, ShieldCheck, ArrowRight, CornerDownRight } from "lucide-react";
import { SERVICES } from "../data";

const iconMap: Record<string, any> = {
  Compass: Compass,
  Cpu: Cpu,
  Sparkles: Sparkles,
  ShieldCheck: ShieldCheck,
};

export default function Services() {
  const [activeCategory, setActiveCategory] = useState(SERVICES[0].id);

  return (
    <section 
      id="services" 
      className="py-24 md:py-32 bg-white relative overflow-hidden border-t border-luxury-border"
    >
      {/* Light subtle visual gradients */}
      <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Title Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
              <span className="text-xs font-mono tracking-[0.3em] text-gold-accent uppercase font-bold">
                OUR SERVICES
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans tracking-tight text-sage-950 leading-tight">
              A bespoke suite of solutions, <br />
              <span className="text-sage-500 font-display italic font-light">engineered to absolute perfection.</span>
            </h2>
          </div>
          <p className="text-xs md:text-sm text-sage-600 font-light max-w-sm leading-relaxed">
            We focus on absolute quality, robust technical performance, and highly refined interactions. No shortcuts, no compromises.
          </p>
        </div>

        {/* Interactive Premium Split Selector Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Menu Selector */}
          <div className="lg:col-span-5 space-y-3.5">
            {SERVICES.map((srv, idx) => {
              const IconComp = iconMap[srv.iconName];
              const isSelected = srv.id === activeCategory;

              return (
                <button
                  key={srv.id}
                  onClick={() => setActiveCategory(srv.id)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all duration-400 flex items-start gap-5 group cursor-pointer ${
                    isSelected
                      ? "bg-sage-50 border-luxury-border shadow-sm"
                      : "bg-transparent border-luxury-border/50 hover:border-luxury-border hover:bg-sage-50/50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-400 shrink-0 ${
                      isSelected
                        ? "bg-sage-950 text-white border-sage-950"
                        : "bg-white text-sage-600 border-luxury-border group-hover:border-sage-400 group-hover:text-sage-950"
                    }`}
                  >
                    {IconComp && <IconComp className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-gold-accent tracking-widest uppercase font-bold">
                      MODULE 0{idx + 1}
                    </span>
                    <h3
                      className={`font-sans text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                        isSelected ? "text-sage-950" : "text-sage-700 group-hover:text-sage-950"
                      }`}
                    >
                      {srv.title}
                    </h3>
                    <p className="text-xs text-sage-500 line-clamp-1 font-light leading-relaxed">
                      {srv.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Dynamic Detail Display Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {SERVICES.map((srv) => {
                if (srv.id !== activeCategory) return null;
                const IconComp = iconMap[srv.iconName];

                return (
                  <motion.div
                    key={srv.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white rounded-3xl p-8 md:p-12 border border-luxury-border shadow-sm relative overflow-hidden group/detail"
                  >
                    <div className="space-y-8 relative z-10">
                      {/* Badge and Tagline */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-[0.25em] text-grass-accent font-bold uppercase bg-grass-accent/5 px-3 py-1 rounded border border-grass-accent/10">
                          OFFERING SPEC
                        </span>
                        {IconComp && <IconComp className="w-5 h-5 text-gold-accent" />}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-2xl sm:text-3xl font-sans font-bold text-sage-950 tracking-tight leading-tight">
                          {srv.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-sage-600 leading-relaxed font-light">
                          {srv.description}
                        </p>
                      </div>

                      {/* Divider line */}
                      <div className="h-[1px] w-full bg-gradient-to-r from-luxury-border to-transparent" />

                      {/* Sub services Grid */}
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
                          COMPONENTS & CAPABILITIES
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {srv.subServices.map((sub, sIdx) => (
                            <div 
                              key={sIdx} 
                              className="group/sub p-4 rounded-xl hover:bg-sage-50 border border-transparent hover:border-luxury-border/40 transition-all duration-300 flex gap-3.5"
                            >
                              <div className="mt-0.5 shrink-0">
                                <CornerDownRight className="w-3.5 h-3.5 text-gold-accent group-hover/sub:translate-x-1 transition-transform" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="font-sans text-xs font-bold text-sage-900 uppercase tracking-wider group-hover/sub:text-grass-accent transition-colors">
                                  {sub.title}
                                </h5>
                                <p className="text-xs text-sage-500 leading-relaxed font-light">
                                  {sub.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-luxury-border">
                        <span className="text-[10px] font-mono text-sage-400 uppercase tracking-wider">
                          DEPLOYMENT TIMELINE: ~2-6 WEEKS
                        </span>
                        <a 
                          href="#contact" 
                          className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-wider text-grass-accent hover:text-gold-accent uppercase transition-colors"
                        >
                          Book this service
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
