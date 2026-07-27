'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion';
import { List, X, Terminal } from '@phosphor-icons/react';

// Only links to sections that actually exist yet. Philosophy and Contact
// are both in now that their sections exist (Contact replaces the
// blueprint's "Consultation" nav item, which was never built as such).
const MENU_ITEMS = [
  { name: 'Services', href: '#services' },
  { name: 'Expertise', href: '#expertise' },
  { name: 'Philosophy', href: '#philosophy' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const reduce = useReducedMotion();

  // In-page nav now routes through Lenis (`window.__lenis`, set by
  // `SmoothScroll.jsx`) instead of relying on the page-wide CSS
  // `scroll-behavior: smooth` default that used to live in globals.css -
  // that CSS rule and Lenis's own scroll-driven rAF loop were both trying
  // to own "smooth scrolling" at once, which could fight each other on an
  // anchor click. Lenis is now the single source of smooth scroll site-wide;
  // this is what makes that true for nav links specifically, not just wheel/
  // touch input. `offset: -96` mirrors every section's own `scroll-mt-24`
  // (96px) so links still land below the fixed nav exactly as before.
  // Falls back to native `scrollIntoView` (still smooth via its own
  // `behavior` option, independent of the CSS rule that's now gone) if
  // Lenis isn't mounted yet, or is skipped entirely under reduced motion.
  const scrollToHash = (hash) => (e) => {
    const id = hash.replace('#', '');
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.scrollTo(target, { offset: -96, duration: reduce ? 0 : 1.1 });
    } else {
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

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
    <header
      id="navbar"
      className="fixed top-0 left-0 w-full z-50 py-4 bg-white/25 backdrop-blur-lg border-b border-white/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        {/* Brand mark */}
        <a href="#hero" onClick={scrollToHash('#hero')} className="flex items-center gap-2.5 group">
          <span className="relative w-8 h-8 rounded-lg bg-sage-950 flex items-center justify-center group-hover:bg-grass-accent transition-colors duration-300">
            <Terminal size={16} weight="bold" className="text-white" />
          </span>
          <span className="font-mono text-sm tracking-[0.2em] text-sage-950 font-bold uppercase">
            touchgrass<span className="text-gold-accent">.devs</span>
          </span>
        </a>

        {/* Desktop nav — links only. The "Start a Project" CTA that used to
            sit here is gone (removed per request): it duplicated the Hero's
            own CTA intent, and design-taste-frontend's NO DUPLICATE CTA
            INTENT rule flags exactly that (two "contact" buttons visible at
            once). The Hero's CTA is the one and only "Start a Project" on
            the page now. */}
        <LayoutGroup id="navbar">
          <nav className="hidden md:flex items-center">
            <div className="flex items-center gap-8">
              {MENU_ITEMS.map((item) => {
                const isActive = activeSection === item.href.slice(1);
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={scrollToHash(item.href)}
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
                  onClick={(e) => {
                    scrollToHash(item.href)(e);
                    setIsOpen(false);
                  }}
                  className="py-3 text-xs font-bold tracking-[0.2em] text-sage-600 uppercase border-b border-luxury-border/60 last:border-0 transition-colors duration-300 hover:text-sage-950"
                >
                  {item.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
