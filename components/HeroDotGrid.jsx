'use client';

import { useEffect, useRef } from 'react';

// Hover target — a clear grass green, distinct from the source grays.
const ACCENT_COLOR = [63, 174, 106];

// Shared draw routine for a single dot, used by both the pointer-hover
// render loop and the load-in intro animation below, so "glow" (0 = resting
// grayscale/flat, 1 = fully lifted/accent-lit) means the same thing in both
// places and there's only one place the visual math lives.
function paintDot(ctx, d, x, y, glow, boost) {
  const radius = d.baseR + glow * boost;
  const alpha = Math.min(1, d.baseAlpha + glow * 0.5);
  const cr = d.color[0] + (ACCENT_COLOR[0] - d.color[0]) * glow;
  const cg = d.color[1] + (ACCENT_COLOR[1] - d.color[1]) * glow;
  const cb = d.color[2] + (ACCENT_COLOR[2] - d.color[2]) * glow;
  ctx.beginPath();
  ctx.fillStyle = `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${alpha})`;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders the supplied image as an interactive halftone dot field on a canvas.
 * The image itself is never shown — it's sampled off-screen for per-cell
 * color and brightness, which drives each dot's own grayscale tone, size,
 * and opacity (visible at rest, matching the source image).
 *
 * Perf model: the resting frame is pre-rendered once onto an offscreen
 * canvas and blitted in a single drawImage call every frame. Only dots
 * inside the pointer's influence radius are tracked and individually
 * redrawn on top, so cost scales with cursor proximity, not total dot
 * count. Hover strength is also scaled by each dot's own ink, so faint
 * background/edge noise barely reacts — only the actual hand pixels do.
 */
export default function HeroDotGrid({
  src,
  className = '',
  cellSize = 7,
  maxRadius = 2.8,
  influenceRadius = 110,
  boost = 2.2,
  ease = 0.18,
}) {
  const canvasRef = useRef(null);
  const baseCanvasRef = useRef(null);
  const dotsByCellRef = useRef([]);
  const gridRef = useRef({ cols: 0, rows: 0 });
  const activeSetRef = useRef(new Set());
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(null);
  const introRafRef = useRef(null);
  const hasIntroPlayedRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  // Sample the image into a dot grid whenever size or source changes.
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    function renderBase() {
      const { width, height, dpr } = sizeRef.current;
      const base = document.createElement('canvas');
      base.width = Math.round(width * dpr);
      base.height = Math.round(height * dpr);
      const bctx = base.getContext('2d');
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const byCell = dotsByCellRef.current;
      for (let i = 0; i < byCell.length; i++) {
        const d = byCell[i];
        if (!d) continue;
        bctx.beginPath();
        bctx.fillStyle = `rgba(${d.color[0]}, ${d.color[1]}, ${d.color[2]}, ${d.baseAlpha})`;
        bctx.arc(d.x, d.y, d.baseR, 0, Math.PI * 2);
        bctx.fill();
      }
      baseCanvasRef.current = base;

      // paint it onto the visible canvas immediately
      const ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
    }

    // Load-in intro: dots sweep in from the left and right edges toward the
    // center (two mirrored wavefronts, not one flat line — each row's start
    // time is nudged by a sine offset so the leading edge ripples instead of
    // marching in as a straight wall). Each dot then settles with weight —
    // an elastic ease so it overshoots its landing spot and rocks back a
    // couple of diminishing times before coming to rest, rather than just
    // decelerating straight into place. It's also lifted while in motion
    // (bigger, accent-bright — a higher/closer z-plane) and flashes brighter
    // on each bounce, fading to its flat resting size/tone only once truly
    // settled — reusing the exact same glow math the hover effect uses.
    function runIntro() {
      const { width } = sizeRef.current;
      const { cols, rows } = gridRef.current;
      const byCell = dotsByCellRef.current;
      if (!cols || !rows) {
        renderBase();
        return;
      }

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        renderBase();
        return;
      }

      const EDGE_TRAVEL = Math.min(width * 0.24, 260); // how far off to the side each dot starts
      const SWEEP_MS = 900; // max stagger between the edges (first) and center (last)
      const SETTLE_MS = 1550; // each dot's own slide-in + bounce + settle duration — slow and weighty
      const WAVE_AMPLITUDE_MS = 180; // how much the wavefront ripples row to row
      const WAVE_CYCLES = 2.6; // number of ripples top to bottom
      const ELASTIC_AMPLITUDE = 1; // overshoot amount (1 = default resonance)
      const ELASTIC_PERIOD = 0.62; // higher = slower, heavier-feeling bounce

      for (let ry = 0; ry < rows; ry++) {
        const wave = Math.sin((ry / Math.max(1, rows - 1)) * Math.PI * WAVE_CYCLES) * WAVE_AMPLITUDE_MS;
        for (let rx = 0; rx < cols; rx++) {
          const d = byCell[ry * cols + rx];
          if (!d) continue;
          const nx = cols > 1 ? rx / (cols - 1) : 0.5;
          const distFromEdge = Math.min(nx, 1 - nx) * 2; // 0 at either edge -> 1 at center
          d._introDelay = Math.max(0, distFromEdge * SWEEP_MS + wave);
          d._introStartX = nx < 0.5 ? d.x - EDGE_TRAVEL : d.x + EDGE_TRAVEL;
        }
      }

      // Damped oscillation around the target (1) — overshoots past 1, rocks
      // back, and the amplitude decays exponentially, like something with
      // real mass and momentum settling rather than a plain deceleration.
      function easeOutElastic(t) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        const s = (ELASTIC_PERIOD / (2 * Math.PI)) * Math.asin(1 / ELASTIC_AMPLITUDE);
        return (
          ELASTIC_AMPLITUDE * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / ELASTIC_PERIOD) + 1
        );
      }

      const start = performance.now();
      const totalDuration = SWEEP_MS + WAVE_AMPLITUDE_MS + SETTLE_MS;

      function frame(now) {
        if (cancelled) return;
        const elapsed = now - start;
        const { dpr } = sizeRef.current;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        for (let i = 0; i < byCell.length; i++) {
          const d = byCell[i];
          if (!d) continue;
          const local = elapsed - d._introDelay;
          if (local <= 0) continue; // hasn't started yet — stays invisible
          const t = Math.min(1, local / SETTLE_MS);
          const eased = easeOutElastic(t);
          const x = d._introStartX + (d.x - d._introStartX) * eased;
          // Distance from the settled state (1) drives the lift — this is
          // near 1 at the start (lifted), dips toward 0 as it first arrives,
          // then flashes back up a little on each rebound before decaying
          // to 0 for good once the oscillation dies out.
          const glow = t >= 1 ? 0 : Math.min(1.2, Math.abs(1 - eased) * 1.35);
          paintDot(ctx, d, x, d.y, glow, boost);
        }

        if (elapsed < totalDuration) {
          introRafRef.current = requestAnimationFrame(frame);
        } else {
          introRafRef.current = null;
          renderBase(); // bake the settled resting frame for the cached blit path
        }
      }

      introRafRef.current = requestAnimationFrame(frame);
    }

    function buildDots() {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      sizeRef.current = { width, height, dpr };

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        if (cancelled) return;

        const cols = Math.max(1, Math.floor(width / cellSize));
        const rows = Math.max(1, Math.floor(height / cellSize));

        // Sample at full display resolution first (not straight down to the
        // grid) — the source image is itself a sparse stipple pattern, and
        // shrinking it directly to a coarse grid via canvas smoothing
        // averages those fine dark dots into near-white. Instead we render
        // at 1:1 display resolution, then max-pool each cell below so the
        // darkest pixel in each block (the actual "ink") survives.
        const sampleW = Math.max(cols, Math.round(width));
        const sampleH = Math.max(rows, Math.round(height));

        const off = document.createElement('canvas');
        off.width = sampleW;
        off.height = sampleH;
        const octx = off.getContext('2d', { willReadFrequently: true });

        const imgRatio = img.width / img.height;
        const boxRatio = sampleW / sampleH;
        let drawW, drawH, dx, dy;
        if (imgRatio > boxRatio) {
          drawH = sampleH;
          drawW = sampleH * imgRatio;
          dx = (sampleW - drawW) / 2;
          dy = 0;
        } else {
          drawW = sampleW;
          drawH = sampleW / imgRatio;
          dx = 0;
          dy = (sampleH - drawH) / 2;
        }
        octx.clearRect(0, 0, sampleW, sampleH);
        octx.drawImage(img, dx, dy, drawW, drawH);

        let data;
        try {
          data = octx.getImageData(0, 0, sampleW, sampleH).data;
        } catch (err) {
          return;
        }

        const blockW = sampleW / cols;
        const blockH = sampleH / rows;

        // Threshold tuned so only genuine hand ink registers — filters out
        // JPEG/background noise that would otherwise create faint dots (and
        // therefore hover response) in the empty white area.
        const INK_THRESHOLD = 0.14;

        const byCell = new Array(cols * rows).fill(null);

        for (let ry = 0; ry < rows; ry++) {
          const y0 = Math.floor(ry * blockH);
          const y1 = Math.max(y0 + 1, Math.floor((ry + 1) * blockH));
          for (let rx = 0; rx < cols; rx++) {
            const x0 = Math.floor(rx * blockW);
            const x1 = Math.max(x0 + 1, Math.floor((rx + 1) * blockW));

            let bestInk = -1;
            let br = 255, bg = 255, bb = 255;
            for (let py = y0; py < y1; py++) {
              for (let px = x0; px < x1; px++) {
                const i = (py * sampleW + px) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                const ink = 1 - luminance;
                if (ink > bestInk) {
                  bestInk = ink;
                  br = r;
                  bg = g;
                  bb = b;
                }
              }
            }
            if (bestInk < INK_THRESHOLD) continue; // background — leave empty

            byCell[ry * cols + rx] = {
              x: rx * cellSize + cellSize / 2,
              y: ry * cellSize + cellSize / 2,
              ink: bestInk,
              color: [br, bg, bb],
              baseAlpha: Math.min(1, 0.32 + bestInk * 0.68),
              baseR: 0.6 + bestInk * maxRadius,
              glow: 0,
            };
          }
        }

        dotsByCellRef.current = byCell;
        gridRef.current = { cols, rows };
        activeSetRef.current.clear();

        // Only play the sweep-in on first build — a later rebuild (e.g. a
        // window resize retriggering the ResizeObserver) should just show
        // the resting frame directly, not replay the intro.
        if (!hasIntroPlayedRef.current) {
          hasIntroPlayedRef.current = true;
          runIntro();
        } else {
          renderBase();
        }
      };
    }

    buildDots();
    const ro = new ResizeObserver(() => buildDots());
    ro.observe(container);

    return () => {
      cancelled = true;
      ro.disconnect();
      if (introRafRef.current) cancelAnimationFrame(introRafRef.current);
      introRafRef.current = null;
    };
  }, [src, cellSize, maxRadius, boost]);

  // Pointer-driven interaction loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    function startLoop() {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(render);
      }
    }

    function activateNearby(x, y) {
      const { cols, rows } = gridRef.current;
      if (!cols || !rows) return;
      const byCell = dotsByCellRef.current;
      const rxMin = Math.max(0, Math.floor((x - influenceRadius) / cellSize));
      const rxMax = Math.min(cols - 1, Math.ceil((x + influenceRadius) / cellSize));
      const ryMin = Math.max(0, Math.floor((y - influenceRadius) / cellSize));
      const ryMax = Math.min(rows - 1, Math.ceil((y + influenceRadius) / cellSize));
      for (let ry = ryMin; ry <= ryMax; ry++) {
        const rowOffset = ry * cols;
        for (let rx = rxMin; rx <= rxMax; rx++) {
          const d = byCell[rowOffset + rx];
          if (d) activeSetRef.current.add(d);
        }
      }
    }

    function handleMove(e) {
      // Ignore hover while the load-in sweep is still animating — it owns
      // the canvas and clears/redraws it every frame; racing the two rAF
      // loops against each other would just flicker.
      if (introRafRef.current) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointerRef.current.x = x;
      pointerRef.current.y = y;
      pointerRef.current.active = true;
      activateNearby(x, y);
      startLoop();
    }

    function handleLeave() {
      pointerRef.current.active = false;
      startLoop();
    }

    function render() {
      const ctx = canvas.getContext('2d');
      const { dpr } = sizeRef.current;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (baseCanvasRef.current) {
        ctx.drawImage(baseCanvasRef.current, 0, 0);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const p = pointerRef.current;
      let stillAnimating = false;
      const toRemove = [];

      activeSetRef.current.forEach((d) => {
        let target = 0;
        if (p.active) {
          const dx = d.x - p.x;
          const dy = d.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < influenceRadius) {
            const proximity = 1 - dist / influenceRadius;
            // scale by ink so only real hand pixels react strongly —
            // faint/edge dots stay muted even inside the influence radius
            target = proximity * Math.min(1, d.ink * 1.6);
          }
        }

        const delta = target - d.glow;
        d.glow += delta * ease;

        if (target === 0 && Math.abs(d.glow) < 0.003) {
          d.glow = 0;
          toRemove.push(d);
          return; // resting look already shown by the cached base blit
        }
        stillAnimating = true;
        paintDot(ctx, d, d.x, d.y, d.glow, boost);
      });

      for (let i = 0; i < toRemove.length; i++) activeSetRef.current.delete(toRemove[i]);

      if (stillAnimating || p.active) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        rafRef.current = null;
      }
    }

    container.addEventListener('pointermove', handleMove);
    container.addEventListener('pointerleave', handleLeave);

    return () => {
      container.removeEventListener('pointermove', handleMove);
      container.removeEventListener('pointerleave', handleLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [influenceRadius, boost, ease, cellSize]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
