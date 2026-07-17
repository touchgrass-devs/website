'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
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

// Each headline line reveals with a mask/wipe (translate inside an
// overflow-hidden strip) rather than a plain fade, for a more cinematic entrance.
const lineVariants = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

// Layering (bottom to top):
//   1. The white card — a normal, margined/rounded box (matches the reference
//      framing), given NO z-index utility of its own. That's deliberate: an
//      element only traps its descendants' z-index inside it if it sets an
//      explicit z-index itself. Leaving it at the browser default (auto)
//      means its own background paints in the default stack position, but
//      anything inside it that DOES set a z-index (the content block below)
//      still competes directly against this section's other children.
//   2. The dotted asset — a direct child of <section> (not nested in the
//      card), sized with absolute inset-0 against this full-width, un-padded
//      section so it reaches the true window edges. Explicit z-10, so it
//      paints above the card's plain white background — the dots show ON
//      TOP of the white, across the whole hero, not hidden under it.
//   3. The hero content — nested inside the card (for layout/alignment), but
//      z-20 lets it break out above the dots despite that nesting. Carries
//      pointer-events-none so hover reaches the dots underneath everywhere
//      text isn't; only the CTA link and scroll button re-enable
//      pointer-events-auto.
export default function Hero() {
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();

  // Routes in-page navigation through Lenis (`window.__lenis`) instead of
  // native/CSS smooth scroll - see Navbar.jsx's `scrollToHash` for the full
  // rationale (globals.css's old page-wide `scroll-behavior: smooth` used
  // to double up with Lenis's own scroll loop). `offset: -96` mirrors the
  // `scroll-mt-24` every section (including Contact) already carries, so
  // links still land below the fixed nav exactly as before.
  const scrollToHash = (hash) => (e) => {
    const id = hash.replace('#', '');
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.scrollTo(target, { offset: -96, duration: reduce ? 0 : 1.1 });
    } else {
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  // Background drifts slightly slower than the scroll itself while the hero
  // is in view — a subtle parallax that adds depth into the handoff to the
  // next section. Range collapses to 0 under prefers-reduced-motion.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const dotGridY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -60]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center pt-32 pb-24 px-6 sm:px-10 md:px-16 overflow-hidden"
    >
      {/* Light subtle warm gradients */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[50%] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[40%] h-[40%] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      {/* Dotted asset: sized to the section itself (window edge to window
          edge), not the card below, and explicitly above the card's white
          background (z-10 vs. the card's auto). */}
      <motion.div className="absolute inset-0 z-10" style={{ y: dotGridY }}>
        <HeroDotGrid src="/hero/creation-hands.jpeg" className="w-full h-full block" />
      </motion.div>

      {/* Hero card: plain white, margined, rounded — matches the reference
          framing. No z-index here on purpose (see note above). */}
      <div className="relative w-full max-w-7xl mx-auto rounded-[32px] bg-white border border-luxury-border shadow-sm flex flex-col justify-between p-6 sm:p-10 md:p-16 min-h-[70vh]">
        {/* Empty spacing for top symmetry matching header */}
        <div className="hidden sm:block h-6" />

        {/* Main central content area — z-20 breaks it out above the dots. */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-20 flex flex-col items-center justify-center text-center my-auto max-w-3xl mx-auto px-2 pointer-events-none"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans tracking-tight text-sage-900 leading-[1.1]">
            <span className="block overflow-hidden">
              <motion.span variants={lineVariants} className="font-light text-sage-500 block mb-2">
                Clean Engineering,
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={lineVariants} className="font-bold italic block text-sage-950 pb-1">
                Modern Design
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={childVariants}
            className="mt-6 text-sm sm:text-base text-sage-600 font-light leading-relaxed max-w-xl"
          >
            We&rsquo;re a four-person team building polished marketing sites, powerful web
            applications, and AI-driven workflows — fast, reliable, and genuinely enjoyable to use.
          </motion.p>

          <motion.div variants={childVariants} className="mt-8 pointer-events-auto">
            <motion.a
              href="#contact"
              onClick={scrollToHash('#contact')}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-sage-950 hover:bg-grass-accent text-white font-sans text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-colors duration-300"
            >
              Start a Project
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Footnote row — same z-20 breakout as the content block above. */}
        <div className="relative z-20 border-t border-luxury-border/60 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-sage-500 select-none pointer-events-none">
          <div className="w-full sm:w-1/3 text-center sm:text-left">
            Touch grass. Then build something great.
          </div>

          <div className="w-full sm:w-1/3 text-center max-w-xs leading-normal">
            A quiet space for software craftsmanship, bespoke interfaces, and dependable engineering. No noise. Just premium execution.
          </div>

          <div className="w-full sm:w-1/3 text-center sm:text-right flex items-center justify-center sm:justify-end gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={scrollToHash('#services')}
              className="hover:text-grass-accent transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            >
              Scroll to Explore
              <motion.svg
                animate={reduce ? {} : { y: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
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
              </motion.svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
