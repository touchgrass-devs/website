import { motion } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.15,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 md:px-12 bg-luxury-bg overflow-hidden"
    >
      {/* Light subtle warm gradients */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[50%] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[40%] h-[40%] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      {/* Hero Outer Frame - replicating the gorgeous rounded bezel of the reference design */}
      <div className="w-full max-w-7xl mx-auto rounded-[32px] bg-white border border-luxury-border shadow-sm relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-16 min-h-[85vh]">
        
        {/* subtle structural dither overlay / matrix grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none z-0" />

        {/* Dithered Hand Graphics representing touch grass & premium creation (Michaelangelo-inspired dither/particle hand SVGs matching the image's dither hands) */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-between opacity-[0.25] sm:opacity-[0.35] md:opacity-[0.45] mix-blend-multiply select-none">
          {/* Left Hand SVG (reaching in) */}
          <div className="w-1/3 sm:w-1/2 h-full relative transform -translate-x-12 translate-y-24 md:translate-y-16 scale-90 sm:scale-100">
            <svg viewBox="0 0 400 300" className="w-full h-full text-sage-400">
              {/* Pattern of elegant dithered circles of varying opacities */}
              <g fill="currentColor">
                <circle cx="50" cy="180" r="1.5" opacity="0.1" />
                <circle cx="70" cy="175" r="2" opacity="0.2" />
                <circle cx="90" cy="170" r="2" opacity="0.3" />
                <circle cx="110" cy="165" r="2.5" opacity="0.4" />
                <circle cx="130" cy="160" r="3" opacity="0.5" />
                <circle cx="150" cy="155" r="3.5" opacity="0.6" />
                <circle cx="170" cy="150" r="3" opacity="0.7" />
                <circle cx="190" cy="148" r="4" opacity="0.8" />
                <circle cx="210" cy="150" r="4.5" opacity="0.9" />
                <circle cx="230" cy="160" r="4" opacity="1" />
                
                {/* Finger dots */}
                <circle cx="245" cy="152" r="3" opacity="0.9" />
                <circle cx="260" cy="145" r="2.5" opacity="0.8" />
                <circle cx="275" cy="140" r="2" opacity="0.6" />
                
                <circle cx="250" cy="165" r="3.5" opacity="0.95" />
                <circle cx="270" cy="165" r="3" opacity="0.85" />
                <circle cx="285" cy="165" r="2.5" opacity="0.7" />
                
                <circle cx="245" cy="178" r="3.5" opacity="0.9" />
                <circle cx="265" cy="183" r="3" opacity="0.75" />
                <circle cx="280" cy="188" r="2" opacity="0.5" />

                {/* Wrist / Arm Structure dots */}
                <circle cx="130" cy="185" r="2.5" opacity="0.4" />
                <circle cx="150" cy="180" r="3" opacity="0.5" />
                <circle cx="170" cy="175" r="3" opacity="0.6" />
                <circle cx="190" cy="172" r="3.5" opacity="0.7" />
                <circle cx="110" cy="190" r="2" opacity="0.3" />
                <circle cx="90" cy="195" r="1.5" opacity="0.2" />
                <circle cx="70" cy="200" r="1.5" opacity="0.1" />

                {/* Additional dither dots to give a digital cloud look */}
                <circle cx="160" cy="130" r="1.5" opacity="0.3" />
                <circle cx="180" cy="132" r="2" opacity="0.4" />
                <circle cx="200" cy="135" r="2.5" opacity="0.6" />
                <circle cx="220" cy="140" r="3" opacity="0.7" />
                
                {/* Thumb */}
                <circle cx="195" cy="190" r="3.5" opacity="0.85" />
                <circle cx="208" cy="205" r="3" opacity="0.75" />
                <circle cx="218" cy="218" r="2" opacity="0.5" />
              </g>
            </svg>
          </div>

          {/* Right Hand SVG (reaching in) */}
          <div className="w-1/3 sm:w-1/2 h-full relative transform translate-x-12 translate-y-24 md:translate-y-16 scale-90 sm:scale-100">
            <svg viewBox="0 0 400 300" className="w-full h-full text-sage-400">
              <g fill="currentColor">
                <circle cx="350" cy="180" r="1.5" opacity="0.1" />
                <circle cx="330" cy="175" r="2" opacity="0.2" />
                <circle cx="310" cy="170" r="2" opacity="0.3" />
                <circle cx="290" cy="165" r="2.5" opacity="0.4" />
                <circle cx="270" cy="160" r="3" opacity="0.5" />
                <circle cx="250" cy="155" r="3.5" opacity="0.6" />
                <circle cx="230" cy="150" r="3" opacity="0.7" />
                <circle cx="210" cy="148" r="4" opacity="0.8" />
                <circle cx="190" cy="150" r="4.5" opacity="0.9" />
                <circle cx="170" cy="160" r="4" opacity="1" />
                
                {/* Finger dots */}
                <circle cx="155" cy="152" r="3" opacity="0.9" />
                <circle cx="140" cy="145" r="2.5" opacity="0.8" />
                <circle cx="125" cy="140" r="2" opacity="0.6" />
                
                <circle cx="150" cy="165" r="3.5" opacity="0.95" />
                <circle cx="130" cy="165" r="3" opacity="0.85" />
                <circle cx="115" cy="165" r="2.5" opacity="0.7" />
                
                <circle cx="155" cy="178" r="3.5" opacity="0.9" />
                <circle cx="135" cy="183" r="3" opacity="0.75" />
                <circle cx="120" cy="188" r="2" opacity="0.5" />

                {/* Wrist / Arm Structure dots */}
                <circle cx="270" cy="185" r="2.5" opacity="0.4" />
                <circle cx="250" cy="180" r="3" opacity="0.5" />
                <circle cx="230" cy="175" r="3" opacity="0.6" />
                <circle cx="210" cy="172" r="3.5" opacity="0.7" />
                <circle cx="290" cy="190" r="2" opacity="0.3" />
                <circle cx="310" cy="195" r="1.5" opacity="0.2" />
                <circle cx="330" cy="200" r="1.5" opacity="0.1" />

                {/* Additional dither dots */}
                <circle cx="240" cy="130" r="1.5" opacity="0.3" />
                <circle cx="220" cy="132" r="2" opacity="0.4" />
                <circle cx="200" cy="135" r="2.5" opacity="0.6" />
                <circle cx="180" cy="140" r="3" opacity="0.7" />
                
                {/* Thumb */}
                <circle cx="205" cy="190" r="3.5" opacity="0.85" />
                <circle cx="192" cy="205" r="3" opacity="0.75" />
                <circle cx="182" cy="218" r="2" opacity="0.5" />
              </g>
            </svg>
          </div>
        </div>

        {/* Empty spacing for top symmetry matching header */}
        <div className="hidden sm:block h-6" />

        {/* Main Central Content Area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center justify-center text-center my-auto max-w-3xl mx-auto px-2"
        >
          {/* Main Slogan Headings mimicking the reference image */}
          <motion.h1 
            variants={childVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-sans tracking-tight text-sage-900 leading-[1.08]"
          >
            <span className="font-light text-sage-500 block mb-2">Discover New Interfaces</span>
            <span className="font-semibold font-display italic block text-sage-950">and Build the Future</span>
          </motion.h1>

          {/* Subtext description matching text block */}
          <motion.p
            variants={childVariants}
            className="mt-6 text-sm sm:text-base text-sage-600 font-light leading-relaxed max-w-xl"
          >
            From concept to creation, we deliver the clean visual systems, scalable codebases, and seamless integrations to transform big ideas.
          </motion.p>

          {/* Central Pill Button mimicking "Join our world" */}
          <motion.div variants={childVariants} className="mt-8">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-sage-950 hover:bg-grass-accent text-white font-sans text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join our world
            </a>
          </motion.div>
        </motion.div>

        {/* FOOTNOTE MATRIX: Replicating the minimal left, center, and right footers */}
        <div className="relative z-10 border-t border-luxury-border/60 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-sage-500 select-none">
          {/* Left Footnote */}
          <div className="w-full sm:w-1/3 text-center sm:text-left">
            The journey begins in stillness.
          </div>

          {/* Center Footnote */}
          <div className="w-full sm:w-1/3 text-center max-w-xs leading-normal">
            A tranquil space for software craftsmanship, bespoke interfaces, and guided engineering. No noise. Just premium execution.
          </div>

          {/* Right Footnote */}
          <div className="w-full sm:w-1/3 text-center sm:text-right flex items-center justify-center sm:justify-end gap-1.5">
            <button 
              onClick={() => {
                document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-grass-accent transition-colors flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            >
              [Scroll to Explore]
              <ArrowDown className="w-3 h-3 text-gold-accent" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
