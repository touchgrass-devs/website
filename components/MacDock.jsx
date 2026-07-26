'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useAnimationFrame } from 'framer-motion';

// Exact logo list with accent colors
const LOGOS = [
  { id: 'react', name: 'React', src: 'https://cdn.simpleicons.org/react', color: '#61DAFB' },
  { id: 'next', name: 'Next.js', src: 'https://cdn.simpleicons.org/nextdotjs', color: '#000000' },
  { id: 'js', name: 'JavaScript', src: 'https://cdn.simpleicons.org/javascript', color: '#F7DF1E' },
  { id: 'html', name: 'HTML5', src: 'https://cdn.simpleicons.org/html5', color: '#E34F26' },
  { id: 'css', name: 'CSS3', src: 'https://cdn.simpleicons.org/css', color: '#1572B6' },
  { id: 'tailwind', name: 'Tailwind CSS', src: 'https://cdn.simpleicons.org/tailwindcss', color: '#06B6D4' },
  { id: 'gsap', name: 'GSAP', src: 'https://cdn.simpleicons.org/greensock', color: '#88CE02' },
  { id: 'three', name: 'Three.js', src: 'https://cdn.simpleicons.org/threedotjs', color: '#000000' },
  { id: 'node', name: 'Node.js', src: 'https://cdn.simpleicons.org/nodedotjs', color: '#339933' },
  { id: 'express', name: 'Express.js', src: 'https://cdn.simpleicons.org/express', color: '#475569' },
  { id: 'firebase', name: 'Firebase', src: 'https://cdn.simpleicons.org/firebase', color: '#FFCA28' },
  { id: 'supabase', name: 'Supabase', src: 'https://cdn.simpleicons.org/supabase', color: '#3ECF8E' },
  { id: 'mysql', name: 'MySQL', src: 'https://cdn.simpleicons.org/mysql', color: '#4479A1' },
  { id: 'openai', name: 'OpenAI', src: 'https://api.iconify.design/simple-icons/openai.svg?color=%2310a37f', color: '#10A37F' },
  { id: 'anthropic', name: 'Anthropic', src: 'https://cdn.simpleicons.org/anthropic', color: '#CC9966' },
  { id: 'gemini', name: 'Google Gemini', src: 'https://cdn.simpleicons.org/googlegemini', color: '#1A73E8' },
  { id: 'git', name: 'Git', src: 'https://cdn.simpleicons.org/git', color: '#F05032' },
  { id: 'github', name: 'GitHub', src: 'https://cdn.simpleicons.org/github', color: '#181717' },
  { id: 'figma', name: 'Figma', src: 'https://cdn.simpleicons.org/figma', color: '#F24E1E' },
  { id: 'vercel', name: 'Vercel', src: 'https://cdn.simpleicons.org/vercel', color: '#1E293B' },
  { id: 'netlify', name: 'Netlify', src: 'https://cdn.simpleicons.org/netlify', color: '#00C8BC' },
];

