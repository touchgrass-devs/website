'use client';

import { useEffect, useRef, useState } from 'react';
import { LiquidMetal } from '@paper-design/shaders-react';
import { motion, useReducedMotion } from 'framer-motion';

// ---------------------------------------------------------------------------
// The Hero's single CTA, restyled per reference (vengenceui.com's
// "Liquid Metal" component: github.com/paper-design/shaders' LiquidMetal
// shader used as an animated button border). Built directly against
// `@paper-design/shaders-react` (the same real WebGL shader package that
// reference component wraps) rather than hand-rolled CSS - see
// design-taste-frontend skill's "Honesty rule": don't fake a real shader
// effect with gradients when the actual package is available and small.
//
// NOT the reference's literal color scheme (gray/blue chrome) - recolored to
// this project's locked palette so it reads as "this site's metal," not a
// copy-pasted demo. First pass paired near-black with `gold-accent` (warm
// gold sweep) - per feedback that it stood out too much against the rest of
// the page's restrained palette, swapped to a cool silver sweep instead:
// `colorBack` is the site's actual `sage-950`, `colorTint` is `sage-400` - a
// quiet chrome/graphite shimmer using colors already in the neutral scale,
// not a new accent pairing. Reads as "brushed metal," not "gold flash."
//
// Structural pattern also borrowed from the reference (not just the colors):
// the shader only ever renders in a thin BORDER ring around a solid pill,
// never full-bleed behind the label. That's a deliberate contrast decision,
// not a style choice - a shifting animated background behind static text can
// dip under WCAG contrast at some frames; a solid `sage-950` fill behind the
// white label guarantees the label's contrast never depends on the shader's
// current frame (see design-taste-frontend's BUTTON CONTRAST CHECK rule).
const METAL_BACK = '#030712'; // sage-950 - the site's actual locked "black"
const METAL_TINT = '#9ca6af'; // sage-400 - quiet cool-grey chrome highlight

export default function LiquidMetalCTA({ href, onClick, children, className = '' }) {
  const reduce = useReducedMotion();
  const wrapperRef = useRef(null);
  // The WebGL shader keeps rendering every frame for as long as it's
  // mounted, even once the visitor has scrolled the whole Hero (and this
  // button) off-screen - it's the page's only other permanent GPU-driven
  // loop besides the dot grids. Unmounting it off-screen and swapping to the
  // same static gradient already used for `prefers-reduced-motion` costs
  // nothing visually (the button isn't visible either way) and drops that
  // context entirely until scrolled back near it.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '200px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.a
      ref={wrapperRef}
      href={href}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
      className={`group relative inline-block rounded-full shadow-[0_20px_50px_-12px_rgba(3,7,18,0.35)] ${className}`}
    >
      {/* Border ring: ~3px of visible shader/gradient showing around the
          inner pill, via padding on this wrapper + inset-0 fill below. */}
      <span className="relative block rounded-full p-[3px] overflow-hidden">
        {reduce || !inView ? (
          // Reduced-motion fallback: a static two-tone sweep in the same two
          // colors, no WebGL/animation - matches the site-wide convention of
          // swapping continuous motion for a static equivalent under
          // prefers-reduced-motion, rather than just disabling the visual.
          <span
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${METAL_BACK} 0%, ${METAL_TINT} 50%, ${METAL_BACK} 100%)`,
            }}
          />
        ) : (
          <LiquidMetal
            colorBack={METAL_BACK}
            colorTint={METAL_TINT}
            speed={0.4}
            repetition={4}
            distortion={0.15}
            softness={0}
            shiftRed={0.3}
            shiftBlue={-0.3}
            angle={45}
            shape="none"
            scale={1}
            fit="cover"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
        )}

        {/* Inner pill: solid fill, always - see contrast note above. Sized
            down a notch from the first pass (px-10/py-4 → px-9/py-3.5 at
            base) per feedback that it was too large. Hover was
            `grass-accent` (green) - swapped to `sage-800` (grey) per
            feedback, so the whole button stays in the same neutral/chrome
            family at rest AND on hover instead of flashing brand-green. */}
        <span
          className="relative z-10 flex items-center justify-center rounded-full bg-sage-950 group-hover:bg-sage-800 px-9 py-3.5 md:px-10 md:py-4 text-xs md:text-sm font-bold uppercase tracking-wider text-white transition-colors duration-300"
        >
          {children}
        </span>
      </span>
    </motion.a>
  );
}
