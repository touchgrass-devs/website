'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Hammer, Gauge, Coins, Eye } from '@phosphor-icons/react';
import PhilosophyDotGrid from './PhilosophyDotGrid';
import PhilosophyDial from './PhilosophyDial';

// Fourth pass on this section's mechanism. The prior radial-dial build (a
// 1640px ring mostly off-screen, 90deg node spacing, GSAP ScrollTrigger
// driving a Framer spring) was replaced wholesale after the user supplied
// the actual working reference implementation instead of just a video -
// this version is a close adaptation of that code, not a fresh design.
// `LanyardBadge.jsx`, `PhilosophyCardStack.jsx` (+ its `.module.css` and
// `StackCard` export) remain orphaned from the swap before that one.
// Node angles must exactly match the dial's rotation extremes below (a node
// sits at the pointer when rotation = -angle) - so widening the sweep means
// widening these too, evenly spaced across the new range. Was -45/-15/15/45
// (90deg total, 30deg apart); now -60/-20/20/60 (120deg total, 40deg apart)
// for a visibly bigger sweep per request.
const PILLARS = [
  {
    tag: 'Craft',
    icon: Hammer,
    angle: -60,
    title: 'Absolute Craftsmanship',
    body: 'No generic presets, no template shortcuts. Every curve, transition, and breakpoint is deliberate, built to hold up under real use, not just a first screenshot.',
  },
  {
    tag: 'Performance',
    icon: Gauge,
    angle: -20,
    title: 'Pragmatic Engineering',
    body: 'Exceptional design is wasted without speed. We build on lean foundations, engineered for 95+ Lighthouse scores and load times nobody has to wait through.',
  },
  {
    tag: 'Pricing',
    icon: Coins,
    angle: 20,
    title: 'Literal, Honest Pricing',
    body: 'No hidden agency markups, no buzzwords to inflate an invoice. Transparent, milestone-based pricing tied directly to what the work is actually worth to you.',
  },
  // Invented per explicit request - not from aboutus.md. Rounds out the
  // other three (build quality / speed / pricing) with a stance on the
  // actual user-facing product, matching the "Mindful UX" direction shown
  // in the reference but written fresh in our own voice.
  {
    tag: 'Experience',
    icon: Eye,
    angle: 60,
    title: 'Deliberate User Experience',
    body: 'Every interaction earns its place. No dark patterns, no attention-farming loops, no clutter dressed up as features - just calm, legible products people actually want to come back to.',
  },
];

