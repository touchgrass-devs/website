'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Ported from the "kay" project's logo train: a 3D-perspective, always-scrolling
// logo marquee where hovering one logo pops it forward (scale/lift/straighten,
// colored glow matched to the brand) while the rest dim slightly to focus
// attention on it. Replaces the plainer grayscale-hover loop this section had.
export default function TechMarquee({ items }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const reduce = useReducedMotion();

  // Detect mobile viewport size to adjust hover scale
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Double the list to ensure a seamless infinite loop
  const doubledItems = [...items, ...items];

  return (
    <div className="relative w-full py-10 overflow-hidden select-none">

      {/* Soft radial background glow behind the marquee track */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(63,174,106,0.06),transparent_70%)] pointer-events-none" />

      {/* Screen-reader hidden list of technologies */}
      <span className="sr-only">
        Technologies loop: {items.map((t) => t.name).join(', ')}.
      </span>

      {/* 3D Perspective container */}
      <div
        className="tech-marquee-mask overflow-visible py-8"
        style={{ perspective: '1000px' }}
      >

        {/* Continuous scrolling track - scrolling never pauses */}
        <div
          className={`tech-marquee-track flex items-center w-max gap-0 ${
            reduce ? '' : 'animate-marquee-scroll'
          }`}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {doubledItems.map((item, i) => {
            const isHovered = hoveredIndex === i;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <div
                key={`${item.name}-${i}`}
                className="relative shrink-0 mx-2 sm:mx-3 md:mx-4 py-4"
                style={{
                  transformStyle: 'preserve-3d',
                  zIndex: isHovered ? 50 : (isAnyHovered ? 5 : 10)
                }}
              >
                <motion.div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  animate={{
                    scale: isHovered ? (isMobile ? 1.35 : 1.8) : (isAnyHovered ? 0.8 : 1.0),
                    opacity: isHovered ? 1.0 : (isAnyHovered ? 0.45 : 1.0),
                    rotate: isHovered ? 0 : -6, // Leans slightly, straightens on hover
                    y: isHovered ? -16 : 0,     // Lift up
                    z: isHovered ? 60 : 0,      // Pop out along Z-axis
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 220,
                    damping: 18
                  }}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    // Use drop-shadow filter to shape the glow outline directly to the transparent SVG logo paths
                    filter: isHovered
                      ? `drop-shadow(0 14px 24px ${item.color}5a) drop-shadow(0 4px 8px ${item.color}24)`
                      : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04))',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform'
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    draggable={false}
                    className={`h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 object-contain transition-all duration-300 ${
                      isHovered ? 'brightness-[1.05] saturate-[1.25]' : 'grayscale-[15%] opacity-90'
                    }`}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
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
        .animate-marquee-scroll {
          animation: marquee-loop 26s linear infinite;
        }
        @keyframes marquee-loop {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
