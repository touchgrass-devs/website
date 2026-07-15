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

const fieldLabel =
  'text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold';
const fieldInput =
  'w-full px-4 py-3 rounded-xl bg-sage-50 border border-luxury-border text-sm text-sage-900 placeholder-sage-500 focus:outline-none focus:border-grass-accent focus:ring-1 focus:ring-grass-accent transition-colors duration-300';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      projectType: prev.projectType === type ? '' : type,
    }));
  };

  // No backend is wired up yet (project decision: ship the UI first, connect
  // a real email/API endpoint later). This only simulates a submit locally -
  // do not treat the success state below as proof anything was actually
  // sent anywhere until a real endpoint replaces this timeout.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', projectType: '', message: '' });
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-sage-950 leading-[1.15] pb-1">
            Tell us what
            <br />
            you&rsquo;re <span className="italic font-light text-sage-500">building.</span>
          </h2>
          <p className="mt-5 text-sm sm:text-base text-sage-600 font-light leading-relaxed max-w-md">
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
              className="group inline-flex items-center gap-2.5 text-base sm:text-lg font-mono text-sage-800 hover:text-grass-accent transition-colors duration-300"
            >
              <EnvelopeSimple size={18} weight="bold" className="shrink-0 text-gold-accent" />
              <span className="border-b border-transparent group-hover:border-grass-accent transition-colors duration-300">
                {CONTACT_EMAIL}
              </span>
            </a>
            <p className="text-xs text-sage-500 leading-relaxed font-light max-w-[26ch]">
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
            <div className="bg-white rounded-[28px] border border-luxury-border shadow-sm p-8 md:p-10 relative overflow-hidden">
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
                          className={fieldInput}
                        />
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
                          className={fieldInput}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className={fieldLabel}>Project type (optional)</span>
                      <div className="flex flex-wrap gap-2">
                        {PROJECT_TYPES.map((type) => {
                          const isSelected = formData.projectType === type;
                          return (
                            <button
                              type="button"
                              key={type}
                              onClick={() => handleTypeSelect(type)}
                              aria-pressed={isSelected}
                              className={`px-4 py-2 rounded-xl text-xs font-sans tracking-wide transition-colors duration-300 border cursor-pointer ${
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
                        className={`${fieldInput} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-xl bg-sage-950 hover:bg-grass-accent text-white font-sans font-bold tracking-wider text-xs uppercase shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
                      <h3 className="text-2xl font-sans font-bold text-sage-950 tracking-tight">
                        Thanks for reaching out.
                      </h3>
                      <p className="text-sm text-sage-600 font-light max-w-sm mx-auto leading-relaxed">
                        Your message is in. We&rsquo;ll get back to you within
                        a couple of business days.
                      </p>
                    </div>
                    <button
                      onClick={resetForm}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-luxury-border text-[10px] font-mono uppercase text-sage-600 hover:text-sage-950 hover:border-grass-accent transition-colors duration-300 cursor-pointer"
                    >
                      <ArrowCounterClockwise size={13} weight="bold" />
                      Send another message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
