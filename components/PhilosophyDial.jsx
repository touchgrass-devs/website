'use client';

import { motion, useTransform } from 'framer-motion';

// Rebuilt to match the mechanics of a working reference build the user
// supplied (verbatim code, not just a video this time) after the first pass
// came out oversized and over-designed. Two structural differences from the
// prior version: (1) this is a normal-sized "speedometer" bezel (500-680px),
// not a 1640px ring mostly hidden off-screen; (2) it only sweeps a small arc
// (45deg to -45deg, four nodes 30deg apart) rather than spinning a full 360
// wheel with nodes 90deg apart. Node placement is a CSS custom property
// (`--dial-radius`, set once per breakpoint on the rotating face) combined
// with a plain `rotate(angle) translateY(var(--dial-radius))` per node - no
// JS trig, no per-breakpoint position recompute. Each node then counter-
// rotates its own button by the live dial rotation so icons stay upright.
const TOTAL_TICKS = 120;
const TICKS = Array.from({ length: TOTAL_TICKS }, (_, i) => {
  const angle = (i * 360) / TOTAL_TICKS;
  const rad = (angle * Math.PI) / 180;
  const isMajor = i % 10 === 0;
  const isMedium = i % 5 === 0 && !isMajor;
  const r1 = isMajor ? 265 : isMedium ? 272 : 278;
  const r2 = 290;
  return {
    key: i,
    isMajor,
    isMedium,
    x1: 300 + r1 * Math.sin(rad),
    y1: 300 - r1 * Math.cos(rad),
    x2: 300 + r2 * Math.sin(rad),
    y2: 300 - r2 * Math.cos(rad),
  };
});

function DialNode({ pillar, idx, isActive, rotation, onSelect, reduce }) {
  const Icon = pillar.icon;
  // Cancels the dial face's own live rotation so this button - and its icon -
  // stay upright no matter where the sweep currently has it.
  const itemRotation = useTransform(rotation, (r) => -r - pillar.angle);

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        transform: `translate(-50%, -50%) rotate(${pillar.angle}deg) translateY(var(--dial-radius, -245px))`,
      }}
    >
      <motion.button
        type="button"
        onClick={() => onSelect(idx)}
        aria-label={pillar.title}
        style={{ rotate: itemRotation }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        className={`group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border shadow-sm transition-colors duration-300 cursor-pointer pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent ${
          isActive
            ? 'bg-sage-950 border-gold-accent shadow-md shadow-gold-accent/15'
            : 'bg-white border-luxury-border hover:border-gold-accent/40 hover:bg-sage-50/50'
        }`}
      >
        <Icon
          size={20}
          weight="bold"
          className={`transition-colors duration-300 ${isActive ? 'text-gold-accent' : 'text-sage-400 group-hover:text-sage-700'}`}
        />
        <span
          className={`absolute -bottom-7 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-wider whitespace-nowrap transition-all duration-300 ${
            isActive ? 'text-gold-accent font-bold opacity-100 scale-100' : 'text-sage-400 opacity-0 group-hover:opacity-100 scale-90'
          }`}
        >
          0{idx + 1}
        </span>
      </motion.button>
    </div>
  );
}

export default function PhilosophyDial({ pillars, activeIndex, rotation, onSelect, reduce }) {
  // `pointer-events-auto` lives only on each node's own button below, not
  // here on the root - this whole element is a rectangular box (240-320px
  // tall, full track width) even though only a circle within it is ever
  // visually the dial, so making the WHOLE box interactive silently killed
  // dot-grid hover in the corners/margins around the circle too (a
  // rectangular dead zone where visually there's nothing but background).
  // Root stays pass-through; only the small button circles opt back in.
  return (
    <div className="relative w-full h-[240px] sm:h-[280px] md:h-[320px] flex justify-center overflow-visible mt-auto z-10 pointer-events-none">
      {/* Fixed pointer, 12 o'clock - the only thing on the dial that never rotates. */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-6 bg-gold-accent z-30 flex flex-col items-center pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-gold-accent shadow-[0_0_8px_#c4a265] mt-1.5" />
      </div>

      {/*
        Centering lives on this plain (non-motion) wrapper, not on the
        rotating face below - Framer Motion writes its own `transform`
        inline style for any prop passed via `style` (here, `rotate`), which
        replaces the element's CSS `transform` outright rather than merging
        with it. Putting `-translate-x-1/2` on the same element that also
        gets `style={{ rotate }}` was exactly that bug: once the rotate
        value updated, Framer's own inline transform silently dropped the
        Tailwind-class translateX(-50%), leaving the dial's left edge
        pinned at screen-center instead of centered on it (looked "shifted
        right"). Fixed by splitting the concern: this wrapper only ever
        gets a static CSS transform (via Tailwind classes), and the
        motion.div inside it is sized to 100% and only ever touches
        `rotate`.
      */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] md:w-[680px] md:h-[680px] [--dial-radius:-180px] sm:[--dial-radius:-210px] md:[--dial-radius:-245px]"
      >
        <motion.div
          style={{ rotate: rotation }}
          className="relative w-full h-full rounded-full bg-gradient-to-b from-sage-50/80 via-white to-white border border-luxury-border shadow-[inset_0_4px_24px_rgba(0,0,0,0.01),0_8px_32px_rgba(0,0,0,0.03)] origin-center"
        >
          <svg className="w-full h-full pointer-events-none select-none text-sage-300" viewBox="0 0 600 600">
            <circle cx="300" cy="300" r="280" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-sage-100" />
            <circle cx="300" cy="300" r="290" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-sage-100/60" />
            {TICKS.map((t) => (
              <line
                key={t.key}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="currentColor"
                strokeWidth={t.isMajor ? 1.5 : t.isMedium ? 1.0 : 0.75}
                className={t.isMajor ? 'text-sage-400' : 'text-sage-200/50'}
              />
            ))}
          </svg>

          {pillars.map((pillar, idx) => (
            <DialNode
              key={pillar.title}
              pillar={pillar}
              idx={idx}
              isActive={idx === activeIndex}
              rotation={rotation}
              onSelect={onSelect}
              reduce={reduce}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
