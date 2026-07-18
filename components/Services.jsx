'use client';

import { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useAnimationFrame,
  animate,
} from 'framer-motion';
import { Compass, Cpu, Sparkle, ShieldCheck, CaretLeft, CaretRight, Play, Pause } from '@phosphor-icons/react';

const SERVICES = [
  {
    id: 'immersive-web',
    title: 'Immersive Web Design & Development',
    description:
      'We design and develop modern, high-performance websites that combine exceptional user experience with reliable engineering, tailored to reflect your brand.',
    icon: Compass,
    subServices: [
      { title: 'Brand Platforms', detail: 'Professional sites that build credibility and communicate your brand clearly.' },
      { title: 'Interactive UI', detail: 'Smooth animations and micro-interactions, with 3D built in Three.js when it earns its cost.' },
      { title: 'Landing Pages', detail: 'Fast, conversion-focused pages optimized for search and accessibility.' },
      { title: 'Modernization', detail: 'Outdated sites rebuilt clean, responsive, and easy to maintain.' },
    ],
  },
  {
    id: 'web-apps',
    title: 'Web Applications & Client Portals',
    description:
      'We build secure, browser-based applications that simplify business operations and organize data through intuitive interfaces, powered by modern cloud platforms.',
    icon: Cpu,
    subServices: [
      { title: 'Dashboards', detail: 'Real-time charts and reports that make business data easy to read.' },
      { title: 'Client Portals', detail: 'Private portals for customers or staff to manage accounts and track progress.' },
      { title: 'Admin Panels', detail: 'Custom CMS tools your team can use without touching code.' },
      { title: 'Cloud Data', detail: 'Reliable auth, storage, and sync built on Supabase or Firebase.' },
    ],
  },
  {
    id: 'ai-automation',
    title: 'AI Integration & Workflow Automation',
    description:
      'We integrate modern AI capabilities and automation into your digital products to cut repetitive work and streamline business processes through reliable API-driven solutions.',
    icon: Sparkle,
    subServices: [
      { title: 'AI Assistants', detail: 'Generate emails, reports, and docs using OpenAI, Anthropic, or Gemini.' },
      { title: 'Knowledge Search', detail: 'Searchable knowledge bases that surface answers from your own docs.' },
      { title: 'Automation', detail: 'Automate form processing, notifications, and routine admin work.' },
      { title: 'API Integration', detail: 'Connect Stripe, calendars, CRMs, and other tools you already use.' },
    ],
  },
  {
    id: 'maintenance',
    title: 'Performance, Maintenance & Technical Support',
    description:
      'Launching a product is only the beginning. We provide ongoing improvements and technical support so your website or application keeps performing reliably as you grow.',
    icon: ShieldCheck,
    subServices: [
      { title: 'Performance', detail: 'Faster load times and smoother interactions across every device.' },
      { title: 'Enhancements', detail: 'New features shipped as your product and needs keep growing.' },
      { title: 'Bug Fixes', detail: 'Issues resolved fast, with compatibility kept current.' },
      { title: 'Monitoring', detail: 'Analytics and uptime tracking so you always know what is happening.' },
    ],
  },
];

const ACCENT_RGB = '63, 174, 106';
const AUTOPLAY_MS = 6000;

// Organic 7-armed starfish shape, built as a closed quadratic B-spline through
// alternating outer/inner points so every arm and every joint is perfectly rounded.
function starfishPath({ arms = 10, cx = 180, cy = 180, outerR = 174, innerR = 44 } = {}) {
  const pts = [];
  for (let i = 0; i < arms * 2; i++) {
    const angle = (i * Math.PI) / arms - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  const mid = pts.map((p, i) => {
    const n = pts[(i + 1) % pts.length];
    return { x: (p.x + n.x) / 2, y: (p.y + n.y) / 2 };
  });
  const last = mid[mid.length - 1];
  let d = `M ${last.x} ${last.y}`;
  for (let i = 0; i < pts.length; i++) {
    d += ` Q ${pts[i].x} ${pts[i].y}, ${mid[i].x} ${mid[i].y}`;
  }
  return d + ' Z';
}

const STARFISH_PATH = starfishPath();

// Keeps a starfish spinning forever at a slow `baseSpeed` (deg/s, accumulated every
// frame via rAF so it never resets), and on the idle -> active edge fires a single,
// exact 360deg sweep (`boostAngle`, eased in-and-out over `switchMs`) layered on top -
// the shape completes one full extra rotation over the course of a card switch, then
// settles back to its slow drift. Composing two nested `rotate` transforms (base on
// the outer wrapper, boost on the inner svg) adds them visually without any manual math.
function useSwitchSpin({ baseSpeed, active, reduceMotion, direction = 1, switchMs }) {
  const baseAngle = useMotionValue(0);
  const boostAngle = useMotionValue(0);
  const prevActive = useRef(active);

  useEffect(() => {
    if (reduceMotion) return undefined;
    if (prevActive.current === active) return undefined;
    prevActive.current = active;
    if (!active) return undefined;
    // Animate onward from wherever boostAngle currently sits (never reset it to 0 first) -
    // a reset-then-tween was fine mathematically (0deg and the prior settled value render
    // identically), but combined with an ease that starts at zero slope, it read as
    // "snaps to a pose, then spins" instead of accelerating straight out of the current
    // motion. Accumulating avoids any reset moment at all, and the eased curve below has
    // a real initial slope so the pickup itself is visible immediately.
    const controls = animate(boostAngle, boostAngle.get() + 90 * direction, {
      duration: switchMs / 1000,
      ease: [0.25, 0.1, 0.25, 1],
    });
    return () => controls.stop();
  }, [active, reduceMotion, direction, switchMs, boostAngle]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    baseAngle.set(baseAngle.get() + direction * baseSpeed * (delta / 1000));
  });

  return { baseAngle, boostAngle };
}

