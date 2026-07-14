import { motion } from "motion/react";
import { Cpu, Server, Sparkles, Sliders, ChevronRight } from "lucide-react";
import { TECH_STACK } from "../data";

export default function TechStack() {
  const categories = [
    {
      id: "frontend",
      title: "Frontend Engineering",
      icon: Cpu,
      accent: "text-emerald-600",
      description: "Delivering modern, responsive interfaces built with pixel perfection, interactive motion arrays, and responsive fluidity."
    },
    {
      id: "backend",
      title: "Backend & Cloud Systems",
      icon: Server,
      accent: "text-gold-accent",
      description: "Scalable backend services, cloud storage pipelines, real-time sync systems, and stable database architectures."
    },
    {
      id: "ai",
      title: "AI & Smart Automation",
      icon: Sparkles,
      accent: "text-teal-600",
      description: "Integrating high-level cognitive endpoints, semantic data nodes, automated processes, and dynamic model pipelines."
    },
    {
      id: "tools",
      title: "Deployments & Toolsets",
      icon: Sliders,
      accent: "text-sage-500",
      description: "Professional version control flows, interactive Figma asset mapping, and high-performance serverless deployments."
    }
  ];

  return (
    <section 
      id="tech-stack" 
      className="py-24 md:py-32 bg-luxury-bg relative overflow-hidden border-t border-luxury-border"
    >
      {/* Subtle light background ambient glows */}
      <div className="absolute top-[40%] right-[-10%] w-[450px] h-[450px] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
            <span className="text-xs font-mono tracking-[0.3em] text-gold-accent uppercase font-bold">
              TECHNOLOGY STACK
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans tracking-tight text-sage-950 leading-tight mb-6">
            Elite modern technologies, <br />
            <span className="text-sage-500 font-display italic font-light">for uncompromising performance.</span>
          </h2>
          <p className="text-xs md:text-sm text-sage-600 font-light max-w-xl leading-relaxed">
            We use stable, industry-proven frameworks and modern micro-services that enable seamless scaling, advanced security, and high performance.
          </p>
        </div>

        {/* Structured Grid Layout for Tech Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon;
            const items = TECH_STACK.filter((tech) => tech.category === cat.id);

            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                key={cat.id}
                className="bg-white rounded-3xl p-8 md:p-10 border border-luxury-border shadow-sm hover:border-gold-accent/30 transition-all duration-400 flex flex-col justify-between group"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center border border-luxury-border text-sage-900 group-hover:bg-sage-950 group-hover:text-white transition-all duration-400">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-sage-400 tracking-widest uppercase font-bold block">
                        STACK CORE 0{idx + 1}
                      </span>
                      <h3 className="font-sans text-xs font-bold text-sage-900 tracking-wide uppercase">
                        {cat.title}
                      </h3>
                    </div>
                  </div>

                  {/* Category Description */}
                  <p className="text-xs md:text-sm text-sage-600 font-light leading-relaxed mb-8">
                    {cat.description}
                  </p>
                </div>

                {/* Tech Pills Matrix */}
                <div>
                  <div className="h-[1px] w-full bg-luxury-border mb-6" />
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-50 border border-luxury-border text-xs text-sage-700 font-mono tracking-wide hover:text-sage-950 hover:bg-white hover:border-gold-accent/40 transition-all duration-300 cursor-default select-none"
                      >
                        <ChevronRight className="w-3 h-3 text-gold-accent shrink-0" />
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
