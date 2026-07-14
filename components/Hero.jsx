'use client';

import { motion } from 'framer-motion';
import HeroDotGrid from './HeroDotGrid';

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.15,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 md:px-12 bg-luxury-bg overflow-hidden"
    >
      {/* Light subtle warm gradients */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[50%] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[40%] h-[40%] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      {/* Hero outer frame */}
      <div className="w-full max-w-7xl mx-auto rounded-[32px] bg-white border border-luxury-border shadow-sm relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-16 min-h-[85vh]">
        {/* Interactive dot field, sampled from the reference image — hover to see it react */}
        <div className="absolute inset-0 z-0">
          <HeroDotGrid
            src="/hero/creation-hands.jpeg"
            className="w-full h-full block"
          />
        </div>

        {/* Empty spacing for top symmetry matching header */}
        <div className="hidden sm:block h-6" />

        {/* Main central content area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center justify-center text-center my-auto max-w-3xl mx-auto px-2 pointer-events-none"
        >
          <motion.h1
            variants={childVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-sans tracking-tight text-sage-900 leading-[1.1]"
          >
            <span className="font-light text-sage-500 block mb-2">Clean Engineering,</span>
            <span className="font-bold italic block text-sage-950 pb-1">Modern Design</span>
          </motion.h1>

          <motion.p
            variants={childVariants}
            className="mt-6 text-sm sm:text-base text-sage-600 font-light leading-relaxed max-w-xl"
          >
            We&rsquo;re a four-person team building polished marketing sites, powerful web
            applications, and AI-driven workflows — fast, reliable, and genuinely enjoyable to use.
          </motion.p>

          <motion.div variants={childVariants} className="mt-8 pointer-events-auto">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-sage-950 hover:bg-grass-accent text-white font-sans text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start a Project
            </a>
          </motion.div>
        </motion.div>

        {/* Footnote row */}
        <div className="relative z-10 border-t border-luxury-border/60 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-sage-500 select-none pointer-events-none">
          <div className="w-full sm:w-1/3 text-center sm:text-left">
            Touch grass. Then build something great.
          </div>

          <div className="w-full sm:w-1/3 text-center max-w-xs leading-normal">
            A quiet space for software craftsmanship, bespoke interfaces, and dependable engineering. No noise. Just premium execution.
          </div>

          <div className="w-full sm:w-1/3 text-center sm:text-right flex items-center justify-center sm:justify-end gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-grass-accent transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            >
              Scroll to Explore
              <svg
                className="w-3 h-3 text-gold-accent"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M19 12l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