function RotatingStarfish({ className, baseAngle, boostAngle }) {
  return (
    <motion.div className={`absolute pointer-events-none ${className}`} style={{ rotate: baseAngle }}>
      <motion.svg
        viewBox="0 0 360 360"
        className="w-full h-full"
        style={{ rotate: boostAngle, filter: 'drop-shadow(-16px 24px 30px rgba(15, 26, 22, 0.35))' }}
      >
        <path d={STARFISH_PATH} fill="#0f1a16" />
      </motion.svg>
    </motion.div>
  );
}

function GlowLayer({ mx, my }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out"
        style={{
          background: `radial-gradient(280px circle at ${mx}% ${my}%, rgba(${ACCENT_RGB}, 0.14), transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out"
        style={{
          padding: 1,
          background: `radial-gradient(280px circle at ${mx}% ${my}%, rgba(${ACCENT_RGB}, 0.9), transparent 70%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
    </>
  );
}

// ============================================================================
// Hover-reactive motion graphics - one detailed "device mockup" micro-animation
// per sub-service (16 total), ported from a reference build the user preferred,
// with only the color theme changed: dark zinc/neon-green panels replaced with
// light cards on white/sage, and the single accent recolored to this site's own
// grass-accent (primary) and gold-accent (secondary, used sparingly) instead of
// the reference's neon green. Structure, layout, and copy otherwise match.
// ============================================================================

const VG = '#2e4a3f'; // grass-accent - primary indicator color throughout
const VGOLD = '#c4a265'; // gold-accent - secondary, used sparingly (warnings/highlights)

function MockHeader({ label, status, tone = 'grass' }) {
  return (
    <div className="text-[9px] font-mono text-sage-400 flex justify-between border-b border-sage-100 pb-2">
      <span>{label}</span>
      <span className="font-bold" style={{ color: tone === 'gold' ? VGOLD : VG }}>
        {status}
      </span>
    </div>
  );
}

function MockFooter({ left, right, tone = 'grass' }) {
  return (
    <div className="h-5 bg-sage-50 rounded-lg border border-sage-100 flex items-center justify-between px-2 text-[7px] font-mono text-sage-400">
      <span>{left}</span>
      <span className="font-bold" style={{ color: tone === 'gold' ? VGOLD : VG }}>
        {right}
      </span>
    </div>
  );
}

function MockCard({ children }) {
  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-white border border-sage-200 shadow-sm p-3 justify-between overflow-hidden">
      {children}
    </div>
  );
}

// --- Immersive Web Design & Development ---
function VisualBrandPlatforms() {
  return (
    <MockCard>
      <div className="flex items-center gap-1.5 pb-2 border-b border-sage-100 text-[9px] font-mono text-sage-400">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-sage-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-sage-300" />
        </div>
        <div className="bg-sage-50 px-3 py-0.5 rounded flex-1 text-center text-sage-500 font-sans tracking-wide truncate max-w-[140px] mx-auto flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: VG }} />
          brand.agency
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between pt-3 space-y-2">
        <div className="h-2.5 w-3/4 bg-sage-100 rounded animate-pulse" />
        <div className="h-1.5 w-1/2 bg-sage-100 rounded" />
        <div className="relative flex-1 flex gap-2 items-center justify-center py-2 min-h-0">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="w-1/2 h-full rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(to top right, ${VG}1a, ${VG}08)`, border: `1px solid ${VG}33` }}
          >
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${VG}33` }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VG }} />
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
            className="w-1/2 h-5/6 rounded-lg bg-sage-50 border border-sage-100 flex flex-col justify-around p-2"
          >
            <div className="h-1 bg-sage-200 rounded w-full" />
            <div className="h-1 bg-sage-200 rounded w-2/3" />
          </motion.div>
        </div>
        <div className="h-5 w-full bg-sage-50 rounded-lg flex items-center justify-between px-2 border border-sage-100">
          <span className="text-[7px] font-mono text-sage-400">Live preview</span>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: VG }}
          />
        </div>
      </div>
    </MockCard>
  );
}

function VisualInteractiveUI() {
  return (
    <MockCard>
      <MockHeader label="Motion canvas" status="SPRING PHYSICS" />
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
          <motion.line
            x1="10%" y1="50%" x2="50%" y2="50%"
            stroke={VG} strokeWidth="1" strokeDasharray="3 3"
            animate={{ strokeDashoffset: [0, -10] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <motion.line
            x1="90%" y1="50%" x2="50%" y2="50%"
            stroke={VG} strokeWidth="1" strokeDasharray="3 3"
            animate={{ strokeDashoffset: [0, 10] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        </svg>
        <div className="absolute left-3 w-2 h-2 rounded-full bg-sage-200 border border-sage-300" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], y: [-10, 10, -10], x: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
          style={{ background: `linear-gradient(to bottom right, ${VG}22, transparent)`, border: `1px solid ${VG}55` }}
        >
          <div className="w-10 h-10 rounded-full border border-sage-200 flex items-center justify-center bg-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="w-6 h-6 rounded-full border-2"
              style={{ borderColor: `${VG}22`, borderTopColor: VG }}
            />
          </div>
        </motion.div>
        <div className="absolute right-3 w-2 h-2 rounded-full bg-sage-200 border border-sage-300" />
      </div>
      <MockFooter left="Interaction weight" right="MASS: 0.8kg" />
    </MockCard>
  );
}

function VisualLandingPages() {
  return (
    <MockCard>
      <MockHeader label="Funnel performance" status="+31.2% CR" />
      <div className="flex-1 flex flex-col justify-center space-y-2 py-2 min-h-0">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] font-mono text-sage-400 w-12">TRAFFIC</span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8 }}
              className="h-2.5 bg-sage-200 rounded flex items-center justify-end pr-1.5 text-[7px] font-mono text-sage-600"
            >
              100%
            </motion.div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] font-mono text-sage-400 w-12">INTERACT</span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="h-2.5 bg-sage-300 rounded flex items-center justify-end pr-1.5 text-[7px] font-mono text-white"
            >
              72%
            </motion.div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] font-mono text-sage-400 w-12">ACTION</span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '38%' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-2.5 rounded flex items-center justify-end pr-1.5 text-[7px] font-bold text-white"
              style={{ backgroundColor: VG }}
            >
              38%
            </motion.div>
          </div>
        </div>
        <div className="h-6 relative w-full border-t border-dashed border-sage-200 pt-1">
          <svg className="w-full h-full" viewBox="0 0 200 24">
            <motion.path
              d="M 5,20 Q 30,2 60,15 T 120,5 T 195,18"
              fill="none"
              stroke={VG}
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2 }}
            />
          </svg>
        </div>
      </div>
      <MockFooter left="BOUNCE: 14%" right="A/B WINNER: B" />
    </MockCard>
  );
}

function VisualModernization() {
  return (
    <MockCard>
      <div className="flex justify-between z-10">
        <MockHeader label="Codebase evolution" status="OPTIMIZING" tone="gold" />
      </div>
      <div className="flex-1 relative flex items-center justify-center my-2 min-h-0">
        <div className="absolute inset-0 grid grid-cols-2 gap-3">
          <div className="border border-sage-200 bg-sage-50 rounded p-1.5 flex flex-col justify-around">
            <span className="text-[6.5px] font-mono text-sage-400">LEGACY STACK</span>
            <div className="h-1 bg-sage-200 rounded w-full" />
            <div className="h-1 bg-sage-200 rounded w-2/3" />
            <div className="h-2 w-8 bg-sage-100 border border-sage-200 rounded flex items-center justify-center text-[5.5px] text-sage-400">
              legacy
            </div>
          </div>
          <div className="rounded p-1.5 flex flex-col justify-around" style={{ backgroundColor: `${VG}0d`, border: `1px solid ${VG}33` }}>
            <span className="text-[6.5px] font-mono" style={{ color: VG }}>
              REBUILT STACK
            </span>
            <div className="h-1 rounded w-full" style={{ backgroundColor: `${VG}55` }} />
            <div className="h-1 rounded w-2/3" style={{ backgroundColor: `${VG}55` }} />
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-2.5 w-8 rounded flex items-center justify-center text-[5.5px] text-white font-bold"
              style={{ backgroundColor: VG }}
            >
              100%
            </motion.div>
          </div>
        </div>
        <motion.div
          animate={{ left: ['5%', '95%', '5%'] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
          className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
          style={{ backgroundColor: VG, boxShadow: `0 0 8px ${VG}88` }}
        />
      </div>
      <MockFooter left="Speed multiplier" right="+5.2x SPEED" />
    </MockCard>
  );
}

// --- Web Applications & Client Portals ---
function VisualDashboards() {
  return (
    <MockCard>
      <MockHeader label="Analytics terminal" status="LIVE METRICS" />
      <div className="flex-1 flex gap-2 items-end justify-between pt-2 min-h-0">
        <div className="flex items-end gap-1 w-1/2 h-[55px] border-b border-sage-100 pb-0.5">
          {[35, 70, 50, 95, 60, 85].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              className="w-2 rounded-t"
              style={{ backgroundColor: VG, opacity: 0.55 + (h / 100) * 0.45 }}
            />
          ))}
        </div>
        <div className="w-1/2 flex flex-col items-center justify-center">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="none" stroke="#e5e9e7" strokeWidth="3" />
              <motion.circle
                cx="16" cy="16" r="12" fill="none" stroke={VG} strokeWidth="3"
                strokeDasharray="75"
                initial={{ strokeDashoffset: 75 }}
                animate={{ strokeDashoffset: 22 }}
                transition={{ duration: 0.8 }}
              />
            </svg>
            <span className="absolute text-[7px] font-mono text-sage-600">70%</span>
          </div>
          <span className="text-[6px] text-sage-400 mt-1 uppercase font-mono">Conversion</span>
        </div>
      </div>
      <MockFooter left="SYS_DB: REPLICATED" right="OK" />
    </MockCard>
  );
}

function VisualClientPortals() {
  return (
    <MockCard>
      <MockHeader label="Secure gateway" status="SESSION ACTIVE" />
      <div className="flex-1 flex flex-col justify-around py-2 min-h-0">
        <div className="flex items-center gap-1.5 bg-sage-50 p-1.5 rounded border border-sage-100">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{ backgroundColor: `${VG}22`, color: VG, border: `1px solid ${VG}44` }}
          >
            U
          </div>
          <div className="flex-1">
            <div className="text-[8px] font-bold text-sage-700">Enterprise Tenant</div>
            <div className="text-[6px] text-sage-400">Access Level: Manager</div>
          </div>
          <span className="text-[5.5px] px-1 rounded" style={{ backgroundColor: `${VG}14`, color: VG, border: `1px solid ${VG}33` }}>
            SSL
          </span>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[6.5px] font-mono text-sage-400">
            <span>sync_ledger_audit.bin</span>
            <span style={{ color: VG }}>98%</span>
          </div>
          <div className="h-1 bg-sage-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '98%' }}
              transition={{ duration: 1.2 }}
              className="h-full"
              style={{ backgroundColor: VG }}
            />
          </div>
        </div>
      </div>
      <div className="h-4 bg-sage-50 rounded border border-sage-100 flex items-center justify-center text-[7px] font-mono text-sage-400">
        🔒 Encrypted session, always on
      </div>
    </MockCard>
  );
}

function VisualAdminPanels() {
  const rows = ['PROXY_01', 'PROXY_02', 'DB_CACHE', 'CDN_SYNC'];
  return (
    <MockCard>
      <MockHeader label="Inventory deployer" status="READY" />
      <div className="flex-1 flex flex-col justify-around py-1 min-h-0">
        <div className="grid grid-cols-2 gap-1.5">
          {rows.map((label, i) => (
            <div key={label} className="bg-sage-50 p-1 rounded border border-sage-100 flex items-center justify-between">
              <span className="text-[7px] font-mono text-sage-500">{label}</span>
              <div className="w-5 h-2.5 rounded-full p-0.5 flex items-center" style={{ backgroundColor: i === 2 ? '#e4e7e9' : VG }}>
                <motion.div
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ x: i === 2 ? 0 : 10 }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2.2, delay: i * 0.2, ease: 'easeInOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <MockFooter left="QUERY RATIO: 1.05s" right="SYNCED" />
    </MockCard>
  );
}

function VisualCloudData() {
  return (
    <MockCard>
      <MockHeader label="Orchestration cloud" status="REPLICATING" />
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <svg className="absolute inset-0 w-full h-full">
          <line x1="20%" y1="75%" x2="50%" y2="25%" stroke="#e5e9e7" strokeWidth="1.5" />
          <line x1="80%" y1="75%" x2="50%" y2="25%" stroke="#e5e9e7" strokeWidth="1.5" />
          <line x1="20%" y1="75%" x2="80%" y2="75%" stroke="#e5e9e7" strokeWidth="1.5" />
          <motion.circle
            cx="35%" cy="50%" r="2.5" fill={VG}
            animate={{ cx: ['20%', '50%', '20%'], cy: ['75%', '25%', '75%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="65%" cy="50%" r="2.5" fill={VGOLD}
            animate={{ cx: ['80%', '50%', '80%'], cy: ['75%', '25%', '75%'] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.8 }}
          />
        </svg>
        <div className="absolute top-2 w-9 h-9 rounded bg-white border flex flex-col items-center justify-center" style={{ borderColor: `${VG}33` }}>
          <span className="text-[5.5px] text-sage-400">MAIN</span>
          <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: VG }} />
        </div>
        <div className="absolute bottom-2 left-2 w-9 h-9 rounded bg-white border border-sage-200 flex flex-col items-center justify-center">
          <span className="text-[5.5px] text-sage-400">DB_01</span>
          <span className="w-1 h-1 rounded-full bg-sage-300" />
        </div>
        <div className="absolute bottom-2 right-2 w-9 h-9 rounded bg-white border border-sage-200 flex flex-col items-center justify-center">
          <span className="text-[5.5px] text-sage-400">DB_02</span>
          <span className="w-1 h-1 rounded-full bg-sage-300" />
        </div>
      </div>
      <MockFooter left="LATENCY: 8ms" right="SECURE" />
    </MockCard>
  );
}

// --- AI Integration & Workflow Automation ---
function VisualAIAssistants() {
  return (
    <MockCard>
      <MockHeader label="LLM core interaction" status="STREAMING" />
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <div className="absolute w-16 h-16 rounded-full blur-lg animate-pulse" style={{ backgroundColor: `${VG}14` }} />
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: -360 }}
          transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
          className="w-12 h-12 rounded-full border relative flex items-center justify-center"
          style={{ borderColor: `${VG}44` }}
        >
          <div className="absolute inset-1.5 rounded-full border border-dashed" style={{ borderColor: `${VG}33` }} />
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${VG}22` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: VG }} />
          </div>
        </motion.div>
        <div className="absolute bottom-1 left-1 right-1 bg-sage-50/90 p-1.5 rounded border border-sage-100 text-[6.5px] font-mono text-sage-500">
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            &gt; "Summarize this thread"
          </motion.div>
          <div className="mt-0.5" style={{ color: VG }}>
            Response generated in 1.2s
          </div>
        </div>
      </div>
      <MockFooter left="Model ready" right="TOKEN_SPEED: 85/s" />
    </MockCard>
  );
}

