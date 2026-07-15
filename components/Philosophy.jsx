'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hammer, Gauge, Coins } from '@phosphor-icons/react';
import PhilosophyCardStack, { StackCard } from './PhilosophyCardStack';

// The physics/WebGL badge is heavy (react-three-fiber + rapier's WASM
// module touches `window`/`document` on import) - it must never run during
// SSR, so it's loaded client-only via next/dynamic rather than a plain
// import at the top of this file.
const LanyardBadge = dynamic(() => import('./LanyardBadge'), { ssr: false });

const PILLARS = [
  {
    tag: 'Craft',
    icon: Hammer,
    title: 'Absolute Craftsmanship',
    body: 'No generic presets, no template shortcuts. Every curve, transition, and breakpoint is deliberate, built to hold up under real use, not just a first screenshot.',
  },
  {
    tag: 'Performance',
    icon: Gauge,
    title: 'Pragmatic Engineering',
    body: 'Exceptional design is wasted without speed. We build on lean foundations, engineered for 95+ Lighthouse scores and load times nobody has to wait through.',
  },
  {
    tag: 'Pricing',
    icon: Coins,
    title: 'Literal, Honest Pricing',
    body: 'No hidden agency markups, no buzzwords to inflate an invoice. Transparent, milestone-based pricing tied directly to what the work is actually worth to you.',
  },
];

// Scroll distance allotted per swap, in pixels - tunable. Two swaps (3
// cards) means the sticky scene holds through 2x this distance.
const STEP_PX = 480;

function PillarFace({ pillar, index }) {
  const Icon = pillar.icon;
  return (
    <div className="flex h-full flex-col p-7 md:p-8">
      {/* small window-chrome header - a nod to the card-stack reference's
          own minimal browser-chrome treatment, restyled to our palette */}
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-luxury-border">
        <span className="w-1.5 h-1.5 rounded-full bg-grass-accent" />
        <Icon size={13} weight="bold" className="text-sage-500" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-sage-500">{pillar.tag}</span>
      </div>
      <span className="font-mono text-4xl text-sage-200 leading-none select-none">
        {String(index + 1).padStart(2, '0')}
      </span>
      <h3 className="mt-3 font-sans text-lg md:text-xl font-bold text-sage-950 tracking-tight">{pillar.title}</h3>
      <p className="mt-3 text-xs md:text-sm text-sage-600 font-light leading-relaxed">{pillar.body}</p>
    </div>
  );
}

