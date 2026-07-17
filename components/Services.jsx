'use client';

import { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  animate,
} from 'framer-motion';
import { Compass, Cpu, Sparkle, ShieldCheck, CaretRight, CaretLeft } from '@phosphor-icons/react';
import Threads from './Threads';

// Same accent RGB as the carousel's own hover glow / HeroDotGrid, normalized to
// 0-1 for the shader - keeps the background tied to the page's one accent color.
const THREADS_COLOR = [63 / 255, 174 / 255, 106 / 255];

const SERVICES = [
  {
    id: 'immersive-web',
    title: 'Immersive Web Design & Development',
    description:
      'We design and develop modern, high-performance websites that combine exceptional user experience with reliable engineering, tailored to reflect your brand.',
    icon: Compass,
    glow: 'top-right',
    subServices: [
      { title: 'Brand Platforms', detail: 'Professional sites that build credibility and communicate your brand clearly.' },
      { title: 'Interactive UI', detail: 'Smooth animations and micro-interactions, with 3D built in Three.js when it earns its cost.' },
      { title: 'Landing Pages', detail: 'Fast, conversion-focused pages optimized for search and accessibility.' },
      { title: 'Modernization', detail: 'Outdated sites rebuilt clean, responsive, and easy to maintain.' },
    ],
  },
  {
    id: 'web-apps',
    title: 'Web Applications & Client Portals',
    description:
      'We build secure, browser-based applications that simplify business operations and organize data through intuitive interfaces, powered by modern cloud platforms.',
    icon: Cpu,
    glow: 'bottom-left',
    subServices: [
      { title: 'Dashboards', detail: 'Real-time charts and reports that make business data easy to read.' },
      { title: 'Client Portals', detail: 'Private portals for customers or staff to manage accounts and track progress.' },
      { title: 'Admin Panels', detail: 'Custom CMS tools your team can use without touching code.' },
      { title: 'Cloud Data', detail: 'Reliable auth, storage, and sync built on Supabase or Firebase.' },
    ],
  },
  {
    id: 'ai-automation',
    title: 'AI Integration & Workflow Automation',
    description:
      'We integrate modern AI capabilities and automation into your digital products to cut repetitive work and streamline business processes through reliable API-driven solutions.',
    icon: Sparkle,
    glow: 'center',
    subServices: [
      { title: 'AI Assistants', detail: 'Generate emails, reports, and docs using OpenAI, Anthropic, or Gemini.' },
      { title: 'Knowledge Search', detail: 'Searchable knowledge bases that surface answers from your own docs.' },
      { title: 'Automation', detail: 'Automate form processing, notifications, and routine admin work.' },
      { title: 'API Integration', detail: 'Connect Stripe, calendars, CRMs, and other tools you already use.' },
    ],
  },
  {
    id: 'maintenance',
    title: 'Performance, Maintenance & Technical Support',
    description:
      'Launching a product is only the beginning. We provide ongoing improvements and technical support so your website or application keeps performing reliably as you grow.',
    icon: ShieldCheck,
    glow: 'top-left',
    subServices: [
      { title: 'Performance', detail: 'Faster load times and smoother interactions across every device.' },
      { title: 'Enhancements', detail: 'New features shipped as your product and needs keep growing.' },
      { title: 'Bug Fixes', detail: 'Issues resolved fast, with compatibility kept current.' },
      { title: 'Monitoring', detail: 'Analytics and uptime tracking so you always know what is happening.' },
    ],
  },
];

const N = SERVICES.length;
const RADIUS = 400;
const STEP_DEG = 62;
const PX_PER_STEP = 170;
// Grass accent, matches HeroDotGrid's hover color exactly for brand continuity.
const ACCENT_RGB = '63, 174, 106';