export default function Philosophy() {
  const reduce = useReducedMotion();
  const trackRef = useRef(null);
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

  // Pure Framer Motion scroll tracking - no GSAP/ScrollTrigger in this
  // component at all now. `trackRef`'s own height (`h-[340vh]` when pinned)
  // is the scroll runway; `offset: ['start start', 'end end']` maps 0->1
  // across exactly that runway, which is the same "sticky + trailing space"
  // trick used elsewhere on this page, just expressed as one tall element
  // instead of a sticky panel plus a separate spacer sibling. The lock
  // therefore starts the instant `trackRef` engages at the top of the
  // viewport and releases exactly when its bottom clears the viewport
  // bottom - "lock starts when the dial hits bottom, releases at the 1st/
  // 4th pillar" falls out of this structure for free.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 24,
    mass: 1.1,
    restDelta: 0.0001,
  });

  // Dial sweeps an arc (60deg -> -60deg, bumped up from 45/-45 per request
  // for a more visible range of motion), not a full wheel - matches the
  // four fixed node angles above (-60/-20/20/60, 40deg apart, widened to
  // match).
  //
  // Still a 4-stop piecewise map, matching the active-index breakpoints
  // right below (0.3/0.7) so the 1st/4th pillar's node is exactly at the
  // pointer at the moment each becomes "active" - if these two ever drift
  // apart again, the symptom is a pillar reporting "active" before its node
  // has visually reached the pointer (see the dated note further down for
  // the bug this caused once already).
  //
  // The two edge segments are NOT flat, though - `[0,0.3]` goes 68->60 and
  // `[0.7,1]` goes -60->-68, a small 8deg overshoot-and-settle rather than
  // holding one repeated value. A truly flat segment (same value at both
  // ends) never animates at all no matter what easing you throw at it - the
  // dial would sit dead still for that entire 30% of scroll, which is
  // exactly what got reported as "the dial stops rotating, make it keep
  // rotating until the lock is actually released." The overshoot keeps
  // real, visible motion running the whole time scroll is still being
  // consumed (there's still 30% of the track left before the CSS-sticky
  // unlock actually fires) while still landing exactly on each node's true
  // resting angle right when that pillar's "active" window begins/ends -
  // it reads as the dial winding up and settling into place, or spinning a
  // touch past its target before finally coming to rest, rather than
  // freezing solid.
  const dialRotation = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [68, 60, -60, -68]);

  // Breakpoints are deliberately edge-weighted: the 1st and 4th pillar each
  // get 30% of the scroll runway, the two middle ones 20% each. The
  // reference this was ported from did the opposite (edges got only a
  // sixth, middle got a third) - fine for its own un-pinned scroll, but on
  // this pinned/locked section the CSS `position: sticky` unlock is driven
  // by raw scroll position, not by `smoothProgress` (which lags a beat
  // behind raw scroll thanks to the spring above). With only a sixth of the
  // runway allotted to the first/last pillar, the spring barely finished
  // catching up to "this one's active" before raw scroll had already passed
  // the unlock boundary - the lock let go right as the 4th (or 1st, scrolling
  // up) pillar became active, with no time to actually sit on it. Giving the
  // edges the largest share (instead of the smallest) fixes that directly -
  // and now that `dialRotation` above holds flat across these exact same
  // widths, the index and the visual rotation finally agree with each other.
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    let index = 0;
    if (latest < 0.3) index = 0;
    else if (latest < 0.5) index = 1;
    else if (latest < 0.7) index = 2;
    else index = 3;
    setActiveIndex((prev) => (prev !== index ? index : prev));
  });

  // Lets a click on an unfocused dial node jump straight to it - same
  // parentTop/scrollableHeight math as the reference, routed through the
  // site's shared Lenis instance when available so it eases in step with
  // every other scroll on the page instead of fighting Lenis with a plain
  // native `scrollTo`.
  const goToIndex = (index) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const parentTop = rect.top + window.scrollY;
    const parentHeight = rect.height;
    const targetVal = index / (PILLARS.length - 1);
    const scrollableHeight = parentHeight - window.innerHeight;
    const targetY = parentTop + targetVal * scrollableHeight;

    if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.scrollTo(targetY, { duration: reduce ? 0 : 1.1 });
    } else {
      window.scrollTo({ top: targetY, behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  const active = PILLARS[activeIndex] ?? PILLARS[0];

  return (
    <section id="philosophy" className="relative bg-white border-t border-luxury-border scroll-mt-24">
      {/* Interactive dot-grid backdrop - unrelated to this round's redesign,
          kept as-is. See PhilosophyDotGrid.jsx. */}
      <div className="absolute inset-0">
        <PhilosophyDotGrid className="absolute inset-0" reduce={!!reduce} />
      </div>

      {/* `pointer-events-none` here (and re-enabled only on the actual
          interactive pieces below) is what lets hover reach the dot grid
          underneath - same pattern Hero.jsx already uses for its own
          dot-grid layer. Without it, this wrapper's box (inflated to the
          section's full height by the pinned track's `h-[340vh]` child)
          sat directly on top of the whole dot grid at z-10 and silently
          absorbed every pointer event before it could reach the canvas. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10 py-24 md:py-28 pointer-events-none">
        {/* Header - one eyebrow here (Services already used the page's
            other one; two total across five sections is within the
            max-1-per-3 budget). */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
            <span className="text-xs font-mono tracking-[0.3em] text-gold-accent uppercase font-bold">
              Our Philosophy
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans tracking-tight text-sage-950 leading-[1.1]">
            <span className="font-light text-sage-500 block mb-1">Before the pixels,</span>
            <span className="font-bold italic block pb-1">the ground rules.</span>
          </h2>
          <p className="mt-6 text-xs md:text-sm text-sage-600 font-light max-w-xl leading-relaxed">
            Four commitments run underneath everything we build.{' '}
            {pinned ? 'Keep scrolling to turn the dial through them.' : 'No exceptions, no fine print, regardless of project size.'}
          </p>
        </motion.div>

        <div ref={trackRef} className={pinned ? 'mt-14 md:mt-16 relative h-[340vh]' : 'mt-14 md:mt-16 relative'}>
          {pinned ? (
            <div className="sticky top-0 h-screen flex flex-col justify-between overflow-hidden py-10 md:py-14 select-none">
              <div className="max-w-3xl mx-auto text-center min-h-[140px] md:min-h-[160px] flex flex-col justify-center items-center px-6 relative z-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-3"
                  >
                    <span className="text-[11px] font-mono tracking-[0.25em] text-gold-accent uppercase font-bold block">
                      {String(activeIndex + 1).padStart(2, '0')} // {active.tag}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-sage-950">{active.title}</h3>
                    <p className="text-sm md:text-base text-sage-600 font-light leading-relaxed max-w-xl mx-auto">{active.body}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <PhilosophyDial
                pillars={PILLARS}
                activeIndex={activeIndex}
                rotation={dialRotation}
                onSelect={goToIndex}
                reduce={!!reduce}
              />
            </div>
          ) : (
            <div className="w-full flex flex-col gap-5 py-2 pointer-events-auto">
              {PILLARS.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[24px] border border-luxury-border bg-white shadow-sm p-7 md:p-8"
                  >
                    <div className="flex items-center gap-2 pb-4 mb-6 border-b border-luxury-border">
                      <span className="w-1.5 h-1.5 rounded-full bg-grass-accent" />
                      <Icon size={13} weight="bold" className="text-sage-500" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-sage-500">{pillar.tag}</span>
                    </div>
                    <span className="font-mono text-4xl text-sage-200 leading-none select-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-3 font-sans text-lg md:text-xl font-bold text-sage-950 tracking-tight">{pillar.title}</h3>
                    <p className="mt-3 text-xs md:text-sm text-sage-600 font-light leading-relaxed">{pillar.body}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
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
