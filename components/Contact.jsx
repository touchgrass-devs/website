'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeSimple,
  PaperPlaneRight,
  CheckCircle,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';

// Honest, human labels for the four real service categories from aboutus.md -
// not a copy of the blueprint's formal titles, just a shorter plain-English
// version of the same four things. Optional field, not a required taxonomy.
const PROJECT_TYPES = ['Website', 'Web App', 'AI & Automation', 'Ongoing Support'];

const CONTACT_EMAIL = 'team@touchgrassdevs.foo';

// text-sage-400 measured ~2.5:1 against white and placeholder-sage-500
// measured ~4.2:1 against bg-sage-50 - both under WCAG AA's 4.5:1 body-text
// floor (impeccable's mandatory contrast check). Bumped one step darker on
// the existing sage ramp - no new colors, same tokens as the rest of the
// page, just the correct step.
const fieldLabel =
  'text-[10px] font-mono tracking-widest text-sage-500 uppercase font-bold';

// A function, not a static string: the error variant needs to fully replace
// the border/focus-ring utilities rather than have a second class appended
// after them, since Tailwind's generated stylesheet order (not className
// string order) decides which utility wins when two touch the same
// property. Red here is a semantic validation color, not a second brand
// accent - reused from Tailwind's own default scale, not a new token.
const fieldInputClass = (hasError) =>
  `w-full px-4 py-3 rounded-xl bg-sage-50 border text-sm text-sage-900 placeholder-sage-600 focus:outline-none focus:ring-1 transition-colors duration-300 ${
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
      : 'border-luxury-border focus:border-grass-accent focus:ring-grass-accent'
  }`;
const fieldError = 'mt-1.5 text-[11px] text-red-600';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
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

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      projectType: prev.projectType === type ? '' : type,
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
    setFormData({ name: '', email: '', projectType: '', message: '' });
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
        {/* Intro - no eyebrow; headline carries the section on its own. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-sage-950 leading-[1.15] pb-1">
            Tell us what
            <br />
            you&rsquo;re <span className="italic font-light text-sage-500">building.</span>
          </h2>
          <p className="text-pretty mt-5 text-sm sm:text-base text-sage-600 font-light leading-relaxed max-w-md">
            Four developers, one inbox. You&rsquo;ll hear back directly from
            whoever&rsquo;s the right fit, not an account manager.
          </p>
        </motion.div>

        {/* Mobile fallback: grid-cols-1 stacks left info above the form card
            below `lg`; no separate mobile layout needed beyond that. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-16 md:mt-20">
          {/* Left column: direct contact + intentionally kept light. Reserved
              space below this block is deliberate - a future element goes
              here later, don't fill it with more copy in the meantime. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 space-y-4"
          >
            <span className="block text-xs font-bold uppercase tracking-wider text-sage-900">
              Prefer email?
            </span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group inline-flex items-center gap-2.5 text-base sm:text-lg font-mono text-sage-800 hover:text-grass-accent focus-visible:text-grass-accent focus-visible:outline-none transition-colors duration-300"
            >
              <EnvelopeSimple size={18} weight="bold" className="shrink-0 text-gold-accent" />
              <span className="border-b border-transparent group-hover:border-grass-accent group-focus-visible:border-grass-accent transition-colors duration-300">
                {CONTACT_EMAIL}
              </span>
            </a>
            {/* sage-500 measured ~4.2:1 against bg-luxury-bg here, just under
                the 4.5:1 body-text floor - bumped to sage-600 (~6.9:1). */}
            <p className="text-pretty text-xs text-sage-600 leading-relaxed font-light max-w-[26ch]">
              We read every message ourselves. Usually a reply within a
              couple of business days.
            </p>
            {/* Reserved: intentionally left open, a visual/element is planned
                for this column later - do not fill with more copy. */}
          </motion.div>

          {/* Right column: the actual form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8"
          >
            {/* `layout` here smooths the card's own height change when the
                (taller) form swaps for the (shorter) success state - without
                it the height snaps instantly, which reads as a jump/CLS
                even though each child's own opacity/scale transition is
                smooth. aria-live announces the swap for screen readers. */}
            <motion.div
              layout
              transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              aria-live="polite"
              className="bg-white rounded-[28px] border border-luxury-border shadow-sm p-8 md:p-10 relative overflow-hidden"
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
                        <label htmlFor="contact-name" className={fieldLabel}>
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
                        <label htmlFor="contact-email" className={fieldLabel}>
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
                      <span className={fieldLabel}>Project Type (optional)</span>
                      <div className="flex flex-wrap gap-2">
                        {PROJECT_TYPES.map((type) => {
                          const isSelected = formData.projectType === type;
                          return (
                            <button
                              type="button"
                              key={type}
                              onClick={() => handleTypeSelect(type)}
                              aria-pressed={isSelected}
                              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-sans tracking-wide transition-colors duration-300 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grass-accent focus-visible:ring-offset-2 ${
                                isSelected
                                  ? 'bg-sage-950 text-white border-sage-950 font-semibold'
                                  : 'bg-sage-50 border-luxury-border text-sage-600 hover:text-sage-950 hover:border-sage-400'
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contact-message" className={fieldLabel}>
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={5}
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
                      className="w-full py-4 rounded-xl bg-sage-950 hover:bg-grass-accent text-white font-sans font-bold tracking-wider text-xs uppercase shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grass-accent focus-visible:ring-offset-2"
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
                      <div className="w-14 h-14 rounded-full bg-grass-accent/10 flex items-center justify-center border border-grass-accent/20">
                        <CheckCircle size={28} weight="bold" className="text-grass-accent" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-balance text-2xl font-sans font-bold text-sage-950 tracking-tight">
                        Thanks for reaching out.
                      </h3>
                      <p className="text-pretty text-sm text-sage-600 font-light max-w-sm mx-auto leading-relaxed">
                        Your message is in. We&rsquo;ll get back to you within
                        a couple of business days.
                      </p>
                    </div>
                    <button
                      onClick={resetForm}
                      className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-luxury-border text-[10px] font-mono uppercase text-sage-600 hover:text-sage-950 hover:border-grass-accent transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grass-accent focus-visible:ring-offset-2"
                    >
                      <ArrowCounterClockwise size={13} weight="bold" />
                      Send another message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
