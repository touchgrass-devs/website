'use client';

import { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { List, X, Terminal, ArrowUpRight } from '@phosphor-icons/react';

// Only links to sections that actually exist yet - Consultation from the
// blueprint's nav still isn't built, so it stays out until it is. Philosophy
// is back in now that its section exists.
const MENU_ITEMS = [
  { name: 'Services', href: '#services' },
  { name: 'Expertise', href: '#expertise' },
  { name: 'Philosophy', href: '#philosophy' },
];

// Magnetic pull: cursor position offsets the button via spring-smoothed
// motion values, never useState, per the magnetic-micro-physics rule.
function MagneticCTA({ href, className, children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.45);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const lastY = useRef(0);

  // Background swap + direction-aware hide/reveal. Nav only hides once it's
  // past its own height, and never while the mobile drawer is open.
  useEffect(() => {
    lastY.current = window.scrollY;

    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);

      const delta = y - lastY.current;
      if (y < 96) {
        setHidden(false);
      } else if (delta > 4) {
        setHidden(true);
      } else if (delta < -4) {
        setHidden(false);
      }
      lastY.current = y;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-spy: whichever section sits in the middle band of the viewport
  // becomes "active" so the underline can track it.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    MENU_ITEMS.forEach((item) => {
      const el = document.getElementById(item.href.slice(1));
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      id="navbar"
      animate={{ y: isOpen ? 0 : hidden ? '-100%' : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        scrolled
          ? 'py-3.5 bg-white/80 backdrop-blur-md border-b border-luxury-border shadow-sm'
          : 'py-5 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        {/* Brand mark */}
        <a href="#hero" className="flex items-center gap-2.5 group">
          <span className="relative w-8 h-8 rounded-lg bg-sage-950 flex items-center justify-center group-hover:bg-grass-accent transition-colors duration-300">
            <Terminal size={16} weight="bold" className="text-white" />
          </span>
          <span className="font-mono text-sm tracking-[0.2em] text-sage-950 font-bold uppercase">
            touchgrass<span className="text-gold-accent">.devs</span>
          </span>
        </a>

        {/* Desktop nav */}
        <LayoutGroup id="navbar">
          <nav className="hidden md:flex items-center gap-9">
            <div className="flex items-center gap-8">
              {MENU_ITEMS.map((item) => {
                const isActive = activeSection === item.href.slice(1);
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`relative py-1.5 text-xs font-semibold tracking-[0.15em] uppercase transition-colors duration-300 ${
                      isActive
                        ? 'text-sage-950'
                        : 'text-sage-600 hover:text-sage-950 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:origin-right after:scale-x-0 after:bg-grass-accent after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-underline"
                        className="absolute bottom-0 left-0 h-[1.5px] w-full bg-grass-accent"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            <MagneticCTA
              href="#contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-sage-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-colors duration-300 hover:bg-grass-accent hover:shadow-lg"
            >
              Start a Project
              <ArrowUpRight size={14} weight="bold" />
            </MagneticCTA>
          </nav>
        </LayoutGroup>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-sage-700 border border-transparent hover:border-luxury-border hover:text-sage-950 transition-colors duration-300"
        >
          {isOpen ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-white border-b border-luxury-border shadow-lg"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {MENU_ITEMS.map((item, idx) => (
                <motion.a
                  key={item.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="py-3 text-xs font-bold tracking-[0.2em] text-sage-600 uppercase border-b border-luxury-border/60 last:border-0 transition-colors duration-300 hover:text-sage-950"
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.a
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: MENU_ITEMS.length * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                whileTap={{ scale: 0.96 }}
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-sage-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-colors duration-300"
              >
                Start a Project
                <ArrowUpRight size={14} weight="bold" />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
