'use client';

import { useEffect, useRef } from 'react';

// Ambient "spore field" - soft motes of light drifting slowly upward through
// the section, like dust caught in a beam over grass. This is the section's
// passive layer: it runs continuously on its own rAF loop regardless of
// scroll position or pointer activity, so the section never reads as inert
// when a visitor stops scrolling. Cursor proximity adds a gentle, secondary
// repulsion on top - reactive polish, not the primary motion source.
//
// Perf model matches Threads/HeroDotGrid elsewhere on the page: capped DPR,
// pauses via IntersectionObserver + document.hidden, full teardown on unmount.

const GRASS_RGB = [68, 110, 91]; // grass-accent-light
const GOLD_RGB = [196, 162, 101]; // gold-accent
const COUNT = 44;

function makeParticle(width, height, seedY) {
  const isSpark = Math.random() < 0.12;
  return {
    x: Math.random() * width,
    y: seedY != null ? seedY : Math.random() * height,
    r: isSpark ? 1.1 + Math.random() * 1.1 : 1.6 + Math.random() * 2.2,
    speed: 6 + Math.random() * 10, // px/sec upward drift
    wobbleAmp: 6 + Math.random() * 14,
    wobbleFreq: 0.15 + Math.random() * 0.25,
    phase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.4 + Math.random() * 0.6,
    baseAlpha: isSpark ? 0.55 + Math.random() * 0.25 : 0.22 + Math.random() * 0.3,
    color: isSpark ? GOLD_RGB : GRASS_RGB,
    ox: 0,
    oy: 0,
  };
}

export default function PhilosophyField({ className = '', reduce = false }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    let isVisible = true;
    let startT = null;

    function resize() {
      const { clientWidth, clientHeight } = container;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      sizeRef.current = { width: clientWidth, height: clientHeight, dpr };
      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
      canvas.style.width = `${clientWidth}px`;
      canvas.style.height = `${clientHeight}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: COUNT }, () =>
          makeParticle(clientWidth, clientHeight)
        );
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // Reduced motion: paint one settled frame, no loop, no listeners.
    if (reduce) {
      const ctx = canvas.getContext('2d');
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);
      particlesRef.current.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.baseAlpha * 0.6})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      return () => ro.disconnect();
    }

    const io = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    io.observe(container);

    function handleMove(e) {
      const rect = container.getBoundingClientRect();
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    }
    function handleLeave() {
      pointerRef.current.active = false;
    }
    container.addEventListener('pointermove', handleMove);
    container.addEventListener('pointerleave', handleLeave);

    function frame(t) {
      rafRef.current = requestAnimationFrame(frame);
      if (!isVisible || document.hidden) return;
      if (startT == null) startT = t;
      const time = (t - startT) / 1000;

      const { width, height } = sizeRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;

      for (const p of particlesRef.current) {
        // baseline passive drift - always runs, independent of the pointer
        p.y -= p.speed * (1 / 60);
        const wobble = Math.sin(time * p.wobbleFreq + p.phase) * p.wobbleAmp;

        // gentle cursor repulsion, eased on top of the drift
        let targetOx = 0;
        let targetOy = 0;
        if (pointer.active) {
          const dx = p.x + wobble - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 100;
          if (dist < radius && dist > 0.001) {
            const strength = (1 - dist / radius) * 22;
            targetOx = (dx / dist) * strength;
            targetOy = (dy / dist) * strength;
          }
        }
        p.ox += (targetOx - p.ox) * 0.06;
        p.oy += (targetOy - p.oy) * 0.06;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const drawX = p.x + wobble + p.ox;
        const drawY = p.y + p.oy;
        const twinkle = 0.6 + 0.4 * Math.sin(time * p.twinkleSpeed + p.phase);
        const alpha = p.baseAlpha * twinkle;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`;
        ctx.shadowColor = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`;
        ctx.shadowBlur = p.r * 2.5;
        ctx.arc(drawX, drawY, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener('pointermove', handleMove);
      container.removeEventListener('pointerleave', handleLeave);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
