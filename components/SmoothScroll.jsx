'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Site-wide inertia scroll. Added specifically to fix two things reported
// while testing the Philosophy pin: (1) native, un-eased wheel/trackpad
// deltas landing directly on GSAP's pinned ScrollTrigger produced a slightly
// jagged "catch-up" feel scrolling back past the pin boundary, and (2) a
// general request for a smoother/"buttery" scroll feel site-wide, not just
// in that one section.
//
// The integration follows GSAP's own documented Lenis pairing: Lenis drives
// the eased scroll position, `lenis.on('scroll', ScrollTrigger.update)` keeps
// every ScrollTrigger (including the Philosophy pin) in sync with it every
// tick, and Lenis's own raf is driven from `gsap.ticker` instead of its own
// independent requestAnimationFrame loop - two separate uncoordinated rAFs
// is what usually causes pinned sections to feel like they're stuttering or
// fighting the scroll, since GSAP and Lenis would otherwise disagree by a
// frame. `gsap.ticker.lagSmoothing(0)` disables GSAP's tab-refocus catch-up
// jump, which otherwise causes its own visible pin snap.
export default function SmoothScroll({ children }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.1,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Exposed so components can trigger a smooth programmatic scroll (e.g.
    // Philosophy's dial - clicking an unfocused node scrolls to it) without
    // fighting Lenis's own eased scroll physics. Native `window.scrollTo`
    // would otherwise race Lenis's rAF loop and produce a jittery jump.
    window.__lenis = lenis;

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return children;
}