function VisualKnowledgeSearch() {
  const items = [
    { doc: 'contracts_Q3_final.pdf', pct: 99 },
    { doc: 'sales_reports_2026.csv', pct: 88 },
    { doc: 'employee_handbook.docx', pct: 45 },
  ];
  return (
    <MockCard>
      <MockHeader label="Hybrid search" status="SCANNING" />
      <div className="flex-1 flex flex-col justify-around py-1 relative min-h-0">
        <div className="space-y-1 relative">
          {items.map((item) => (
            <div key={item.doc} className="bg-sage-50 p-1 rounded border border-sage-100 flex items-center justify-between">
              <span className="text-[7px] font-mono text-sage-500 truncate max-w-[120px]">{item.doc}</span>
              <span
                className="text-[6px] font-mono px-1 rounded"
                style={
                  item.pct > 80
                    ? { backgroundColor: `${VG}14`, color: VG, border: `1px solid ${VG}33` }
                    : { backgroundColor: '#e4e7e9', color: '#6b7782' }
                }
              >
                {item.pct}% match
              </span>
            </div>
          ))}
          <motion.div
            animate={{ y: [-30, 30, -30] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="absolute left-0 right-0 h-3 pointer-events-none"
            style={{ backgroundColor: `${VG}0d`, borderTop: `1px solid ${VG}22`, borderBottom: `1px solid ${VG}22` }}
          />
        </div>
      </div>
      <MockFooter left="INDEX_K_VALUE: 45" right="MATCHING" />
    </MockCard>
  );
}

function VisualAutomation() {
  return (
    <MockCard>
      <MockHeader label="Scheduler system" status="RUNNING" />
      <div className="flex-1 relative flex items-center justify-around py-2 min-h-0">
        <div className="w-8 h-8 rounded bg-sage-50 border border-sage-100 flex flex-col items-center justify-center">
          <span className="text-[5px] text-sage-400">WEBHOOK</span>
          <span className="w-1 h-1 rounded-full bg-sage-300" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
          className="w-8 h-8 border-2 border-dashed rounded-full flex items-center justify-center"
          style={{ borderColor: `${VG}44` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: VG }} />
        </motion.div>
        <div className="w-8 h-8 rounded bg-sage-50 border border-sage-100 flex flex-col items-center justify-center">
          <span className="text-[5px] text-sage-400">DB_INSERT</span>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: VG }} />
        </div>
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
          <motion.line
            x1="25%" y1="50%" x2="40%" y2="50%"
            stroke={VG} strokeWidth="1" strokeDasharray="2 2"
            animate={{ strokeDashoffset: [0, -6] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
          <motion.line
            x1="60%" y1="50%" x2="75%" y2="50%"
            stroke={VG} strokeWidth="1" strokeDasharray="2 2"
            animate={{ strokeDashoffset: [0, -6] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        </svg>
      </div>
      <MockFooter left="ERROR_RATE: 0.00%" right="STABLE" />
    </MockCard>
  );
}

function VisualAPIIntegration() {
  const apis = [
    { title: 'Stripe Billing Engine', verb: 'POST /charge' },
    { title: 'Calendar Sync', verb: 'GET /calendar' },
    { title: 'CRM Data Hub', verb: 'PATCH /lead' },
  ];
  return (
    <MockCard>
      <MockHeader label="Third-party contracts" status="CONNECTED" />
      <div className="flex-1 flex flex-col justify-around py-1 min-h-0">
        <div className="space-y-1">
          {apis.map((api) => (
            <div key={api.title} className="bg-sage-50 p-1 rounded border border-sage-100 flex items-center justify-between">
              <div>
                <span className="text-[7.5px] font-bold text-sage-700 block">{api.title}</span>
                <span className="text-[6px] font-mono text-sage-400 block">{api.verb}</span>
              </div>
              <span
                className="text-[5.5px] px-1 rounded font-bold"
                style={{ backgroundColor: `${VG}14`, color: VG, border: `1px solid ${VG}33` }}
              >
                LINKED
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-4 bg-sage-50 rounded border border-sage-100 flex items-center justify-center text-[7px] font-mono text-sage-400">
        🔒 Verified, encrypted connections
      </div>
    </MockCard>
  );
}

// --- Performance, Maintenance & Technical Support ---
function VisualPerformance() {
  return (
    <MockCard>
      <MockHeader label="Lighthouse metrics" status="PASS" />
      <div className="flex-1 flex items-center justify-around py-2 min-h-0">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-180" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="13" fill="none" stroke="#e5e9e7" strokeWidth="2.5" />
            <motion.circle
              cx="16" cy="16" r="13" fill="none" stroke={VG} strokeWidth="2.5"
              strokeDasharray="82"
              initial={{ strokeDashoffset: 82 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <span className="absolute text-[8px] font-black text-sage-800 font-sans">100</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: VG }} />
            <span className="text-[7px] font-mono text-sage-500">SEO: 100</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: VG }} />
            <span className="text-[7px] font-mono text-sage-500">PRACTICES: 100</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: VG }} />
            <span className="text-[7px] font-mono text-sage-500">ACCESSIBILITY: 100</span>
          </div>
        </div>
      </div>
      <MockFooter left="TBT: 4ms" right="LCP: 0.1s" />
    </MockCard>
  );
}

function VisualEnhancements() {
  return (
    <MockCard>
      <MockHeader label="CI/CD pipeline" status="BUILDING" tone="gold" />
      <div className="flex-1 flex items-center justify-center py-2 min-h-0">
        <div className="grid grid-cols-3 gap-1 w-[120px]">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="h-5 rounded border flex items-center justify-center font-mono text-[7px]"
              style={
                idx === 5
                  ? { backgroundColor: VGOLD, borderColor: VGOLD, color: '#fff', fontWeight: 700 }
                  : { backgroundColor: '#fafafb', borderColor: '#e4e7e9', color: '#9ca6af' }
              }
            >
              {idx === 5 ? '+ NEW' : `REL_${idx}`}
            </motion.div>
          ))}
        </div>
      </div>
      <MockFooter left="MAIN APPROVED" right="TESTS GREEN" />
    </MockCard>
  );
}

