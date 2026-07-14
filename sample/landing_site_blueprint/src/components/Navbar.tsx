import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Terminal, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Services", href: "#services" },
    { name: "Expertise", href: "#tech-stack" },
    { name: "Philosophy", href: "#philosophy" },
    { name: "Consultation", href: "#contact" },
  ];

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? "py-4 bg-white/80 backdrop-blur-md border-b border-luxury-border shadow-sm" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-lg bg-sage-900 flex items-center justify-center border border-sage-800 group-hover:bg-grass-accent transition-colors duration-500">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="font-mono text-sm tracking-[0.22em] text-sage-900 font-bold uppercase">
            touchgrass<span className="text-gold-accent">.DEVS</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-xs font-semibold tracking-[0.15em] text-sage-600 hover:text-sage-950 uppercase transition-colors duration-300 relative py-1.5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-grass-accent after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-500"
              >
                {item.name}
              </a>
            ))}
          </div>
          
          <a
            href="#contact"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-sage-950 hover:bg-grass-accent text-white text-xs font-mono tracking-wider font-semibold uppercase shadow-md hover:shadow-lg transition-all duration-400"
          >
            Start Project
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-sage-700 hover:text-sage-950 hover:bg-sage-100 border border-transparent hover:border-luxury-border transition-all duration-300"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden w-full bg-white border-b border-luxury-border overflow-hidden shadow-lg"
          >
            <div className="px-6 py-8 flex flex-col gap-5">
              {menuItems.map((item, idx) => (
                <motion.a
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold tracking-[0.2em] text-sage-600 hover:text-sage-950 uppercase py-2 transition-colors duration-300 border-b border-luxury-border/50 last:border-0"
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.a
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-sage-950 text-white text-xs font-mono tracking-widest font-semibold uppercase mt-2 shadow-md hover:bg-grass-accent transition-all duration-300 active:scale-[0.98]"
              >
                Start Project
                <ArrowUpRight className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
