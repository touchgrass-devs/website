'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  EnvelopeSimple,
  GithubLogo,
  PaperPlaneRight,
  CheckCircle,
  ArrowCounterClockwise,
  Check,
} from '@phosphor-icons/react';

// Honest, human labels for the four real service categories from aboutus.md -
// not a copy of the blueprint's formal titles, just a shorter plain-English
// version of the same four things. Optional field, not a required taxonomy.
const PROJECT_TYPES = ['Website', 'Web App', 'AI & Automation', 'Ongoing Support'];

const CONTACT_EMAIL = 'team@touchgrassdevs.foo';
const GITHUB_HANDLE = 'touchgrasscodes';
const GITHUB_URL = `https://github.com/${GITHUB_HANDLE}`;

// Light-panel field styles reused as-is from the previous build (WCAG-AA
// checked: text-sage-500/600 both clear 4.5:1 against white/luxury-bg).
const fieldLabelLight =
  'text-[10px] font-mono tracking-widest text-white/50 uppercase font-bold';

// Dark-panel counterparts - the form now lives on a near-black glass surface
// (sage-950 + a soft grass-accent glow) rather than the white card it used
// to sit in, so labels/inputs/errors all needed a parallel dark-mode set.
// Functions, not static strings: the error variant needs to fully replace
// the border/focus-ring utilities rather than have a second class appended
// after them, since Tailwind's generated stylesheet order (not className
// string order) decides which utility wins when two touch the same property.
const fieldInputClass = (hasError) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border text-sm text-white placeholder-white/35 focus:outline-none focus:ring-1 transition-colors duration-300 ${
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
      : 'border-white/15 focus:border-grass-accent focus:ring-grass-accent'
  }`;
const fieldError = 'mt-1.5 text-[11px] text-red-400';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectTypes: [],
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Only surface validation errors after a submit attempt, not while the
  // visitor is still filling the form in - errors appear the moment they're
  // relevant and clear themselves the moment a field becomes valid again,
  // without ever flashing red on a form nobody has tried to submit yet.
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Genuinely multi-select now (visual is a checkbox grid, so the behavior
  // matches what it looks like) - a project can legitimately span more than
  // one category, e.g. a website that also needs ongoing support.
  const handleTypeToggle = (type) => {
    setFormData((prev) => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter((t) => t !== type)
        : [...prev.projectTypes, type],
    }));
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const errors = {
    name: submitAttempted && !formData.name.trim() ? 'Enter your name.' : null,
    email: submitAttempted
      ? !formData.email.trim()
        ? 'Enter your email.'
        : !isValidEmail(formData.email)
          ? 'Enter a valid email address.'
          : null
      : null,
    message: submitAttempted && !formData.message.trim() ? 'Tell us a bit about the project.' : null,
  };

  // No backend is wired up yet (project decision: ship the UI first, connect
  // a real email/API endpoint later). This only simulates a submit locally -
  // do not treat the success state below as proof anything was actually
  // sent anywhere until a real endpoint replaces this timeout.
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!formData.name.trim() || !isValidEmail(formData.email) || !formData.message.trim()) {
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', projectTypes: [], message: '' });
    setSubmitAttempted(false);
    setSubmitted(false);
  };

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 bg-luxury-bg border-t border-luxury-border overflow-hidden scroll-mt-24"
    >
      {/* Ambient orbs - same soft-blur device used in Hero, matches the page's
          established visual language rather than introducing a new one. */}
      <div className="absolute top-[8%] right-[-8%] w-[480px] h-[480px] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-[5%] left-[-10%] w-[480px] h-[480px] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Single split card: white info panel + dark glass form panel,
            sharp shared edge between them (no gap), one outer radius clips
            both via overflow-hidden. Replaces the previous free-floating
            two-column layout - format follows the reference the client
            supplied, palette and detailing follow our own tokens. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[28px] border border-luxury-border shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Left: info panel - brand mark, direct contact rows, response
              time. Light surface, deliberately quiet next to the dark form. */}
          <div className="lg:col-span-5 bg-white p-8 md:p-10 lg:p-12 flex flex-col justify-between gap-12">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-sage-950 flex items-center justify-center shrink-0">
                <Terminal size={16} weight="bold" className="text-white" />
              </span>
              <span className="font-mono text-xs tracking-[0.2em] text-sage-950 font-bold uppercase">
                touchgrass<span className="text-gold-accent">.devs</span>
              </span>
            </div>

            <div className="space-y-6">
              <span className="block text-[10px] font-mono tracking-widest text-sage-500 uppercase font-bold">
                Get in touch
              </span>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group flex items-center gap-3.5"
              >
                <span className="w-11 h-11 rounded-xl bg-sage-50 border border-luxury-border flex items-center justify-center shrink-0 group-hover:border-grass-accent group-focus-visible:border-grass-accent transition-colors duration-300">
                  <EnvelopeSimple size={18} weight="bold" className="text-gold-accent" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono tracking-widest text-sage-500 uppercase font-bold">
                    Email
                  </span>
                  <span className="text-sm font-mono text-sage-800 group-hover:text-grass-accent group-focus-visible:text-grass-accent transition-colors duration-300 truncate">
                    {CONTACT_EMAIL}
                  </span>
                </span>
              </a>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5"
              >
                <span className="w-11 h-11 rounded-xl bg-sage-50 border border-luxury-border flex items-center justify-center shrink-0 group-hover:border-grass-accent group-focus-visible:border-grass-accent transition-colors duration-300">
                  <GithubLogo size={18} weight="bold" className="text-gold-accent" />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono tracking-widest text-sage-500 uppercase font-bold">
                    GitHub
                  </span>
                  <span className="text-sm font-mono text-sage-800 group-hover:text-grass-accent group-focus-visible:text-grass-accent transition-colors duration-300 truncate">
                    @{GITHUB_HANDLE}
                  </span>
                </span>
              </a>
            </div>

            {/* sage-500 measured ~4.2:1 against white here, just under the
                4.5:1 body-text floor - bumped to sage-600 (~6.9:1). */}
            <p className="text-pretty text-xs text-sage-600 leading-relaxed font-light max-w-[30ch]">
              We read every message ourselves. Usually a reply within a
              couple of business days.
            </p>
          </div>

          {/* Right: dark glass form panel. */}
          <div className="lg:col-span-7 relative bg-sage-950 border-t lg:border-t-0 lg:border-l border-luxury-border p-8 md:p-10 lg:p-12 overflow-hidden">
            <div className="absolute top-[-15%] right-[-10%] w-[420px] h-[420px] rounded-full bg-grass-accent/25 premium-blur-orb pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-balance text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white leading-[1.15] pb-1">
                Tell us what
                <br />
                you&rsquo;re <span className="italic font-light text-white/50">building.</span>
              </h2>

              {/* `layout` smooths the panel's own height change when the
                  (taller) form swaps for the (shorter) success state -
                  without it the height snaps instantly, which reads as a
                  jump/CLS even though each child's own opacity/scale
                  transition is smooth. aria-live announces the swap for
                  screen readers. */}
              <motion.div
                layout
                transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                aria-live="polite"
                className="mt-8"
              >
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.form
                      key="contact-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSubmit}
                      className="space-y-7"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="contact-name" className={fieldLabelLight}>
                            Name *
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'contact-name-error' : undefined}
                            className={fieldInputClass(Boolean(errors.name))}
                          />
                          {errors.name && (
                            <p id="contact-name-error" role="alert" className={fieldError}>
                              {errors.name}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="contact-email" className={fieldLabelLight}>
                            Email *
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@company.com"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'contact-email-error' : undefined}
                            className={fieldInputClass(Boolean(errors.email))}
                          />
                          {errors.email && (
                            <p id="contact-email-error" role="alert" className={fieldError}>
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className={fieldLabelLight}>Project type (optional)</span>
                        <div className="grid grid-cols-2 gap-3">
                          {PROJECT_TYPES.map((type) => {
                            const isSelected = formData.projectTypes.includes(type);
                            return (
                              <button
                                type="button"
                                key={type}
                                onClick={() => handleTypeToggle(type)}
                                aria-pressed={isSelected}
                                className={`min-h-[44px] flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-sans tracking-wide text-left transition-colors duration-300 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grass-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sage-950 ${
                                  isSelected
                                    ? 'bg-grass-accent/15 border-grass-accent text-white font-semibold'
                                    : 'bg-white/5 border-white/15 text-white/60 hover:text-white hover:border-white/30'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors duration-300 ${
                                    isSelected ? 'bg-grass-accent border-grass-accent' : 'border-white/30'
                                  }`}
                                >
                                  {isSelected && <Check size={10} weight="bold" className="text-sage-950" />}
                                </span>
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="contact-message" className={fieldLabelLight}>
                          Message *
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="What are you trying to build, and what timeline are you working with?"
                          aria-invalid={Boolean(errors.message)}
                          aria-describedby={errors.message ? 'contact-message-error' : undefined}
                          className={`${fieldInputClass(Boolean(errors.message))} resize-none`}
                        />
                        {errors.message && (
                          <p id="contact-message-error" role="alert" className={fieldError}>
                            {errors.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-xl bg-grass-accent hover:bg-grass-accent-light text-white font-sans font-bold tracking-wider text-xs uppercase shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grass-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sage-950"
                      >
                        {submitting ? (
                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <PaperPlaneRight size={14} weight="bold" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="contact-success"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="py-10 text-center space-y-6"
                    >
                      <div className="flex justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
                          <CheckCircle size={28} weight="bold" className="text-grass-accent-light" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-balance text-2xl font-sans font-bold text-white tracking-tight">
                          Thanks for reaching out.
                        </h3>
                        <p className="text-pretty text-sm text-white/60 font-light max-w-sm mx-auto leading-relaxed">
                          Your message is in. We&rsquo;ll get back to you within
                          a couple of business days.
                        </p>
                      </div>
                      <button
                        onClick={resetForm}
                        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 text-[10px] font-mono uppercase text-white/70 hover:text-white hover:border-grass-accent transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grass-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sage-950"
                      >
                        <ArrowCounterClockwise size={13} weight="bold" />
                        Send another message
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