function VisualBugFixes() {
  const [resolved, setResolved] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setResolved(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MockCard>
      <MockHeader label="Realtime stack watcher" status={resolved ? 'CLEAN' : 'RESOLVING'} tone={resolved ? 'grass' : 'gold'} />
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <div className="absolute w-16 h-16 rounded-full border border-dashed border-sage-200 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-sage-100" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="absolute w-16 h-16 border-r border-t rounded-full"
          style={{ borderColor: `${VG}22` }}
        />
        <AnimatePresence>
          {!resolved ? (
            <motion.div
              key="threat"
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-4 left-8 w-3 h-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${VGOLD}22`, border: `1px solid ${VGOLD}` }}
            >
              <span className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: VGOLD }} />
            </motion.div>
          ) : (
            <motion.div
              key="secured"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-4 left-8 w-3 h-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${VG}22`, border: `1px solid ${VG}` }}
            >
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: VG }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <MockFooter left="EXCEPTION LOGS: 0" right="RESET" />
    </MockCard>
  );
}

function VisualMonitoring() {
  return (
    <MockCard>
      <MockHeader label="Active pulse ratio" status="UPTIME OK" />
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <svg className="absolute inset-0 w-full h-full opacity-80" viewBox="0 0 200 60">
          <motion.path
            d="M 0,30 L 40,30 L 50,10 L 60,50 L 70,30 L 120,30 L 130,15 L 140,45 L 150,30 L 200,30"
            fill="none"
            stroke={VG}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
          />
        </svg>
        <div className="absolute right-1 bottom-1 bg-sage-50 px-1.5 py-0.5 rounded border border-sage-100 font-mono text-[6px] text-sage-500">
          LOAD: 0.12%
        </div>
      </div>
      <MockFooter left="SWEEPER STATUS: HEALTHY" right="ONLINE" />
    </MockCard>
  );
}