export default function MacDock() {
  const dockRef = useRef(null);
  const containerLeft = useRef(0);
  const mouseX = useMotionValue(Infinity);
  const trackX = useMotionValue(0);
  const scrollSpeed = useRef(0.7);
  const [windowWidth, setWindowWidth] = useState(1200);

  // Simulated open/active app states for realistic macOS UI feedback
  const [openIds, setOpenIds] = useState(['react', 'next', 'tailwind', 'github']);
  const [activeId, setActiveId] = useState('react');

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      updateContainerLeft();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Reduced sizing parameters to medium proportions
  const size = isMobile ? 56 : 84;
  const overlap = isMobile ? -10 : -16;
  const distanceLimit = isMobile ? 120 : 200; // wide boundary for cohesive wave

  // Duplicate logos list for infinite scrolling marquee loop
  const duplicatedTechnologies = [...LOGOS, ...LOGOS];

  // This track's scroll and each icon's own magnetism (`DockIcon` below) are
  // both driven by `useAnimationFrame`, which ticks forever regardless of
  // scroll position - Expertise sits mid-page, so without this the marquee
  // (plus all 42 duplicated icons' per-frame distance/scale math) kept
  // running in the background for the entire time the visitor was on the
  // page, including scrolled away to Philosophy/Contact. `inViewRef` is read
  // (not subscribed to) inside every one of those rAF callbacks so toggling
  // it doesn't itself trigger a re-render - same "check a ref inside the
  // frame callback" pattern already used for the section's `dockRef`.
  const inViewRef = useRef(true);
  useEffect(() => {
    const el = dockRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => { inViewRef.current = entry.isIntersecting; }, {
      rootMargin: '300px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Continuous marquee loop - runs constantly at a smooth speed (never stops on hover)
  useAnimationFrame((time, delta) => {
    if (!inViewRef.current) return;
    let currentX = trackX.get();
    const dt = delta ? delta / 16.6 : 1;
    currentX -= scrollSpeed.current * dt;

    const stride = size + overlap;
    const loopWidth = LOGOS.length * stride;
    if (currentX <= -loopWidth) {
      currentX += loopWidth;
    }
    trackX.set(currentX);
  });

  const updateContainerLeft = () => {
    if (dockRef.current) {
      containerLeft.current = dockRef.current.getBoundingClientRect().left;
    }
  };

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    updateContainerLeft();
  };

  const handleMouseLeave = () => {
    mouseX.set(Infinity);
  };

  const handleIconClick = (tech) => {
    setActiveId(tech.id);
    if (!openIds.includes(tech.id)) {
      setOpenIds([...openIds, tech.id]);
    }
  };

  return (
    <div className="w-full flex justify-center items-end select-none pb-4 relative z-[99] mt-16 overflow-hidden tech-marquee-mask py-8">
      {/* Scroll Marquee Container */}
      <div
        id="mac-dock"
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="pointer-events-auto flex items-end overflow-visible p-3 bg-transparent border-none shadow-none relative max-w-[95vw] cursor-pointer"
        style={{
          height: `${size + 36}px`,
        }}
      >
        {/* Continuously translates the elements infinitely without stopping */}
        <motion.div
          style={{ x: trackX }}
          className="flex items-end overflow-visible"
        >
          {duplicatedTechnologies.map((tech, idx) => {
            const isOpen = openIds.includes(tech.id);
            const isActive = activeId === tech.id;

            return (
              <DockIcon
                key={`${tech.id}-${idx}`}
                index={idx}
                tech={tech}
                mouseX={mouseX}
                trackX={trackX}
                containerLeft={containerLeft}
                isOpen={isOpen}
                isActive={isActive}
                onIconClick={handleIconClick}
                baseSize={size}
                distanceLimit={distanceLimit}
                overlap={idx === 0 ? 0 : overlap}
                inViewRef={inViewRef}
              />
            );
          })}
        </motion.div>
      </div>

      <style jsx>{`
        .tech-marquee-mask {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        }
      `}</style>
    </div>
  );
}

function DockIcon({
  index,
  tech,
  mouseX,
  trackX,
  containerLeft,
  isOpen,
  isActive,
  onIconClick,
  baseSize,
  distanceLimit,
  overlap,
  inViewRef,
}) {
  const [isBouncing, setIsBouncing] = useState(false);

  // Deterministic, organic rotations matching specification
  const defaultRotation = Math.sin(index * 2.3) * 5.2;

  // Dynamic target values mapped to responsive springs
  const scaleTarget = useMotionValue(1);
  const rotationTarget = useMotionValue(defaultRotation);
  const yTarget = useMotionValue(0);

  // Fluid physical spring configurations for liquid-like motion
  const scale = useSpring(scaleTarget, { stiffness: 150, damping: 25, mass: 0.2 });
  const rotation = useSpring(rotationTarget, { stiffness: 150, damping: 25, mass: 0.2 });
  const y = useSpring(yTarget, { stiffness: 150, damping: 25, mass: 0.2 });

  useAnimationFrame(() => {
    if (inViewRef && !inViewRef.current) return;
    const val = mouseX.get();
    if (val === Infinity) {
      scaleTarget.set(1);
      rotationTarget.set(defaultRotation);
      yTarget.set(0);
      return;
    }

    // Reflow-free mathematical viewport coordinates center tracking
    const currentTrackX = trackX.get();
    // p-3 padding is 12px
    const localX = index * (baseSize + overlap) + baseSize / 2 + 12;
    const centerX = containerLeft.current + currentTrackX + localX;
    const dist = val - centerX;

    let targetScale = 1;
    let targetRotation = defaultRotation;
    let targetY = 0;

    if (Math.abs(dist) < distanceLimit) {
      // Linear-cosine curve to create a wider, unified liquid wave
      const ratio = Math.abs(dist) / distanceLimit;
      const factor = Math.cos(ratio * (Math.PI / 2));

      targetScale = 1 + 0.3 * factor; // magnify up to 1.30x scale
      targetRotation = defaultRotation * (1 - factor); // straighten to 0deg
      targetY = -factor * 18; // lift pop-out vertically
    }

    scaleTarget.set(targetScale);
    rotationTarget.set(targetRotation);
    yTarget.set(targetY);
  });

  const handleClick = () => {
    if (isBouncing) return;
    setIsBouncing(true);
    onIconClick(tech);

    // macOS launch bounce sequence duration
    setTimeout(() => {
      setIsBouncing(false);
    }, 1200);
  };

  return (
    <div
      style={{
        marginLeft: `${overlap}px`,
        width: `${baseSize}px`,
        height: `${baseSize}px`,
      }}
      className="flex flex-col items-center justify-end relative select-none shrink-0"
    >
      <motion.button
        id={`dock-icon-${tech.id}`}
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          scale: scale,
          rotate: rotation,
          y: y,
          transformOrigin: 'center bottom',
        }}
        animate={
          isBouncing
            ? {
                y: [0, -42, 0, -22, 0, -10, 0],
              }
            : undefined
        }
        transition={
          isBouncing
            ? {
                duration: 1.2,
                ease: 'easeInOut',
              }
            : undefined
        }
        className="relative flex items-center justify-center rounded-[24%] p-[10%] bg-white border border-[#0b120e]/15 shadow-[0_10px_22px_-5px_rgba(11,18,14,0.08),0_4px_10px_-4px_rgba(11,18,14,0.04),inset_0_1.5px_2px_rgba(255,255,255,1)] hover:shadow-[0_20px_35px_-6px_rgba(11,18,14,0.14),0_10px_16px_-8px_rgba(11,18,14,0.08),inset_0_2px_3px_rgba(255,255,255,1)] transition-shadow duration-150 focus:outline-none overflow-hidden z-10 hover:z-20 cursor-pointer"
      >
        {/* Glow effect matching tech brand accents */}
        <div
          className="absolute inset-0 rounded-[24%] opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${tech.color} 0%, transparent 70%)`
          }}
        />

        <img
          src={tech.src}
          alt={tech.name}
          draggable={false}
          className="w-[82%] h-[82%] object-contain"
        />
      </motion.button>
    </div>
  );
}
