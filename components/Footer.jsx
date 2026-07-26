'use client';

import { Terminal, ArrowUp } from '@phosphor-icons/react';
import { useReducedMotion } from 'framer-motion';

// Same nav targets as Navbar.jsx's MENU_ITEMS - kept as a separate constant
// here (not imported) since Navbar's list is a component-local concern, but
// intentionally identical in content/order so the footer doesn't invent a
// different sitemap. No CTA link in this list on purpose - see the "no CTA"
// note on the component below.
const FOOTER_LINKS = [
  { name: 'Services', href: '#services' },
  { name: 'Expertise', href: '#expertise' },
  { name: 'Philosophy', href: '#philosophy' },
  { name: 'Contact', href: '#contact' },
];

const CONTACT_EMAIL = 'team@touchgrassdevs.foo';

// A simple, honest footer - brand mark + the same tagline already used in
// Hero's footnote row, real nav links, the real contact email already used
// in Contact.jsx, and a copyright + back-to-top row. Deliberately does NOT
// include: a third "Start a Project" CTA (would re-trigger the NO DUPLICATE
// CTA INTENT rule the Navbar CTA was removed for - Hero's CTA is still the
// only one on the page), any status dot / "systems operational" indicator
// (ZERO decorative status dots by default), a fabricated tech-stack or
// security-claims list (nothing to back those claims with), or a version/
// build string (banned outright on marketing pages). Same locked palette as
// the rest of the site - grass-accent for hover/interactive, gold-accent as
// the single small accent, sage scale for everything else.
export default function Footer() {
  const reduce = useReducedMotion();

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

  const handleScrollTop = () => {
    if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.scrollTo(0, { duration: reduce ? 0 : 1.1 });
    } else {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  return (
    <footer className="relative bg-white border-t border-luxury-border overflow-hidden">
      {/* Same soft-blur device used in Hero/Contact, kept faint at the very
          bottom of the page rather than introducing a new visual motif. */}
      <div className="absolute bottom-[-15%] right-[8%] w-[380px] h-[380px] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[8%] w-[380px] h-[380px] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-20 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-8 pb-10 border-b border-luxury-border">
          {/* Brand mark + tagline */}
          <div className="space-y-4 max-w-sm">
            <a href="#hero" onClick={scrollToHash('#hero')} className="inline-flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-lg bg-sage-950 flex items-center justify-center group-hover:bg-grass-accent transition-colors duration-300">
                <Terminal size={16} weight="bold" className="text-white" />
              </span>
              <span className="font-mono text-sm tracking-[0.2em] text-sage-950 font-bold uppercase">
                touchgrass<span className="text-gold-accent">.devs</span>
              </span>
            </a>
            <p className="text-xs text-sage-600 font-light leading-relaxed">
              Touch grass. Then build something great.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
                Navigation
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={scrollToHash(link.href)}
                      className="text-xs text-sage-600 hover:text-grass-accent transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
                Get in touch
              </h4>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-xs font-mono text-sage-600 hover:text-grass-accent transition-colors duration-300"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-mono text-sage-500 tracking-wide text-center sm:text-left">
            &copy; {new Date().getFullYear()} touchgrass.devs. All rights reserved.
          </div>

          <button
            type="button"
            onClick={handleScrollTop}
            aria-label="Back to top"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-sage-50 hover:bg-sage-100 border border-luxury-border hover:border-gold-accent/40 text-sage-600 hover:text-sage-950 transition-colors duration-300 cursor-pointer group"
          >
            <ArrowUp size={14} weight="bold" className="group-hover:-translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </footer>
  );
}
