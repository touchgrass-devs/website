'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Code, Database, Sparkle, Wrench } from '@phosphor-icons/react';

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

// Real brand marks via Simple Icons' CDN (returns each logo in its own brand
// color) so the loop reads as genuine tool recognition, not invented glyphs.
// OpenAI is the one exception — it was delisted from Simple Icons over a
// trademark dispute, so that single mark is served via Iconify instead.
const LOGOS = [
  { name: 'React', src: 'https://cdn.simpleicons.org/react' },
  { name: 'Next.js', src: 'https://cdn.simpleicons.org/nextdotjs' },
  { name: 'JavaScript', src: 'https://cdn.simpleicons.org/javascript' },
  { name: 'HTML5', src: 'https://cdn.simpleicons.org/html5' },
  { name: 'CSS3', src: 'https://cdn.simpleicons.org/css' },
  { name: 'Tailwind CSS', src: 'https://cdn.simpleicons.org/tailwindcss' },
  { name: 'GSAP', src: 'https://cdn.simpleicons.org/greensock' },
  { name: 'Three.js', src: 'https://cdn.simpleicons.org/threedotjs' },
  { name: 'Node.js', src: 'https://cdn.simpleicons.org/nodedotjs' },
  { name: 'Express.js', src: 'https://cdn.simpleicons.org/express' },
  { name: 'Firebase', src: 'https://cdn.simpleicons.org/firebase' },
  { name: 'Supabase', src: 'https://cdn.simpleicons.org/supabase' },
  { name: 'MySQL', src: 'https://cdn.simpleicons.org/mysql' },
  { name: 'OpenAI', src: 'https://api.iconify.design/simple-icons/openai.svg?color=%23000000' },
  { name: 'Anthropic', src: 'https://cdn.simpleicons.org/anthropic' },
  { name: 'Google Gemini', src: 'https://cdn.simpleicons.org/googlegemini' },
  { name: 'Git', src: 'https://cdn.simpleicons.org/git' },
  { name: 'GitHub', src: 'https://cdn.simpleicons.org/github' },
  { name: 'Figma', src: 'https://cdn.simpleicons.org/figma' },
  { name: 'Vercel', src: 'https://cdn.simpleicons.org/vercel' },
  { name: 'Netlify', src: 'https://cdn.simpleicons.org/netlify' },
];

function LogoLoop() {
  const reduce = useReducedMotion();
  // Two copies back-to-back; the track animates exactly -50% for a seamless loop.
  const track = [...LOGOS, ...LOGOS];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-14 md:mt-16"
    >
      {/* Edge fade so logos dissolve in/out rather than hard-cutting.
          Extra top padding (vs. a symmetric py-3) reserves room for the
          hover label so it isn't clipped by this element's own overflow-hidden. */}
      <div
        className="logo-loop-mask overflow-hidden pt-9 pb-3"
      >
        <span className="sr-only">
          Technologies we work with: {LOGOS.map((l) => l.name).join(', ')}.
        </span>
        <div
          aria-hidden="true"
          className={`logo-loop-track flex items-center w-max gap-14 sm:gap-16 md:gap-20 ${
            reduce ? '' : 'animate-logo-loop'
          }`}
        >
          {track.map((logo, i) => (
            <div key={`${logo.name}-${i}`} className="group/logo relative shrink-0 flex items-center justify-center">
              {/* Hover label: plain text, no chip/background — same quiet
                  reveal-on-hover treatment used on the collapsed Services cards. */}
              <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap text-[10px] font-mono uppercase tracking-widest text-sage-700 opacity-0 transition-opacity duration-200 ease-out group-hover/logo:opacity-100">
                {logo.name}
              </span>

              <img
                src={logo.src}
                alt=""
                draggable={false}
                className="h-6 sm:h-7 md:h-8 w-auto grayscale opacity-50 transition-all duration-300 ease-out group-hover/logo:grayscale-0 group-hover/logo:opacity-100 group-hover/logo:scale-110"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .logo-loop-mask {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 8%,
            black 92%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            black 8%,
            black 92%,
            transparent
          );
        }
        .animate-logo-loop {
          animation: logo-loop 48s linear infinite;
        }
        @keyframes logo-loop {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </motion.div>
  );
}

export default function Expertise() {
  return (
    <section
      id="expertise"
      className="relative py-24 md:py-32 bg-luxury-bg border-t border-luxury-border overflow-hidden scroll-mt-24"
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

        {/* Logo loop: the tools behind the categories above */}
        <LogoLoop />
      </div>
    </section>
  );
}
