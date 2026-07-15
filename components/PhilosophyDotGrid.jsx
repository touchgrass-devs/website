'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(InertiaPlugin);

// Adapted from a user-supplied "interactable dot grid" reference (react-bits'
// DotGrid). Kept the core mechanic - proximity hover glow, a velocity-seeded
// GSAP Inertia push on fast mouse passes, and a click shockwave - since
// that's the whole point of "interactable." Everything else is rebuilt for
// this project rather than reused as-is:
//
// - Restyled to the page's own palette instead of the template's default
//   purple: dots rest as a faint neutral (sage-400 at low alpha) and blend
//   toward the same locked brand green (`63, 174, 106`) used for every other
//   hover/glow moment on the site (HeroDotGrid, Services cards) - one accent
//   color, no new hue introduced.
// - Much finer and sparser than the template defaults (which used bold
//   16px dots on a 48px pitch - fine for a hero centerpiece, too heavy for
//   copy to sit on top of). This is a backdrop behind readable text, so dots
//   are small and the grid is loose enough to read as texture, not pattern.
// - No global `window` listeners. The reference wired mousemove/click to
//   the whole window, which meant a click anywhere on the page (a nav link,
//   the contact form) would also ripple this section's dots. Interaction is
//   scoped to this component's own wrapper instead, matching how
//   `HeroDotGrid` scopes its pointer tracking to its own container.
// - Respects `prefers-reduced-motion` via the `reduce` prop: skips the
//   render loop and all pointer/inertia wiring entirely, painting the
//   resting grid once and leaving it static.
const BASE_RGB = { r: 156, g: 166, b: 175 }; // sage-400, the resting tone
const ACCENT_RGB = { r: 63, g: 174, b: 106 }; // locked brand green, site-wide

const throttle = (fn, limit) => {
  let last = 0;
  return (...args) => {
    const now = performance.now();
    if (now - last >= limit) {
      last = now;
      fn(...args);
    }
  };
};

export default function PhilosophyDotGrid({
  className = '',
  reduce = false,
  dotSize = 2.6,
  gap = 34,
  proximity = 130,
  speedTrigger = 130,
  shockRadius = 190,
  shockStrength = 2.6,
  maxSpeed = 4000,
  resistance = 700,
  returnDuration = 1.3,
}) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false, lastTime: 0, lastX: 0, lastY: 0 });

  const circlePath = useMemo(() => {
    if (typeof window === 'undefined' || !window.Path2D) return null;
    const p = new window.Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const { width, height } = wrap.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = dotSize + gap;
    const cols = Math.floor((width + gap) / cell);
    const rows = Math.floor((height + gap) / cell);
    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;
    const startX = (width - gridW) / 2 + dotSize / 2;
    const startY = (height - gridH) / 2 + dotSize / 2;

    const dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
          _inertiaApplied: false,
        });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  // Resize handling - rebuild the grid whenever the section's box changes.
  useEffect(() => {
    buildGrid();
    const wrap = wrapperRef.current;
    if (!wrap) return undefined;
    const ro = new ResizeObserver(buildGrid);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [buildGrid]);

  // Render loop - always running (this is a permanent ambient layer, not
  // something that should look frozen when the pointer is idle), but paused
  // while the tab is backgrounded, matching the `Threads` background's own
  // `document.hidden` courtesy check elsewhere on this page.
  useEffect(() => {
    if (!circlePath) return undefined;

    if (reduce) {
      // Reduced motion: paint the resting grid once, no loop, no listeners.
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const dot of dotsRef.current) {
          ctx.save();
          ctx.translate(dot.cx, dot.cy);
          ctx.fillStyle = `rgba(${BASE_RGB.r}, ${BASE_RGB.g}, ${BASE_RGB.b}, 0.4)`;
          ctx.fill(circlePath);
          ctx.restore();
        }
      }
      return undefined;
    }

    let rafId;
    const proxSq = proximity * proximity;

    const draw = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: px, y: py, active } = pointerRef.current;

      for (const dot of dotsRef.current) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;
        let alpha = 0.4;
        let r = BASE_RGB.r;
        let g = BASE_RGB.g;
        let b = BASE_RGB.b;

        if (active) {
          const dx = dot.cx - px;
          const dy = dot.cy - py;
          const dsq = dx * dx + dy * dy;
          if (dsq <= proxSq) {
            const t = 1 - Math.sqrt(dsq) / proximity;
            r = BASE_RGB.r + (ACCENT_RGB.r - BASE_RGB.r) * t;
            g = BASE_RGB.g + (ACCENT_RGB.g - BASE_RGB.g) * t;
            b = BASE_RGB.b + (ACCENT_RGB.b - BASE_RGB.b) * t;
            alpha = 0.4 + t * 0.55;
          }
        }

        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`;
        ctx.fill(circlePath);
        ctx.restore();
      }
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [circlePath, proximity, reduce]);

  // Pointer interaction - scoped to this component's own wrapper, not
  // `window`, so hovering/clicking elsewhere on the page never touches it.
  useEffect(() => {
    if (reduce) return undefined;
    const wrap = wrapperRef.current;
    if (!wrap) return undefined;

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      const pr = pointerRef.current;
      const now = performance.now();
      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;
      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }
      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;
      pr.active = true;

      if (speed > speedTrigger) {
        for (const dot of dotsRef.current) {
          const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
          if (dist < proximity && !dot._inertiaApplied) {
            dot._inertiaApplied = true;
            gsap.killTweensOf(dot);
            const pushX = dot.cx - pr.x + vx * 0.005;
            const pushY = dot.cy - pr.y + vy * 0.005;
            gsap.to(dot, {
              inertia: { xOffset: pushX, yOffset: pushY, resistance },
              onComplete: () => {
                gsap.to(dot, { xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'elastic.out(1,0.75)' });
                dot._inertiaApplied = false;
              },
            });
          }
        }
      }
    };

    const onLeave = () => {
      pointerRef.current.active = false;
    };

    const onClick = (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius && !dot._inertiaApplied) {
          dot._inertiaApplied = true;
          gsap.killTweensOf(dot);
          const falloff = Math.max(0, 1 - dist / shockRadius);
          const pushX = (dot.cx - cx) * shockStrength * falloff;
          const pushY = (dot.cy - cy) * shockStrength * falloff;
          gsap.to(dot, {
            inertia: { xOffset: pushX, yOffset: pushY, resistance },
            onComplete: () => {
              gsap.to(dot, { xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'elastic.out(1,0.75)' });
              dot._inertiaApplied = false;
            },
          });
        }
      }
    };

    const throttledMove = throttle(onMove, 40);
    wrap.addEventListener('pointermove', throttledMove, { passive: true });
    wrap.addEventListener('pointerleave', onLeave);
    wrap.addEventListener('click', onClick);
    return () => {
      wrap.removeEventListener('pointermove', throttledMove);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('click', onClick);
    };
  }, [reduce, maxSpeed, speedTrigger, proximity, resistance, returnDuration, shockRadius, shockStrength]);

  return (
    <div ref={wrapperRef} className={className}>
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" aria-hidden="true" />
    </div>
  );
}
