import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, ChevronRight, Calendar, Sparkles, Database, History, Eye, X } from "lucide-react";
import { SERVICES } from "../data";
import { Inquiry } from "../types";

export default function InquirySection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    serviceCategory: SERVICES[0].title,
    budget: "$10,000 – $25,000",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<Inquiry | null>(null);
  const [localInquiries, setLocalInquiries] = useState<Inquiry[]>([]);
  const [showInquiriesDrawer, setShowInquiriesDrawer] = useState(false);

  // Load inquiries from localStorage
  useEffect(() => {
    const loaded = localStorage.getItem("touchgrass_inquiries");
    if (loaded) {
      try {
        setLocalInquiries(JSON.parse(loaded));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceSelect = (serviceTitle: string) => {
    setFormData({ ...formData, serviceCategory: serviceTitle });
  };

  const handleBudgetSelect = (budgetRange: string) => {
    setFormData({ ...formData, budget: budgetRange });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return;
    }

    setSubmitting(true);

    // Simulate luxury API response lag
    setTimeout(() => {
      const newInquiry: Inquiry = {
        id: "TGD-" + Math.floor(100000 + Math.random() * 900000),
        name: formData.name,
        email: formData.email,
        company: formData.company || "Independent Brand",
        serviceCategory: formData.serviceCategory,
        budget: formData.budget,
        message: formData.message,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        status: 'new'
      };

      const updated = [newInquiry, ...localInquiries];
      localStorage.setItem("touchgrass_inquiries", JSON.stringify(updated));
      setLocalInquiries(updated);
      setSubmittedInquiry(newInquiry);
      setSubmitting(false);

      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        serviceCategory: SERVICES[0].title,
        budget: "$10,000 – $25,000",
        message: ""
      });
    }, 1200);
  };

  const budgetOptions = [
    "<$5,000",
    "$5,000 – $10,000",
    "$10,000 – $25,000",
    "$25,000 – $50,000",
    "$50,000+"
  ];

  return (
    <section 
      id="contact" 
      className="py-24 md:py-32 bg-luxury-bg relative overflow-hidden border-t border-luxury-border"
    >
      {/* Light subtle visual gradients */}
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold-accent/5 premium-blur-orb pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-grass-accent/5 premium-blur-orb pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Floating Monitor Button for Submitted Inquiries */}
        {localInquiries.length > 0 && (
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setShowInquiriesDrawer(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-sage-50 border border-luxury-border hover:border-gold-accent/40 text-[10px] font-mono tracking-wider text-sage-600 hover:text-sage-950 transition-all duration-300 shadow-sm cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-gold-accent" />
              <span>Inquiries Drawer ({localInquiries.length})</span>
            </button>
          </div>
        )}

        {/* Section Heading */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
            <span className="text-xs font-mono tracking-[0.3em] text-gold-accent uppercase font-bold">
              COMMISSION INQUIRY
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-sage-950 leading-tight">
            Let's build something <br />
            <span className="text-sage-500 font-display italic font-light">spectacular together.</span>
          </h2>
        </div>

        {/* Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Process steps / Credentials */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-gold-accent uppercase font-bold">
                ENGAGEMENT MATRIX
              </span>
              <p className="text-xs sm:text-sm text-sage-600 leading-relaxed font-light">
                Our onboarding is structured to respect your time and provide absolute clarity. Every project is led directly by our principal designer and lead engineer.
              </p>
            </div>

            {/* Timed Milestone Steps */}
            <div className="space-y-6">
              {[
                {
                  num: "01",
                  title: "Direct Strategy Consultation",
                  desc: "A focused 30-minute scope blueprinting session directly with our lead architects. No sales pitch, just real engineering planning."
                },
                {
                  num: "02",
                  title: "Interactive UX & Visual Mapping",
                  desc: "We design comprehensive Figma wireframes, motion curves, and layout spacing systems to reflect your bespoke brand parameters."
                },
                {
                  num: "03",
                  title: "High-Performance Production Dev",
                  desc: "We write clean, semantic React/Next.js systems integrated with backend endpoints and optimized for instant loading speeds."
                }
              ].map((step, sIdx) => (
                <div key={sIdx} className="flex gap-5 group">
                  <span className="font-mono text-xs sm:text-sm text-gold-accent font-bold tracking-wider transition-colors">
                    {step.num}
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-sans text-xs font-bold text-sage-900 uppercase tracking-wider group-hover:text-sage-950 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs text-sage-500 leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Note Card */}
            <div className="p-6 rounded-2xl border border-luxury-border bg-white shadow-sm">
              <h5 className="font-sans text-xs font-bold text-gold-accent uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Current Availability
              </h5>
              <p className="text-xs text-sage-600 leading-relaxed font-light">
                We take a limited number of commissions per quarter to guarantee absolute quality. We are currently accepting select projects for <span className="text-sage-900 font-semibold">Q3/Q4 2026</span>.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Premium Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-luxury-border shadow-sm relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                {!submittedInquiry ? (
                  <motion.form
                    key="inquiry-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    {/* Step Title inside form */}
                    <div className="space-y-2">
                      <h3 className="font-sans text-xs font-bold text-sage-900 tracking-wide uppercase">
                        Project Brief Parameters
                      </h3>
                      <p className="text-xs text-sage-500 font-light">
                        Fill out the details below to initiate our secure evaluation pipeline.
                      </p>
                    </div>

                    {/* Choose Service Pills */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
                        1. Select Service Category
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICES.map((srv) => {
                          const isSelected = formData.serviceCategory === srv.title;
                          return (
                            <button
                              type="button"
                              key={srv.id}
                              onClick={() => handleServiceSelect(srv.title)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-sans tracking-wide transition-all duration-300 border cursor-pointer ${
                                isSelected
                                  ? "bg-sage-950 text-white border-sage-950 font-semibold shadow-sm"
                                  : "bg-sage-50 border-luxury-border text-sage-700 hover:text-sage-950 hover:border-sage-400"
                              }`}
                            >
                              {srv.title.split(" & ")[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Budget Selector */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
                        2. Project Budget Bracket
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {budgetOptions.map((opt) => {
                          const isSelected = formData.budget === opt;
                          return (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => handleBudgetSelect(opt)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-300 border cursor-pointer ${
                                isSelected
                                  ? "bg-gold-accent text-white border-gold-accent font-bold"
                                  : "bg-sage-50 border-luxury-border text-sage-600 hover:text-sage-900"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inputs Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g. Sterling Hunt"
                          className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-luxury-border text-xs text-sage-900 placeholder-sage-400 focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="e.g. client@brand.com"
                          className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-luxury-border text-xs text-sage-900 placeholder-sage-400 focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="e.g. Atelier Corp"
                        className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-luxury-border text-xs text-sage-900 placeholder-sage-400 focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all"
                      />
                    </div>

                    {/* Message Area */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono tracking-widest text-sage-400 uppercase font-bold">
                        Project Description *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Describe your goals, requirements, timeline constraints..."
                        className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-luxury-border text-xs text-sage-900 placeholder-sage-400 focus:outline-none focus:border-gold-accent focus:ring-1 focus:ring-gold-accent transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-xl bg-sage-950 hover:bg-grass-accent text-white font-sans font-bold tracking-wider text-xs uppercase shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Verifying Parameters...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Commission Brief</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  // Elegant Premium Success Display
                  <motion.div
                    key="success-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="py-12 text-center space-y-8"
                  >
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-gold-accent/10 flex items-center justify-center border border-gold-accent/20">
                        <CheckCircle2 className="w-8 h-8 text-gold-accent" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="font-mono text-xs text-gold-accent font-bold tracking-[0.25em] uppercase">
                        TRANSMISSION RECEIVED
                      </span>
                      <h3 className="text-2xl font-sans font-bold text-sage-950 tracking-tight leading-tight">
                        Commission Initiated Successfully
                      </h3>
                      <p className="text-xs text-sage-600 font-light max-w-sm mx-auto leading-relaxed">
                        Your strategic scope brief is safely securely queued for analysis. Our lead architects will contact you within 24 business hours.
                      </p>
                    </div>

                    {/* Secure ID Container */}
                    <div className="p-5 rounded-2xl bg-sage-50 border border-luxury-border max-w-xs mx-auto text-left font-mono space-y-2">
                      <div className="flex justify-between text-[10px] text-sage-400">
                        <span>CLIENT ID REFERENCE</span>
                        <span className="text-gold-accent font-semibold">SECURE</span>
                      </div>
                      <div className="text-sm font-semibold text-sage-900 tracking-wider">
                        {submittedInquiry.id}
                      </div>
                      <div className="text-[9px] text-sage-500 font-sans border-t border-luxury-border pt-1.5 flex justify-between items-center">
                        <span>Time: {submittedInquiry.createdAt.split(",")[0]}</span>
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Database className="w-3 h-3 text-emerald-500" /> Local Sync Active
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => setSubmittedInquiry(null)}
                        className="px-5 py-2.5 rounded-xl border border-luxury-border text-[10px] font-mono uppercase text-sage-600 hover:text-sage-950 hover:border-gold-accent transition-all cursor-pointer"
                      >
                        Submit another brief
                      </button>
                      <button
                        onClick={() => {
                          setSubmittedInquiry(null);
                          setShowInquiriesDrawer(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-sage-100 hover:bg-sage-200 text-[10px] font-mono uppercase text-grass-accent border border-luxury-border hover:border-grass-accent transition-all cursor-pointer"
                      >
                        View Secure Inquiries Drawer
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>

      {/* SECURE INQUIRIES DRAWER (DEMONSTRATING "CLIENT PORTAL" & "BUSINESS DASHBOARD") */}
      <AnimatePresence>
        {showInquiriesDrawer && (
          <div className="fixed inset-0 z-55 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInquiriesDrawer(false)}
              className="absolute inset-0 bg-sage-950/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-lg h-full bg-white border-l border-luxury-border shadow-2xl overflow-y-auto px-6 py-8 md:px-10 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-luxury-border pb-6 mb-8">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-gold-accent uppercase font-bold flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" /> CLIENT PORTAL ENGINE PREVIEW
                    </span>
                    <h3 className="font-sans text-sm font-bold text-sage-950 tracking-wide uppercase">
                      Commission Inquiries Monitor
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowInquiriesDrawer(false)}
                    className="p-2 rounded-lg bg-sage-50 hover:bg-sage-100 border border-luxury-border text-sage-600 hover:text-sage-950 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub title details */}
                <p className="text-xs text-sage-600 font-light leading-relaxed mb-6">
                  This secure viewer is powered by our <span className="text-gold-accent font-semibold">"Secure Client Portals"</span> and <span className="text-grass-accent font-semibold">"Cloud Database Integration"</span> systems. It displays local inquiries saved in real-time.
                </p>

                {/* Inquiry Cards list */}
                <div className="space-y-4">
                  {localInquiries.map((inq) => (
                    <div 
                      key={inq.id} 
                      className="p-5 rounded-2xl border border-luxury-border bg-sage-50/50 hover:border-gold-accent/30 transition-all duration-300 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-sage-900">
                          {inq.id}
                        </span>
                        <span className="text-[9px] font-mono text-sage-500 bg-white px-2 py-0.5 rounded border border-luxury-border">
                          {inq.createdAt.split(",")[0]}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs border-y border-luxury-border/80 py-3">
                        <div>
                          <span className="text-[10px] text-sage-400 block">CLIENT</span>
                          <span className="font-sans font-semibold text-sage-800">{inq.name}</span>
                          <span className="text-[10px] text-sage-500 block">{inq.company}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-sage-400 block">BUDGET BRACKET</span>
                          <span className="font-mono font-semibold text-gold-accent">{inq.budget}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-sage-400 block uppercase font-bold">SERVICE REQUESTED</span>
                        <span className="text-xs text-sage-800 font-sans font-semibold">{inq.serviceCategory}</span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] text-sage-400 block uppercase font-bold">PROJECT SUMMARY</span>
                        <p className="text-xs text-sage-600 italic leading-relaxed bg-white p-3 rounded-lg border border-luxury-border/50 font-light">
                          "{inq.message}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer footer */}
              <div className="border-t border-luxury-border pt-6 mt-8 flex justify-between items-center text-[10px] font-mono text-sage-400">
                <span>SYSTEM STATUS: ENCRYPTED LOCALSYNC</span>
                <button
                  onClick={() => {
                    localStorage.removeItem("touchgrass_inquiries");
                    setLocalInquiries([]);
                    setShowInquiriesDrawer(false);
                  }}
                  className="text-red-500 hover:text-red-600 hover:underline transition-all cursor-pointer font-semibold"
                >
                  Clear Local Cache
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