const VISUALS = {
  'immersive-web': [VisualBrandPlatforms, VisualInteractiveUI, VisualLandingPages, VisualModernization],
  'web-apps': [VisualDashboards, VisualClientPortals, VisualAdminPanels, VisualCloudData],
  'ai-automation': [VisualAIAssistants, VisualKnowledgeSearch, VisualAutomation, VisualAPIIntegration],
  maintenance: [VisualPerformance, VisualEnhancements, VisualBugFixes, VisualMonitoring],
};

// Light equivalent of the reference's dark isometric "device stage": a soft dot-grid
// backing + faint accent glow orb, with the mockup card gently tilted in 3D and
// carrying its own soft contact shadow, crossfading between sub-services on hover.
function ServiceVisualStage({ cardId, subIdx }) {
  const Visual = VISUALS[cardId]?.[subIdx] ?? VISUALS[cardId]?.[0];
  return (
    <div className="flex-1 min-h-[220px] lg:min-h-0 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.5] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#c9d0cb 1.2px, transparent 1.2px)', backgroundSize: '14px 14px' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-3xl pointer-events-none rounded-full"
        style={{ backgroundColor: `${VG}14` }}
      />

      <div className="w-full h-full flex items-center justify-center relative" style={{ perspective: 1000 }}>
        <motion.div
          animate={{ rotateX: 20, rotateY: -16, rotateZ: 4, scale: 1.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[270px] aspect-[4/3] flex flex-col items-center justify-center z-10"
        >
          <div className="absolute -bottom-4 w-[112%] h-6 bg-black/10 blur-lg rounded-full scale-x-90 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${cardId}-${subIdx}`}
              initial={{ opacity: 0, y: 12, rotateX: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, rotateX: -8, scale: 0.95 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {Visual ? <Visual /> : null}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

const SHRINK_MS = 260;
const SLIDE_MS = 420;

const rotateRight = (order) => [order[3], order[0], order[1], order[2]];
const rotateLeft = (order) => [order[1], order[2], order[3], order[0]];

export default function Services() {
  // visualOrder[0..2] render as circles (left to right), visualOrder[3] renders as the giant card.
  const [visualOrder, setVisualOrder] = useState([1, 2, 3, 0]);
  // 'idle' -> normal render. 'shrinking' -> the active card collapses to a circle in place.
  // 'sliding' -> the (now-circle) items reflow into their new order, still all circles.
  // Only once back at 'idle' does whichever item lands in the card slot grow into the card.
  const [phase, setPhase] = useState('idle');
  const [isPlaying, setIsPlaying] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const reduceMotion = useReducedMotion();
  const autoplayRef = useRef(null);
  const stepTimeouts = useRef([]);
  // Id of the item making the long end-to-end jump this transition (set right before
  // the reorder fires), so it alone gets the extra "hop" arc during the slide phase.
  const jumpingIdRef = useRef(null);

  const isSwitching = phase !== 'idle';
  const switchMs = SHRINK_MS + SLIDE_MS;
  const starfishA = useSwitchSpin({
    baseSpeed: 4,
    active: isSwitching,
    reduceMotion,
    direction: 1,
    switchMs,
  });
  const starfishB = useSwitchSpin({
    baseSpeed: 4,
    active: isSwitching,
    reduceMotion,
    direction: -1,
    switchMs,
  });

  const activeIndex = visualOrder[3];
  const [hoveredSubIdx, setHoveredSubIdx] = useState(0);

  // Reset which sub-service's motion graphic is showing whenever the focused
  // category itself changes, so a new card never opens on a stale hover state.
  useEffect(() => {
    setHoveredSubIdx(0);
  }, [activeIndex]);

  const clearStepTimeouts = () => {
    stepTimeouts.current.forEach(clearTimeout);
    stepTimeouts.current = [];
  };

  const advance = (rotate, jumperFromOrder) => {
    if (reduceMotion) {
      setVisualOrder(rotate);
      return;
    }
    if (phase !== 'idle') return;
    setPhase('shrinking');
    stepTimeouts.current.push(
      setTimeout(() => {
        setVisualOrder((prev) => {
          jumpingIdRef.current = SERVICES[jumperFromOrder(prev)].id;
          return rotate(prev);
        });
        setPhase('sliding');
        stepTimeouts.current.push(
          setTimeout(() => {
            setPhase('idle');
            jumpingIdRef.current = null;
          }, SLIDE_MS)
        );
      }, SHRINK_MS)
    );
  };

  const next = () => {
    setIsPlaying(false);
    advance(rotateRight, (order) => order[3]);
  };

  const prev = () => {
    setIsPlaying(false);
    advance(rotateLeft, (order) => order[0]);
  };

  useEffect(() => clearStepTimeouts, []);

  useEffect(() => {
    if (reduceMotion || !isPlaying) return undefined;
    autoplayRef.current = setInterval(() => advance(rotateRight, (order) => order[3]), AUTOPLAY_MS);
    return () => clearInterval(autoplayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, reduceMotion, phase]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section
      id="services"
      className="relative min-h-[120vh] flex flex-col justify-start pt-6 pb-10 md:pt-8 md:pb-12 overflow-hidden bg-gradient-to-b from-sage-50 via-white to-sage-100 border-t border-luxury-border"
    >
      {/* Diagonal crosshatch grid, faded to plain in the very center via a mask */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(46,74,63,0.14) 0, rgba(46,74,63,0.14) 1px, transparent 1px, transparent 26px), repeating-linear-gradient(-45deg, rgba(46,74,63,0.14) 0, rgba(46,74,63,0.14) 1px, transparent 1px, transparent 26px)',
          WebkitMaskImage:
            'radial-gradient(55% 50% at 50% 45%, transparent 0%, transparent 30%, black 68%)',
          maskImage:
            'radial-gradient(55% 50% at 50% 45%, transparent 0%, transparent 30%, black 68%)',
        }}
      />

      {/* Two large starfish shapes, each tucked mostly off-canvas so only one quadrant
          shows in the corner - they idle-spin slowly and complete one full extra
          rotation over the course of every card switch */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <RotatingStarfish
          className="w-[640px] -top-[320px] -right-[320px] md:w-[940px] md:-top-[470px] md:-right-[470px] opacity-90"
          baseAngle={starfishA.baseAngle}
          boostAngle={starfishA.boostAngle}
        />
        <RotatingStarfish
          className="w-[560px] -bottom-[280px] -left-[280px] md:w-[820px] md:-bottom-[410px] md:-left-[410px] opacity-90"
          baseAngle={starfishB.baseAngle}
          boostAngle={starfishB.boostAngle}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 relative z-10">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
              <span className="text-xs font-mono tracking-[0.3em] text-gold-accent uppercase font-bold">
                Our Services
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans tracking-tight leading-[1.1]">
              <span className="font-light text-sage-500 block mb-1">One team,</span>
              <span className="font-bold italic text-sage-950 block pb-1">
                every layer of the build.
              </span>
            </h2>
          </div>
          <p className="text-xs md:text-sm text-sage-600 font-light max-w-sm leading-relaxed md:pb-1">
            From marketing sites to internal tools to AI workflows, we design, build, and
            support every layer so nothing falls through the cracks.
          </p>
        </div>

        {/* Circle + card carousel - fixed-height stage so the section never collapses
            while every item is briefly a circle mid-transition */}
        <div className="w-full h-[460px] sm:h-[480px] md:h-[520px] flex flex-row flex-wrap md:flex-nowrap items-center justify-center gap-4 sm:gap-5 md:gap-6">
          {visualOrder.map((idx, pos) => {
            const svc = SERVICES[idx];
            const Icon = svc.icon;
            const isCardSlot = pos === 3;
            // While shrinking/sliding, the item in the card slot is still rendered as a circle -
            // it only grows into the card once the reorder has fully settled back to 'idle'.
            const isCard = isCardSlot && phase === 'idle';
            const isJumping = phase === 'sliding' && svc.id === jumpingIdRef.current;

            return (
              <motion.div
                key={svc.id}
                layout
                animate={{ y: isJumping ? [0, -30, 0] : 0 }}
                transition={{
                  layout: { type: 'spring', stiffness: 340, damping: 26, mass: 0.7 },
                  y: isJumping
                    ? { duration: SLIDE_MS / 1000, times: [0, 0.5, 1], ease: 'easeOut' }
                    : { duration: 0 },
                }}
                onMouseMove={isCard ? handleMouseMove : undefined}
                aria-live={isCard ? 'polite' : undefined}
                className={
                  isCard
                    ? 'group relative w-full md:flex-1 lg:min-w-[660px] h-[460px] sm:h-[480px] md:h-[520px] rounded-[32px] bg-white border border-grass-accent-light/40 shadow-2xl overflow-hidden'
                    : 'group relative shrink-0 w-16 h-16 rounded-[32px] bg-sage-950 border border-sage-900 shadow-md overflow-hidden'
                }
              >
                {isCard && (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: 'radial-gradient(rgba(30,41,37,0.08) 1px, transparent 1px)',
                        backgroundSize: '14px 14px',
                      }}
                    />
                    <div className="absolute w-[60%] h-[60%] rounded-full bg-grass-accent-light/10 blur-3xl top-[-15%] right-[-10%]" />
                    <GlowLayer mx={mousePos.x} my={mousePos.y} />
                  </>
                )}

                {/* Gloss reflection overlay, on both circles and the card - same 32px radius as the
                    card itself so Framer never has to interpolate border-radius across the morph */}
                <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-tr from-transparent via-white/5 to-white/15 z-10" />

                <AnimatePresence mode="wait" initial={false}>
                  {isCard ? (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.22, ease: 'easeOut', delay: 0.08 }}
                      className="relative z-20 h-full flex flex-col lg:flex-row gap-6 lg:gap-8 px-7 py-6 sm:px-9 sm:py-7 md:px-11 md:py-8"
                    >
                      {/* Left: category info + 2x2 sub-service grid */}
                      <div className="flex flex-col lg:w-[52%] lg:shrink-0 min-h-0">
                        <Icon size={32} weight="duotone" className="text-sage-950 shrink-0" />

                        <h3 className="mt-4 text-xl sm:text-2xl md:text-[1.6rem] font-sans font-bold text-sage-950 tracking-tight leading-tight">
                          {svc.title}
                        </h3>
                        <p className="mt-2.5 text-xs sm:text-sm text-sage-500 font-light leading-relaxed">
                          {svc.description}
                        </p>

                        <div className="mt-5 h-px w-full bg-luxury-border" />

                        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 overflow-y-auto">
                          {svc.subServices.map((sub, subIdx) => (
                            <div
                              key={sub.title}
                              onMouseEnter={() => setHoveredSubIdx(subIdx)}
                              className="flex items-start gap-2.5"
                            >
                              <CaretRight
                                size={12}
                                weight="bold"
                                className="text-grass-accent mt-[4px] shrink-0"
                              />
                              <div>
                                <div className="text-xs sm:text-[13px] font-sans font-bold text-sage-950 leading-snug">
                                  {sub.title}
                                </div>
                                <div className="text-[11px] sm:text-xs font-light text-sage-500 leading-relaxed mt-0.5">
                                  {sub.detail}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: hover-reactive motion graphic - swaps per sub-service row hovered */}
                      <ServiceVisualStage cardId={svc.id} subIdx={hoveredSubIdx} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="circle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.22, ease: 'easeOut', delay: 0.08 }}
                      className="relative z-20 w-full h-full flex items-center justify-center"
                    >
                      <Icon size={20} weight="duotone" className="text-sage-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation: liquid-glass control bar (prev / play-pause / next) + progress dots */}
        <div className="mt-6 md:mt-8 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-5 px-5 py-2.5 rounded-full bg-white/40 backdrop-blur-xl border border-white/70 shadow-[0_8px_24px_rgba(30,41,37,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <button
              type="button"
              aria-label="Previous service"
              onClick={prev}
              className="p-1 text-sage-700 hover:text-grass-accent transition-colors duration-150"
            >
              <CaretLeft size={18} weight="bold" />
            </button>

            <button
              type="button"
              aria-label={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
              onClick={() => setIsPlaying((p) => !p)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-sage-950 text-white hover:bg-sage-900 transition-colors duration-150 shadow-sm"
            >
              {isPlaying ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" className="ml-0.5" />}
            </button>

            <button
              type="button"
              aria-label="Next service"
              onClick={next}
              className="p-1 text-sage-700 hover:text-grass-accent transition-colors duration-150"
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {SERVICES.map((svc, idx) => (
              <span
                key={svc.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? 'w-6 bg-sage-950' : 'w-1.5 bg-sage-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