const GLOW_POSITION = {
  'top-right': 'top-[-15%] right-[-20%]',
  'bottom-left': 'bottom-[-15%] left-[-20%]',
  'top-left': 'top-[-15%] left-[-20%]',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

function signedOffset(i, active) {
  let diff = i - active;
  if (diff > N / 2) diff -= N;
  if (diff < -N / 2) diff += N;
  return diff;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

// True ring placement: angle is LINEAR in offset (constant angular velocity),
// exactly like a physical dial - this is what makes a drag actually feel like
// spinning a ring instead of an eased slide. Position/scale/depth all fall out
// of one sin/cos of that linear angle. The opposite card (offset 2, the only
// other one when N=4) lands at 2*STEP_DEG - not a literal 180deg, but small,
// faint, and low z-index enough to sit mostly behind/inside the active card's
// footprint rather than floating visibly beside it.
function ringPlacement(offset) {
  const angleDeg = offset * STEP_DEG;
  const rad = (angleDeg * Math.PI) / 180;
  const x = RADIUS * Math.sin(rad);
  const depth = Math.cos(rad); // 1 = facing viewer, -1 = facing away
  const depthNorm = (depth + 1) / 2;
  const scale = 0.4 + 0.66 * depthNorm ** 1.7;
  const opacity = Math.max(0.15, Math.min(1, 0.15 + 0.85 * depthNorm ** 1.4));
  const zIndex = Math.round(depth * 100) + 100;
  const rotateY = -angleDeg;
  return { x, scale, opacity, zIndex, rotateY };
}

// `mx`/`my` are per-card Framer motion values now (see `ServiceCard`), not
// numbers mirrored through `useState` at the `Services` level. Building the
// two gradient strings with `useMotionTemplate` means hovering a card
// updates only that card's own DOM style, directly, every mousemove pixel -
// bypassing React entirely - instead of the previous lifted `mousePos`
// state, which re-rendered all four cards (plus the section header, nav
// buttons, and caption) on every mousemove over any one of them.
function GlowLayer({ mx, my }) {
  const glowBg = useMotionTemplate`radial-gradient(240px circle at ${mx}% ${my}%, rgba(${ACCENT_RGB}, 0.16), transparent 70%)`;
  const borderBg = useMotionTemplate`radial-gradient(240px circle at ${mx}% ${my}%, rgba(${ACCENT_RGB}, 0.9), transparent 70%)`;
  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out"
        style={{ background: glowBg }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out"
        style={{
          padding: 1,
          background: borderBg,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
    </>
  );
}

// One coverflow card, split out from the parent's `.map()` for perf. The
// carousel's drag rotation and each card's mouse-glow both used to live as
// `useState` on `Services` itself (`liveOffset`, `mousePos`), which meant
// every drag frame AND every mousemove over any card re-rendered the whole
// section - all four cards, the header, the nav buttons, the caption - not
// just the thing that actually changed. Mouse-glow is now zero-re-render
// (local motion values, see `GlowLayer`). Drag position still triggers a
// React re-render - Framer's `animate` prop is what gives button-click
// selection its smooth spring-to-target transition, and that needs a real
// prop value each time - but that state is now local to each `ServiceCard`
// via its own subscription to the shared `spinSteps` motion value, so a
// drag frame only re-renders the 4 small card subtrees, never the section
// chrome around them.
function ServiceCard({ svc, index, active, spinSteps, reduce, onPointerDown, onSelect }) {
  const Icon = svc.icon;
  const [offset, setOffset] = useState(() => spinSteps.get());
  useMotionValueEvent(spinSteps, 'change', setOffset);

  const baseOffset = signedOffset(index, active);
  const p = ringPlacement(baseOffset - offset);
  const isActive = index === active && Math.abs(offset) < 0.02;

  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Show ${svc.title}`}
      aria-current={isActive}
      onPointerDown={onPointerDown}
      onMouseMove={handleMouseMove}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect();
      }}
      animate={{
        x: p.x,
        scale: p.scale,
        rotateY: p.rotateY,
        opacity: p.opacity,
        zIndex: p.zIndex,
      }}
      whileHover={
        !isActive
          ? { y: -10, transition: { duration: 0.15, ease: 'easeOut' } }
          : {}
      }
      transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.7 }}
      className={`group absolute rounded-[28px] bg-white border shadow-lg overflow-hidden cursor-pointer transition-all duration-200 ease-out ${
        isActive
          ? 'w-[250px] h-[400px] sm:w-[290px] sm:h-[450px] md:w-[320px] md:h-[500px] border-grass-accent-light/40 shadow-2xl'
          : 'w-[210px] h-[270px] sm:w-[240px] sm:h-[310px] md:w-[270px] md:h-[350px] border-luxury-border'
      }`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Idle ambient bob for unfocused cards - a nested transform on a
          separate element so it composes cleanly with the hover lift above
          instead of fighting it for the same animate prop. */}
      <motion.div
        className="relative w-full h-full"
        animate={!isActive && !reduce ? { y: [0, -10, 0] } : { y: 0 }}
        transition={
          !isActive && !reduce
            ? { duration: 2.6 + (index % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
      >
        {/* subtle dot-grid texture, echoes the hero's halftone motif */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(30,41,37,0.08) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />

        {/* single-accent wash, position varies per card for identity */}
        <div
          className={`absolute w-[70%] h-[70%] rounded-full bg-grass-accent-light/10 blur-3xl ${GLOW_POSITION[svc.glow]}`}
        />

        {svc.glow === 'center' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={isActive ? { opacity: [0.4, 0.8, 0.4] } : { opacity: 0.3 }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-24 h-24 rounded-full bg-grass-accent-light/20 blur-2xl" />
          </motion.div>
        )}

        {/* mouse-follow glow + gradient border ring, brand green */}
        <GlowLayer mx={mx} my={my} />

        <div className="relative z-10 h-full flex flex-col items-center px-6 py-8">
          <AnimatePresence mode="wait" initial={false}>
            {isActive ? (
              <motion.div
                key="expanded"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -6, transition: { duration: 0.1 } }}
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.16, ease: 'easeOut', staggerChildren: 0.05, delayChildren: 0.08 },
                  },
                }}
                className="flex flex-col items-center w-full h-full"
              >
                <Icon size={38} weight="duotone" className="text-sage-950 shrink-0" />

                <div className="mt-5 w-full h-px bg-luxury-border" />

                <div className="mt-5 flex flex-col gap-4 w-full overflow-y-auto">
                  {svc.subServices.map((sub) => (
                    <motion.div
                      key={sub.title}
                      variants={{
                        // x, not y: this list sits in an overflow-y-auto container, and a
                        // vertical transform briefly counts toward its scrollable overflow,
                        // flashing a scrollbar mid-stagger. A horizontal offset doesn't.
                        hidden: { opacity: 0, x: -8 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="flex items-start gap-2"
                    >
                      <CaretRight
                        size={11}
                        weight="bold"
                        className="text-grass-accent mt-[3px] shrink-0"
                      />
                      <div>
                        <div className="text-[11px] sm:text-xs font-sans font-bold text-sage-950 leading-snug">
                          {sub.title}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-light text-sage-500 leading-snug mt-0.5">
                          {sub.detail}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="flex-1 flex flex-col items-center justify-center gap-3 w-full"
              >
                <Icon
                  size={48}
                  weight="duotone"
                  className="text-sage-700 transition-transform duration-150 ease-out group-hover:scale-110 group-hover:text-grass-accent"
                />
                <span className="text-[10px] font-mono uppercase tracking-widest text-sage-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out text-center px-2">
                  {svc.title.split(' ').slice(0, 2).join(' ')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Services() {
  const [active, setActive] = useState(0);
  const spinSteps = useMotionValue(0);
  const dragRef = useRef(null);
  const reduce = useReducedMotion();

  const selectIndex = (idx) => setActive(mod(idx, N));

  const settle = (currentSteps, velocity) => {
    const velocitySteps = (velocity * 1000 * 0.14) / PX_PER_STEP;
    const targetSteps = Math.round(currentSteps + velocitySteps);
    const newActive = mod(active - targetSteps, N);
    const leftover = currentSteps - targetSteps;

    spinSteps.set(leftover);
    setActive(newActive);
    animate(spinSteps, 0, {
      type: 'spring',
      stiffness: 210,
      damping: 24,
      velocity: -velocitySteps,
    });
  };

  const handlePointerDown = (i) => (e) => {
    const d = { index: i, startX: e.clientX, lastX: e.clientX, lastT: performance.now(), velocity: 0, moved: false };
    dragRef.current = d;
    spinSteps.stop();

    const onMove = (ev) => {
      const dx = ev.clientX - d.startX;
      if (Math.abs(dx) > 4) d.moved = true;
      const now = performance.now();
      const dt = Math.max(1, now - d.lastT);
      d.velocity = (ev.clientX - d.lastX) / dt;
      d.lastX = ev.clientX;
      d.lastT = now;
      spinSteps.set(dx / PX_PER_STEP);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      dragRef.current = null;
      if (d.moved) {
        settle(spinSteps.get(), d.velocity);
      } else {
        spinSteps.set(0);
        selectIndex(d.index);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const active_ = SERVICES[active];

  return (
    <section
      id="services"
      className="relative py-24 md:py-32 bg-white border-t border-luxury-border overflow-hidden scroll-mt-24"
    >
      {/* Ambient WebGL background - sits behind the title/intro text only, fades
          out before the carousel so it doesn't compete with the cards. */}
      <div
        className="absolute inset-x-0 top-0 h-[10px] md:h-[360px] z-0 opacity-70 pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      >
        <Threads color={THREADS_COLOR} amplitude={0.4} distance={0.15} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
              <span className="text-xs font-mono tracking-[0.3em] text-gold-accent uppercase font-bold">
                Our Services
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans tracking-tight leading-[1.1]">
              <span className="font-light text-sage-500 block mb-1">One team,</span>
              <span className="font-bold italic text-sage-950 block pb-1">
                every layer of the build.
              </span>
            </h2>
          </div>
          <p className="text-xs md:text-sm text-sage-600 font-light max-w-sm leading-relaxed md:pb-1">
            From marketing sites to internal tools to AI workflows, we design, build, and
            support every layer so nothing falls through the cracks.
          </p>
        </motion.div>

        {/* Coverflow */}
        <div
          className="relative h-[380px] sm:h-[460px] md:h-[540px] flex items-center justify-center select-none"
          style={{ perspective: '900px' }}
        >
          {SERVICES.map((svc, i) => (
            <ServiceCard
              key={svc.id}
              svc={svc}
              index={i}
              active={active}
              spinSteps={spinSteps}
              reduce={reduce}
              onPointerDown={handlePointerDown(i)}
              onSelect={() => selectIndex(i)}
            />
          ))}
        </div>

        {/* Navigation: liquid-glass arrow bubbles, no dashes / video-style controls */}
        <div className="mt-10 flex items-center justify-center gap-5">
          <motion.button
            type="button"
            aria-label="Previous service"
            onClick={() => selectIndex(active - 1)}
            whileInView={reduce ? {} : { scale: [1, 1.07, 1] }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.3, repeat: 1, repeatDelay: 0.35, ease: 'easeInOut' }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-12 h-12 rounded-full flex items-center justify-center text-sage-700 bg-white/40 backdrop-blur-xl border border-white/70 shadow-[0_8px_24px_rgba(30,41,37,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors duration-150 ease-out hover:bg-white/60 hover:text-grass-accent"
          >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
            <CaretLeft size={18} weight="bold" className="relative" />
          </motion.button>

          <motion.button
            type="button"
            aria-label="Next service"
            onClick={() => selectIndex(active + 1)}
            whileInView={reduce ? {} : { scale: [1, 1.07, 1] }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.45, repeat: 1, repeatDelay: 0.35, ease: 'easeInOut' }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-12 h-12 rounded-full flex items-center justify-center text-sage-700 bg-white/40 backdrop-blur-xl border border-white/70 shadow-[0_8px_24px_rgba(30,41,37,0.10),inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors duration-150 ease-out hover:bg-white/60 hover:text-grass-accent"
          >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
            <CaretRight size={18} weight="bold" className="relative" />
          </motion.button>
        </div>

        {/* Caption */}
        <div className="mt-8 min-h-[5rem] flex flex-col items-center text-center px-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active_.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.12, ease: 'easeIn' } }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex flex-col items-center gap-2 max-w-2xl"
            >
              <h3 className="font-sans text-sm sm:text-base font-bold text-sage-950 tracking-tight">
                {active_.title}
              </h3>
              <p className="text-xs sm:text-sm text-sage-500 font-light leading-relaxed">
                {active_.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
