'use client';

import { motion } from 'framer-motion';
import { Code, Database, Sparkle, Wrench } from '@phosphor-icons/react';
import MacDock from './MacDock';

// Categories fold in the two capabilities that have no brand logo of their own
// (REST API integration, workflow automation) into the AI & Automation blurb,
// rather than faking a logo for something that isn't a product.
const CATEGORIES = [
  {
    title: 'Frontend Engineering',
    icon: Code,
    description: 'Fast, responsive interfaces with considered motion — built to feel premium, not templated.',
  },
  {
    title: 'Backend & Cloud',
    icon: Database,
    description: 'Scalable services and managed cloud data that stay dependable as usage grows.',
  },
  {
    title: 'AI & Automation',
    icon: Sparkle,
    description: 'Model APIs and automated workflows that cut repetitive work and connect the tools you rely on.',
  },
  {
    title: 'Tools & Delivery',
    icon: Wrench,
    description: 'Version control, design handoff, and deployment pipelines that keep every release smooth.',
  },
];

export default function Expertise() {
  return (
    <section
      id="expertise"
      className="relative py-24 md:py-32 bg-luxury-bg overflow-hidden scroll-mt-24"
    >
      {/* Ambient orbs, matching the hero/tech-stack motif elsewhere on the page */}
      <div className="absolute top-[10%] right-[-12%] w-[420px] h-[420px] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[460px] h-[460px] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        {/* Section header — no eyebrow here (Services already spent the page's one) */}
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans tracking-tight text-sage-950 leading-[1.1]">
            <span className="font-light text-sage-500 block mb-1">Depth across the stack,</span>
            <span className="font-bold italic block pb-1">not just the surface.</span>
          </h2>
          <p className="mt-6 text-xs md:text-sm text-sage-600 font-light max-w-xl leading-relaxed">
            Four disciplines, one team — frontend craft, cloud systems, AI integration, and the
            tools that keep every release shipping smoothly.
          </p>
        </div>

        {/* Capability breakdown: divided columns, not cards — keeps this section
            visually distinct from the Services carousel above it. */}
        <div className="mt-14 md:mt-16 grid grid-cols-1 md:grid-cols-4 divide-y divide-luxury-border md:divide-y-0 md:divide-x">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group py-8 first:pt-0 md:py-0 md:px-8 md:first:pl-0"
              >
                <div className="w-10 h-10 rounded-xl bg-sage-50 border border-luxury-border flex items-center justify-center text-sage-900 transition-all duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-sage-950 group-hover:text-white">
                  <Icon size={18} weight="duotone" />
                </div>
                <h3 className="mt-5 font-sans text-sm font-bold text-sage-950 tracking-tight">
                  {cat.title}
                </h3>
                <p className="mt-2 text-xs text-sage-500 font-light leading-relaxed">
                  {cat.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Premium interactive macOS Dock Stack — ported from the "kay" project's
            Expertise section in full, replacing the earlier TechMarquee treatment. */}
        <MacDock />
      </div>
    </section>
  );
}