export default function Philosophy() {
  const reduce = useReducedMotion();
  const trackRef = useRef(null);
  const stackRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const pinned = isDesktop && !reduce;

  // Reveal each pillar as the visitor scrolls through the scene - desktop
  // only. Below `lg` (and under prefers-reduced-motion) the section renders
  // as a plain stacked list instead; see the mobile fallback below.
  //
  // **No GSAP `pin: true` anymore.** The first two passes at this used a
  // GSAP-managed pin (a JS-driven binary "pinned/not pinned" flip), and
  // testing kept coming back that the moment the pin engaged/disengaged felt
  // like a hard grab rather than a smooth transition - inherent to how pin
  // works: it's a discrete state flip the instant scroll crosses a
  // threshold, and combined with Lenis's eased scroll (which can deliver a
  // larger position delta right as you cross that threshold), that flip can
  // land as a visible jolt no amount of tuning `anticipatePin` fully
  // resolves. Native CSS `position: sticky` doesn't have that problem -
  // there's no discrete "pinned" event at all, the browser's own compositor
  // continuously recomputes the sticky offset every frame in response to
  // scrollTop, exactly like any other sticky element. `trackRef` (this
  // section's scroll track) holds the sticky visual plus a trailing spacer
  // sized to `totalDistance`; GSAP now does only one job here - reading
  // scroll progress through that track via `onUpdate` and calling
  // `advance()`/`retreat()` - it no longer touches layout/position at all.
  useEffect(() => {
    if (reduce || !isDesktop || !trackRef.current) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const el = trackRef.current;
      const steps = PILLARS.length - 1;
      const totalDistance = steps * STEP_PX;
      const stepRef = { current: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: `+=${totalDistance}`,
        onUpdate: (self) => {
          const target = Math.round(self.progress * steps);
          while (stepRef.current < target) {
            stackRef.current?.advance();
            stepRef.current += 1;
          }
          while (stepRef.current > target) {
            stackRef.current?.retreat();
            stepRef.current -= 1;
          }
          setActiveIndex(target);
        },
      });
    }, trackRef);

    return () => ctx.revert();
  }, [reduce, isDesktop]);

  return (
    <section id="philosophy" className="relative bg-white border-t border-luxury-border scroll-mt-24">
      {/* `overflow-hidden` used to live on the section itself, to clip these
          orbs - but `position: sticky` breaks under ANY ancestor with
          non-visible overflow, even one that isn't the actual scroll
          container. Scoped the clip to just this absolutely-positioned
          wrapper instead, so the sticky scene below is a clean sibling with
          no clipping ancestor between it and the page. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[15%] left-[-10%] w-[420px] h-[420px] rounded-full bg-gold-accent/5 premium-blur-orb"
          animate={reduce ? {} : { x: [0, 26, -10, 0], y: [0, -18, 12, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[5%] right-[-8%] w-[460px] h-[460px] rounded-full bg-grass-accent/5 premium-blur-orb"
          animate={reduce ? {} : { x: [0, -22, 14, 0], y: [0, 16, -10, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10 py-24 md:py-28">
        {/* Header - no eyebrow (Services already spent the page's one) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans tracking-tight text-sage-950 leading-[1.1]">
            <span className="font-light text-sage-500 block mb-1">Before the pixels,</span>
            <span className="font-bold italic block pb-1">the ground rules.</span>
          </h2>
          <p className="mt-6 text-xs md:text-sm text-sage-600 font-light max-w-xl leading-relaxed">
            Three commitments run underneath everything we build.{' '}
            {pinned ? 'Keep scrolling to go through them.' : 'No exceptions, no fine print, regardless of project size.'}
          </p>
        </motion.div>

        {/* Scroll track - trigger/target for GSAP's progress-only
            ScrollTrigger. Header above and the closing quote below both live
            outside this ref, so they scroll normally before/after. The
            sticky visual is the direct child here; the spacer sibling right
            after it is what gives the sticky element room to "hold" through
            `totalDistance` of extra scroll - same idea as a GSAP pin-spacer,
            just native. */}
        <div ref={trackRef} className="mt-14 md:mt-16 relative">
          <div className="lg:sticky lg:top-0 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-6 lg:min-h-[640px]">
            <div className="order-2 lg:order-1 h-[320px] sm:h-[380px] lg:h-[560px]">
              <LanyardBadge activeIndex={activeIndex} />
            </div>

            <div className="order-1 lg:order-2 flex items-center justify-center">
              {pinned ? (
                <PhilosophyCardStack ref={stackRef} width={340} height={420} reduce={!!reduce}>
                  {PILLARS.map((pillar, i) => (
                    <StackCard key={pillar.title}>
                      <PillarFace pillar={pillar} index={i} />
                    </StackCard>
                  ))}
                </PhilosophyCardStack>
              ) : (
                <div className="w-full flex flex-col gap-5">
                  {PILLARS.map((pillar, i) => (
                    <motion.div
                      key={pillar.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-[24px] border border-luxury-border bg-white shadow-sm"
                    >
                      <PillarFace pillar={pillar} index={i} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {pinned && <div aria-hidden style={{ height: (PILLARS.length - 1) * STEP_PX }} />}
        </div>

        {/* Closing statement - straight from the team's own about copy */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 md:mt-20 text-center text-lg sm:text-xl md:text-2xl font-sans italic font-light text-sage-800 leading-relaxed max-w-3xl mx-auto pb-1"
        >
          Great software is not just functional. It&rsquo;s intuitive, refined, and built to
          last.
        </motion.p>
      </div>
    </section>
  );
}
