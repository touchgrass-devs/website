'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useAnimationFrame,
  animate,
} from 'framer-motion';
import { Compass, Cpu, Sparkle, ShieldCheck, CaretLeft, CaretRight, PaperPlaneRight, Copy, MagnifyingGlass } from '@phosphor-icons/react';
import { scaleLinear } from '@visx/scale';
import { AreaClosed, LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { GridRows } from '@visx/grid';

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

// Set to true to bring the rotating starfish background shapes back - all the
// code/animation logic stays intact either way, this just toggles rendering.
const SHOW_STARFISH = false;

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
function useSwitchSpin({ baseSpeed, active, reduceMotion, direction = 1, switchMs, enabled = true }) {
  const baseAngle = useMotionValue(0);
  const boostAngle = useMotionValue(0);
  const prevActive = useRef(active);

  useEffect(() => {
    if (reduceMotion || !enabled) return undefined;
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
  }, [active, reduceMotion, enabled, direction, switchMs, boostAngle]);

  // `enabled` gates this per-frame work independently of `SHOW_STARFISH`
  // below - it's currently `false` (shapes hidden entirely), which used to
  // leave this `useAnimationFrame` ticking forever anyway, updating motion
  // values nothing ever reads. Costs nothing when the shapes come back on.
  useAnimationFrame((_, delta) => {
    if (reduceMotion || !enabled) return;
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

// ============================================================================
// Hover-reactive motion graphics - one detailed "device mockup" micro-animation
// per sub-service (16 total), ported from a reference build the user preferred,
// with only the color theme changed: dark zinc/neon-green panels replaced with
// light cards on white/sage, and the single accent recolored to this site's own
// grass-accent (primary) and gold-accent (secondary, used sparingly) instead of

const VG = '#2e4a3f'; // grass-accent - primary indicator color throughout
const VGOLD = '#c4a265'; // gold-accent - secondary, used sparingly (warnings/highlights)

function MockCard({ children, headerTitle, headerTag, tone = 'grass' }) {
  return (
    <div className="w-full h-full flex flex-col rounded-2xl bg-white border border-sage-200/90 shadow-[0_4px_24px_rgba(46,74,63,0.06)] overflow-hidden">
      {/* Sleek Browser/App Chrome Header */}
      <div className="bg-sage-50/80 border-b border-sage-100 px-3 py-2 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex gap-1 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
          </div>
          {headerTitle && (
            <span className="ml-2 text-[10px] font-mono text-sage-500 font-medium truncate">
              {headerTitle}
            </span>
          )}
        </div>
        {headerTag && (
          <span
            className="text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold tracking-wider uppercase shrink-0"
            style={{
              backgroundColor: tone === 'gold' ? `${VGOLD}1a` : `${VG}14`,
              color: tone === 'gold' ? VGOLD : VG,
              border: `1px solid ${tone === 'gold' ? `${VGOLD}33` : `${VG}33`}`,
            }}
          >
            {headerTag}
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden relative min-h-0">
        {children}
      </div>
    </div>
  );
}

// --- Immersive Web Design & Development ---
function VisualBrandPlatforms() {
  const [theme, setTheme] = useState('light');
  const [preset, setPreset] = useState('Minimal');
  const presets = ['Minimal', 'Creative', 'Enterprise'];

  return (
    <MockCard headerTitle="studio.brand.agency" headerTag={theme.toUpperCase()}>
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-sage-100">
        <div className="flex items-center gap-1">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`text-[8.5px] font-mono px-2 py-0.5 rounded transition-all ${
                preset === p
                  ? 'bg-sage-900 text-white font-bold'
                  : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          className="text-[8.5px] font-mono px-2 py-0.5 rounded border border-sage-200 bg-sage-50 hover:bg-sage-100 text-sage-700 font-medium transition-colors"
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <div
        className={`flex-1 rounded-xl p-3 flex flex-col justify-between transition-colors duration-300 ${
          theme === 'dark' ? 'bg-sage-950 text-white' : 'bg-sage-50 text-sage-900'
        } border border-sage-200/50`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="h-3 w-1/3 rounded bg-current opacity-80" />
            <span className="text-[7.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 font-bold">
              LIVE STAGE
            </span>
          </div>
          <div className="h-2 w-2/3 rounded bg-current opacity-40" />
        </div>

        <div className="grid grid-cols-2 gap-2 my-1.5">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-2 rounded-lg border text-left ${
              theme === 'dark' ? 'bg-sage-900 border-sage-800' : 'bg-white border-sage-200'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-grass-accent/20 mb-1 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-grass-accent" />
            </div>
            <div className="text-[9.5px] font-bold">{preset} Design</div>
            <div className="text-[7.5px] opacity-60">Fluid Layout</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-2 rounded-lg border text-left ${
              theme === 'dark' ? 'bg-sage-900 border-sage-800' : 'bg-white border-sage-200'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-gold-accent/20 mb-1 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />
            </div>
            <div className="text-[9.5px] font-bold">Typography</div>
            <div className="text-[7.5px] opacity-60">Variable Scaling</div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between text-[7.5px] font-mono opacity-60 pt-1 border-t border-current/10">
          <span>Viewport: 1440px</span>
          <span className="font-bold text-grass-accent">100% Responsive</span>
        </div>
      </div>
    </MockCard>
  );
}

function VisualInteractiveUI() {
  const [mode, setMode] = useState('spring');
  const [count, setCount] = useState(0);

  const springConfigs = {
    soft: { stiffness: 120, damping: 14, label: 'Soft Elastic' },
    spring: { stiffness: 300, damping: 20, label: 'Springy' },
    stiff: { stiffness: 500, damping: 30, label: 'Tight Snap' },
  };

  return (
    <MockCard headerTitle="canvas.motion.physics" headerTag="SPRING STAGE">
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1">
          {Object.keys(springConfigs).map((k) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`text-[8px] font-mono px-2 py-0.5 rounded transition-colors ${
                mode === k ? 'bg-grass-accent text-white font-bold' : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
              }`}
            >
              {springConfigs[k].label}
            </button>
          ))}
        </div>
        <span className="text-[8px] font-mono text-sage-400">CLICKS: {count}</span>
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl border border-sage-200/80 relative flex items-center justify-center overflow-hidden p-2">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e9e7_1px,transparent_1px),linear-gradient(to_bottom,#e5e9e7_1px,transparent_1px)] bg-[size:14px_14px] opacity-60 pointer-events-none" />

        <motion.div
          key={mode}
          onClick={() => setCount((c) => c + 1)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          animate={{ y: [0, -12, 0] }}
          transition={{
            y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
            scale: { type: 'spring', stiffness: springConfigs[mode].stiffness, damping: springConfigs[mode].damping },
          }}
          className="w-14 h-14 rounded-2xl bg-white border-2 border-grass-accent shadow-md flex flex-col items-center justify-center cursor-pointer z-10 select-none group"
        >
          <Sparkle size={18} weight="fill" className="text-grass-accent group-hover:rotate-12 transition-transform" />
          <span className="text-[7.5px] font-mono font-bold text-sage-700 mt-0.5">CLICK ME</span>
        </motion.div>
      </div>

      <div className="mt-2 pt-1.5 border-t border-sage-100 flex items-center justify-between text-[7.5px] font-mono text-sage-500">
        <span>Stiffness: {springConfigs[mode].stiffness}</span>
        <span>Damping: {springConfigs[mode].damping}</span>
        <span className="font-bold text-grass-accent">60 FPS</span>
      </div>
    </MockCard>
  );
}

function VisualLandingPages() {
  const [variant, setVariant] = useState('B');
  const rates = {
    A: { cr: '24.1%', bounce: '32%', lift: 'Baseline' },
    B: { cr: '38.2%', bounce: '14%', lift: '+38.2% Lift' },
  };

  return (
    <MockCard headerTitle="analytics.funnel.ab" headerTag="A/B OPTIMIZER">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          <button
            onClick={() => setVariant('A')}
            className={`text-[8.5px] font-mono px-2 py-0.5 rounded transition-all ${
              variant === 'A' ? 'bg-sage-800 text-white font-bold' : 'bg-sage-100 text-sage-600'
            }`}
          >
            Variant A
          </button>
          <button
            onClick={() => setVariant('B')}
            className={`text-[8.5px] font-mono px-2 py-0.5 rounded transition-all ${
              variant === 'B' ? 'bg-grass-accent text-white font-bold shadow-sm' : 'bg-sage-100 text-sage-600'
            }`}
          >
            Variant B (Winner)
          </button>
        </div>
        <span className="text-[8.5px] font-mono font-bold text-grass-accent bg-grass-accent/10 px-2 py-0.5 rounded">
          {rates[variant].lift}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-around py-1 space-y-1.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[7.5px] font-mono text-sage-500">
            <span>TRAFFIC VISITS</span>
            <span>10,000 / mo</span>
          </div>
          <div className="h-2.5 bg-sage-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-sage-400 rounded-full" initial={{ width: '100%' }} animate={{ width: '100%' }} />
          </div>

          <div className="flex items-center justify-between text-[7.5px] font-mono text-sage-500">
            <span>ENGAGED SCROLL</span>
            <span>{variant === 'A' ? '54%' : '78%'}</span>
          </div>
          <div className="h-2.5 bg-sage-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-sage-600 rounded-full"
              animate={{ width: variant === 'A' ? '54%' : '78%' }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-between text-[7.5px] font-mono font-bold text-sage-800">
            <span>CONVERSIONS</span>
            <span className="text-grass-accent">{rates[variant].cr}</span>
          </div>
          <div className="h-3 bg-sage-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-grass-accent rounded-full flex items-center justify-end pr-1 text-[6.5px] text-white font-bold"
              animate={{ width: variant === 'A' ? '24%' : '38%' }}
              transition={{ duration: 0.5 }}
            >
              {rates[variant].cr}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="pt-1.5 border-t border-sage-100 flex justify-between text-[7.5px] font-mono text-sage-500">
        <span>BOUNCE RATE: {rates[variant].bounce}</span>
        <span>CONFIDENCE: 99.4%</span>
      </div>
    </MockCard>
  );
}

function VisualModernization() {
  const [activeTab, setActiveTab] = useState('modern');

  return (
    <MockCard headerTitle="stack.migration" headerTag="SPEED 5.2X" tone={activeTab === 'modern' ? 'grass' : 'gold'}>
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setActiveTab('legacy')}
          className={`flex-1 text-[8.5px] font-mono py-0.5 rounded transition-colors ${
            activeTab === 'legacy' ? 'bg-amber-500/20 text-amber-800 font-bold border border-amber-400' : 'bg-sage-100 text-sage-600'
          }`}
        >
          Legacy Stack
        </button>
        <button
          onClick={() => setActiveTab('modern')}
          className={`flex-1 text-[8.5px] font-mono py-0.5 rounded transition-colors ${
            activeTab === 'modern' ? 'bg-grass-accent text-white font-bold shadow-sm' : 'bg-sage-100 text-sage-600'
          }`}
        >
          Rebuilt Next.js 15
        </button>
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl p-2.5 border border-sage-200 flex flex-col justify-between">
        {activeTab === 'legacy' ? (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[8.5px] font-mono text-amber-800 bg-amber-100/80 px-2 py-1 rounded">
              <span>⚠️ Monolithic Legacy Code</span>
              <span>Load: 3.4s</span>
            </div>
            <div className="text-[7.5px] font-mono text-sage-500 bg-white p-2 rounded border border-sage-200 space-y-0.5">
              <div className="text-red-500">- 4.2MB uncompressed bundle</div>
              <div className="text-red-500">- Slow server response (TTFB 840ms)</div>
              <div className="text-amber-600">- Mobile layout breakage</div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[8.5px] font-mono text-grass-accent bg-grass-accent/10 px-2 py-1 rounded border border-grass-accent/20">
              <span>⚡ Edge Server Components</span>
              <span>Load: 52ms</span>
            </div>
            <div className="text-[7.5px] font-mono text-sage-600 bg-white p-2 rounded border border-sage-200 space-y-0.5">
              <div className="text-emerald-600">+ 100% Static HTML Hydration</div>
              <div className="text-emerald-600">+ 99/100 Core Web Vitals Score</div>
              <div className="text-emerald-600">+ Zero Cumulative Layout Shift</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[7.5px] font-mono text-sage-500 pt-1.5 border-t border-sage-200">
          <span>Lighthouse: {activeTab === 'legacy' ? '34/100' : '99/100'}</span>
          <span className="font-bold text-grass-accent">5.2x Speed Boost</span>
        </div>
      </div>
    </MockCard>
  );
}

// --- Web Applications & Client Portals ---
const LIVE_WINDOW_MS = 20000;
const LIVE_STEP_MS = 700;
const LIVE_MOMENTUM_COLORS = { up: '#2e7d4f', down: '#b5533f', flat: '#8a94a0' };

function seedLivePoints() {
  const now = Date.now();
  const points = [];
  let v = 62;
  for (let t = now - LIVE_WINDOW_MS; t <= now; t += LIVE_STEP_MS) {
    v = Math.max(20, Math.min(95, v + (Math.random() - 0.5) * 10));
    points.push({ time: t, value: v });
  }
  return points;
}

function VisualDashboards() {
  const [points, setPoints] = useState(seedLivePoints);
  const [now, setNow] = useState(() => Date.now());
  const [paused, setPaused] = useState(false);
  const [timeframe, setTimeframe] = useState('Live');

  useEffect(() => {
    if (paused) return undefined;
    const dataTimer = setInterval(() => {
      setPoints((prev) => {
        const last = prev[prev.length - 1]?.value ?? 60;
        const next = Math.max(18, Math.min(97, last + (Math.random() - 0.5) * 12));
        const cutoff = Date.now() - LIVE_WINDOW_MS - LIVE_STEP_MS * 2;
        return [...prev.filter((p) => p.time >= cutoff), { time: Date.now(), value: next }];
      });
    }, LIVE_STEP_MS);
    const tickTimer = setInterval(() => setNow(Date.now()), 100);
    return () => {
      clearInterval(dataTimer);
      clearInterval(tickTimer);
    };
  }, [paused]);

  const width = 340;
  const height = 180;
  const margin = { top: 20, right: 14, bottom: 8, left: 10 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const visible = points.filter((p) => p.time >= now - LIVE_WINDOW_MS);
  const xScale = useMemo(
    () => scaleLinear({ domain: [now - LIVE_WINDOW_MS, now], range: [0, innerW] }),
    [now, innerW]
  );
  const values = visible.map((p) => p.value);
  const yMin = Math.min(...values, 20);
  const yMax = Math.max(...values, 95);
  const yScale = useMemo(
    () => scaleLinear({ domain: [yMin - 6, yMax + 6], range: [innerH, 0] }),
    [yMin, yMax, innerH]
  );

  const latest = points[points.length - 1] ?? { value: 61.6, time: Date.now() };
  const prevValue = points[points.length - 2]?.value ?? latest.value;
  const momentum = latest.value > prevValue + 0.3 ? 'up' : latest.value < prevValue - 0.3 ? 'down' : 'flat';
  const color = LIVE_MOMENTUM_COLORS[momentum];
  const liveX = xScale(latest.time);
  const liveY = yScale(latest.value);

  return (
    <MockCard headerTitle="metrics.live.stream" headerTag={paused ? 'PAUSED' : 'LIVE STREAM'}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex gap-1">
          {['Live', '1H', '24H'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`text-[8px] font-mono px-2 py-0.5 rounded transition-all ${
                timeframe === tf ? 'bg-sage-900 text-white font-bold' : 'bg-sage-100 text-sage-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused((p) => !p)}
            className="text-[7.5px] font-mono text-sage-500 hover:text-sage-800 underline"
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <div className="text-xs font-bold font-mono" style={{ color }}>
            {latest.value.toFixed(1)} req/s
          </div>
        </div>
      </div>

      <div className="flex-1 w-full bg-sage-50 rounded-xl p-1 border border-sage-200 overflow-hidden relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <clipPath id="liveClip">
              <rect x="0" y="0" width={innerW + 4} height={innerH + 20} />
            </clipPath>
          </defs>
          <LinearGradient id="liveLineGrad" from={color} to={color} fromOpacity={0.35} toOpacity={0} />
          <g transform={`translate(${margin.left},${margin.top})`} clipPath="url(#liveClip)">
            <GridRows scale={yScale} width={innerW} height={innerH} stroke="#e4e7e9" strokeDasharray="3 4" numTicks={3} />
            <AreaClosed
              data={visible}
              x={(d) => xScale(d.time)}
              y={(d) => yScale(d.value)}
              yScale={yScale}
              curve={curveMonotoneX}
              fill="url(#liveLineGrad)"
            />
            <LinePath data={visible} x={(d) => xScale(d.time)} y={(d) => yScale(d.value)} stroke={color} strokeWidth={2.5} curve={curveMonotoneX} />
            <circle cx={liveX} cy={liveY} r={4} fill={color} stroke="#fff" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </MockCard>
  );
}

function VisualClientPortals() {
  const [tab, setTab] = useState('vault');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <MockCard headerTitle="portal.enterprise.vault" headerTag="ENCRYPTED 256-BIT">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {['vault', 'permissions', 'audit'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[8px] font-mono px-2 py-0.5 rounded capitalize transition-all ${
                tab === t ? 'bg-sage-900 text-white font-bold' : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-[7.5px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          🔒 2FA ACTIVE
        </span>
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl p-2 border border-sage-200 flex flex-col justify-between">
        {tab === 'vault' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-sage-200 text-[8px]">
              <div>
                <div className="font-bold text-sage-800">financial_q3_report.pdf</div>
                <div className="text-[7px] text-sage-400">Signed • 4.2 MB</div>
              </div>
              <button
                onClick={handleDownload}
                className="bg-grass-accent text-white px-2 py-1 rounded text-[7.5px] font-mono font-bold hover:opacity-90 transition-opacity"
              >
                {downloading ? 'Decrypting...' : 'Download'}
              </button>
            </div>
            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-sage-200 text-[8px]">
              <div>
                <div className="font-bold text-sage-800">system_architecture.svg</div>
                <div className="text-[7px] text-sage-400 font-mono">256-bit AES</div>
              </div>
              <span className="text-[7.5px] font-mono text-grass-accent font-bold">VERIFIED</span>
            </div>
          </div>
        )}

        {tab === 'permissions' && (
          <div className="space-y-1 text-[7.5px] font-mono">
            <div className="flex justify-between p-1.5 bg-white rounded border border-sage-200">
              <span>Admin Group</span>
              <span className="text-grass-accent font-bold">Full Control</span>
            </div>
            <div className="flex justify-between p-1.5 bg-white rounded border border-sage-200">
              <span>Client Reviewers</span>
              <span className="text-sage-600">Read & Approve</span>
            </div>
          </div>
        )}

        {tab === 'audit' && (
          <div className="space-y-0.5 text-[7px] font-mono text-sage-600 bg-white p-2 rounded border border-sage-200">
            <div>[17:20:11] User authenticated</div>
            <div>[17:20:14] Encrypted session key created</div>
            <div className="text-grass-accent font-bold">[17:20:45] Zero-knowledge verified</div>
          </div>
        )}

        <div className="pt-1.5 border-t border-sage-200 flex justify-between text-[7.5px] font-mono text-sage-500">
          <span>Session: Active</span>
          <span className="text-grass-accent font-bold">Zero Trust Gateway</span>
        </div>
      </div>
    </MockCard>
  );
}

function VisualAdminPanels() {
  const [toggles, setToggles] = useState({
    proxy: true,
    cache: true,
    cdn: true,
    db: true,
  });
  const [logs, setLogs] = useState(['System status operational']);

  const toggleService = (key) => {
    setToggles((prev) => {
      const next = !prev[key];
      setLogs((l) => [`${key.toUpperCase()} set to ${next ? 'ONLINE' : 'OFFLINE'}`, ...l.slice(0, 2)]);
      return { ...prev, [key]: next };
    });
  };

  return (
    <MockCard headerTitle="admin.cms.control" headerTag="OPERATIONS PANEL">
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {Object.entries(toggles).map(([k, active]) => (
          <div
            key={k}
            onClick={() => toggleService(k)}
            className={`p-1.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
              active ? 'bg-grass-accent/10 border-grass-accent/40' : 'bg-sage-100 border-sage-200'
            }`}
          >
            <span className="text-[8px] font-mono font-bold uppercase text-sage-800">{k}</span>
            <div
              className={`w-6 h-3.5 rounded-full p-0.5 transition-colors ${
                active ? 'bg-grass-accent' : 'bg-sage-300'
              }`}
            >
              <motion.div
                className="w-2.5 h-2.5 bg-white rounded-full"
                animate={{ x: active ? 10 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-sage-950 text-emerald-400 font-mono text-[7px] p-2 rounded-xl flex flex-col justify-between overflow-hidden border border-sage-800">
        <div className="space-y-1">
          <div className="text-sage-400 font-bold border-b border-sage-800 pb-0.5 flex justify-between">
            <span>LIVE CONSOLE LOGS</span>
            <span className="text-emerald-500">🟢 READY</span>
          </div>
          {logs.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
              &gt; {log}
            </motion.div>
          ))}
        </div>
        <div className="text-sage-500 text-[6.5px] pt-1 border-t border-sage-800 flex justify-between">
          <span>Latency: 1.05s</span>
          <span>CMS Auth: Verified</span>
        </div>
      </div>
    </MockCard>
  );
}

function VisualCloudData() {
  const [activeRegion, setActiveRegion] = useState('us-east');
  const [syncing, setSyncing] = useState(false);

  const regions = {
    'us-east': { ping: '4ms', role: 'Primary Leader', status: 'Healthy' },
    'eu-west': { ping: '18ms', role: 'Read Replica', status: 'Synced' },
    'ap-south': { ping: '34ms', role: 'Read Replica', status: 'Synced' },
  };

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1200);
  };

  return (
    <MockCard headerTitle="cloud.db.topology" headerTag="MULTI-REGION">
      <div className="flex gap-1 mb-2">
        {Object.keys(regions).map((r) => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={`flex-1 text-[8px] font-mono py-0.5 rounded transition-colors uppercase ${
              activeRegion === r ? 'bg-grass-accent text-white font-bold' : 'bg-sage-100 text-sage-600'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl p-2.5 border border-sage-200 flex flex-col justify-between">
        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-sage-200">
          <div>
            <div className="text-[9.5px] font-bold text-sage-900 uppercase">{activeRegion} Cluster</div>
            <div className="text-[7.5px] font-mono text-sage-500">{regions[activeRegion].role}</div>
          </div>
          <div className="text-right font-mono text-[7.5px]">
            <div className="text-grass-accent font-bold">{regions[activeRegion].ping}</div>
            <div className="text-sage-400">{regions[activeRegion].status}</div>
          </div>
        </div>

        <div className="my-1.5 p-1.5 bg-white rounded-lg border border-sage-200 flex items-center justify-between text-[7.5px] font-mono">
          <span>Supabase / Postgres Sync</span>
          <button
            onClick={triggerSync}
            className="px-2 py-0.5 rounded bg-sage-900 text-white font-bold hover:bg-sage-800 transition-colors"
          >
            {syncing ? 'Syncing...' : 'Trigger Sync'}
          </button>
        </div>

        <div className="flex justify-between text-[7.5px] font-mono text-sage-500 pt-1 border-t border-sage-200">
          <span>Uptime: 99.99%</span>
          <span className="text-grass-accent font-bold">Zero Data Loss</span>
        </div>
      </div>
    </MockCard>
  );
}

// --- AI Integration & Workflow Automation ---
function VisualAIAssistants() {
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [promptText, setPromptText] = useState('Summarize user feedback and output tasks.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const suggestionChips = [
    '✨ Summarize thread',
    '⚡ Generate API specs',
    '🎨 Redesign UI card',
  ];

  const handleSend = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1400);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <MockCard headerTitle="ai.copilot.skiper81" headerTag="LLM STREAMING">
      {/* Model Selection Pills */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1">
          {['GPT-4o', 'Claude 3.5', 'Gemini 1.5'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModel(m)}
              className={`text-[8px] font-mono px-2 py-0.5 rounded-full transition-all ${
                selectedModel === m
                  ? 'bg-grass-accent text-white font-bold shadow-sm'
                  : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <span className="text-[7.5px] font-mono text-sage-400">92 tokens/s</span>
      </div>

      {/* Suggestion Chips */}
      <div className="flex gap-1 mb-1.5 overflow-x-auto pb-0.5">
        {suggestionChips.map((chip) => (
          <button
            key={chip}
            onClick={() => {
              setPromptText(chip.replace(/^[^\w]+/, ''));
              handleSend();
            }}
            className="text-[7.5px] font-mono px-2 py-0.5 rounded-md bg-sage-100 hover:bg-sage-200 text-sage-700 whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Interactive Prompt & Response Container */}
      <div className="flex-1 bg-sage-50 rounded-xl p-2 border border-sage-200 flex flex-col justify-between space-y-1.5 overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex gap-1 items-center bg-white p-1.5 rounded-lg border border-sage-200">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="flex-1 text-[8.5px] font-sans text-sage-800 bg-transparent outline-none truncate"
              placeholder="Ask AI anything..."
            />
            <button
              onClick={handleSend}
              className="bg-grass-accent text-white p-1 rounded-md hover:bg-sage-800 transition-colors shrink-0"
            >
              <PaperPlaneRight size={10} weight="fill" />
            </button>
          </div>

          <div className="bg-white p-2 rounded-lg border border-sage-200 text-[8px] font-mono relative">
            <div className="flex justify-between items-center text-sage-400 mb-1 text-[7px]">
              <span>RESPONSE ({selectedModel})</span>
              <button
                onClick={handleCopy}
                className="text-grass-accent font-bold hover:underline flex items-center gap-0.5"
              >
                <Copy size={8} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {isGenerating ? (
              <div className="flex items-center gap-1.5 text-sage-600 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-grass-accent animate-ping" />
                <span>Generating response stream...</span>
              </div>
            ) : (
              <div className="text-sage-800 leading-relaxed font-sans text-[8px]">
                &quot;Analyzed customer threads. Key priority: Implement one-click SSO auth &amp; export reports to CSV.&quot;
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between text-[7.5px] font-mono text-sage-500 pt-1 border-t border-sage-200">
          <span>Latency: 1.2s</span>
          <span className="text-grass-accent font-bold">API Connected</span>
        </div>
      </div>
    </MockCard>
  );
}

function VisualKnowledgeSearch() {
  const [query, setQuery] = useState('Refund');
  const [threshold, setThreshold] = useState(85);

  const docs = [
    { name: 'refund_policy_2026.pdf', score: 98, chunk: 'Full refunds granted within 30 days of purchase.' },
    { name: 'terms_of_service.docx', score: 88, chunk: 'Service credits applied automatically on billing.' },
    { name: 'employee_handbook.pdf', score: 42, chunk: 'Internal expense reporting procedure.' },
  ];

  return (
    <MockCard headerTitle="ai.rag.vectorsearch" headerTag="EMBEDDINGS 1536D">
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1 bg-sage-100 px-2 py-0.5 rounded-md flex-1">
          <MagnifyingGlass size={10} className="text-sage-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-[8px] font-mono outline-none text-sage-800 w-full"
            placeholder="Search knowledge..."
          />
        </div>
        <span className="text-[7.5px] font-mono text-sage-500">Score &gt; {threshold}%</span>
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl p-2 border border-sage-200 space-y-1 overflow-hidden">
        {docs
          .filter((d) => d.score >= threshold - 35)
          .map((doc) => (
            <motion.div
              key={doc.name}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-1.5 rounded-lg border border-sage-200 text-[8px]"
            >
              <div className="flex justify-between items-center font-mono font-bold text-sage-800">
                <span className="truncate max-w-[130px]">{doc.name}</span>
                <span className="text-grass-accent bg-grass-accent/10 px-1 py-0.5 rounded text-[7px]">
                  {doc.score}% match
                </span>
              </div>
              <p className="text-[7px] text-sage-500 mt-0.5 font-sans line-clamp-1">{doc.chunk}</p>
            </motion.div>
          ))}
      </div>

      <div className="pt-1.5 border-t border-sage-100 flex justify-between text-[7.5px] font-mono text-sage-500">
        <span>Vector DB: pgvector</span>
        <span className="text-grass-accent font-bold">Hybrid Search</span>
      </div>
    </MockCard>
  );
}

function VisualAutomation() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);

  const runWorkflow = () => {
    setRunning(true);
    setStep(1);
    setTimeout(() => setStep(2), 500);
    setTimeout(() => setStep(3), 1000);
    setTimeout(() => {
      setStep(4);
      setRunning(false);
    }, 1500);
  };

  return (
    <MockCard headerTitle="automation.n8n.workflow" headerTag="ACTIVE PIPELINE">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] font-mono font-bold text-sage-700">WORKFLOW BUILDER</span>
        <button
          onClick={runWorkflow}
          className="text-[7.5px] font-mono px-2 py-0.5 rounded bg-grass-accent text-white font-bold hover:bg-sage-800 transition-colors"
        >
          {running ? `Step ${step}/4...` : '▶ Run Test'}
        </button>
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl p-2 border border-sage-200 flex items-center justify-between relative overflow-hidden">
        {['Webhook', 'AI Parse', 'DB Save', 'Slack'].map((node, i) => {
          const active = step >= i + 1;
          return (
            <div key={node} className="flex flex-col items-center z-10">
              <motion.div
                animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                className={`w-9 h-9 rounded-lg border flex flex-col items-center justify-center font-mono text-[7px] ${
                  active ? 'bg-grass-accent text-white border-grass-accent font-bold shadow-md' : 'bg-white text-sage-600 border-sage-200'
                }`}
              >
                <span>{node}</span>
              </motion.div>
              <span className="text-[6.5px] font-mono text-sage-400 mt-1">{active ? '200 OK' : 'Wait'}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-1.5 border-t border-sage-100 flex justify-between text-[7.5px] font-mono text-sage-500">
        <span>Execution Time: 18ms</span>
        <span className="text-grass-accent font-bold">0 Errors</span>
      </div>
    </MockCard>
  );
}

function VisualAPIIntegration() {
  const [selectedApi, setSelectedApi] = useState('Stripe');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const apis = {
    Stripe: { endpoint: 'POST /v1/charges', res: '{\n  "status": "succeeded",\n  "amount": 4900\n}' },
    Calendar: { endpoint: 'GET /v3/events', res: '{\n  "status": "confirmed",\n  "attendees": 4\n}' },
    HubSpot: { endpoint: 'PATCH /crm/v3/leads', res: '{\n  "deal": "Closed Won"\n}' },
  };

  const handleTest = () => {
    setLoading(true);
    setTimeout(() => {
      setResponse(apis[selectedApi].res);
      setLoading(false);
    }, 700);
  };

  return (
    <MockCard headerTitle="api.gateway.connector" headerTag="REST / WEBHOOKS">
      <div className="flex gap-1 mb-2">
        {Object.keys(apis).map((name) => (
          <button
            key={name}
            onClick={() => {
              setSelectedApi(name);
              setResponse(null);
            }}
            className={`flex-1 text-[8px] font-mono py-0.5 rounded transition-colors ${
              selectedApi === name ? 'bg-sage-900 text-white font-bold' : 'bg-sage-100 text-sage-600'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl p-2 border border-sage-200 flex flex-col justify-between">
        <div className="flex justify-between items-center bg-white p-1.5 rounded border border-sage-200 text-[7.5px] font-mono">
          <span className="font-bold text-sage-800">{apis[selectedApi].endpoint}</span>
          <button
            onClick={handleTest}
            className="bg-grass-accent text-white px-2 py-0.5 rounded text-[7px] font-bold hover:bg-sage-800"
          >
            {loading ? 'Sending...' : 'Test API'}
          </button>
        </div>

        <div className="bg-sage-950 text-emerald-400 p-2 rounded-lg font-mono text-[7.5px] my-1 min-h-[50px] border border-sage-800">
          {loading ? (
            <div className="text-sage-400 italic">Sending payload request...</div>
          ) : response ? (
            <pre className="leading-tight">{response}</pre>
          ) : (
            <div className="text-sage-500">Click &quot;Test API&quot; to view live JSON response</div>
          )}
        </div>

        <div className="flex justify-between text-[7.5px] font-mono text-sage-500 border-t border-sage-200 pt-1">
          <span>Auth: Bearer Token</span>
          <span className="text-grass-accent font-bold">200 OK (48ms)</span>
        </div>
      </div>
    </MockCard>
  );
}

// --- Performance, Maintenance & Technical Support ---
function VisualPerformance() {
  const [score, setScore] = useState(100);
  const [auditing, setAuditing] = useState(false);

  const runAudit = () => {
    setAuditing(true);
    setScore(70);
    const interval = setInterval(() => {
      setScore((s) => {
        if (s >= 100) {
          clearInterval(interval);
          setAuditing(false);
          return 100;
        }
        return s + 5;
      });
    }, 90);
  };

  return (
    <MockCard headerTitle="lighthouse.audit.vitals" headerTag="PASS 100/100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[8px] font-mono font-bold text-sage-700">CORE WEB VITALS</span>
        <button
          onClick={runAudit}
          className="text-[7.5px] font-mono px-2 py-0.5 rounded bg-grass-accent text-white font-bold hover:bg-sage-800"
        >
          {auditing ? 'Auditing...' : 'Re-Run Audit'}
        </button>
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl p-2 border border-sage-200 flex items-center justify-around">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={VG}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
            />
          </svg>
          <span className="absolute text-[11px] font-mono font-black text-sage-900">{score}</span>
        </div>

        <div className="space-y-0.5 font-mono text-[7px]">
          <div className="text-grass-accent font-bold">✓ LCP: 0.4s (Good)</div>
          <div className="text-grass-accent font-bold">✓ FID: 2ms (Good)</div>
          <div className="text-grass-accent font-bold">✓ CLS: 0.00 (Perfect)</div>
          <div className="text-grass-accent font-bold">✓ TBT: 0ms</div>
        </div>
      </div>

      <div className="pt-1.5 border-t border-sage-100 flex justify-between text-[7.5px] font-mono text-sage-500">
        <span>Desktop & Mobile</span>
        <span className="text-grass-accent font-bold">Grade A+</span>
      </div>
    </MockCard>
  );
}

function VisualEnhancements() {
  const [releases, setReleases] = useState(['v2.3.9', 'v2.4.0']);
  const [deploying, setDeploying] = useState(false);

  const triggerDeploy = () => {
    setDeploying(true);
    setTimeout(() => {
      const nextVer = `v2.4.${releases.length}`;
      setReleases((r) => [nextVer, ...r]);
      setDeploying(false);
    }, 1100);
  };

  return (
    <MockCard headerTitle="cicd.deploy.releases" headerTag="AUTOMATED PIPELINE">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[8px] font-mono font-bold text-sage-700">RELEASE TIMELINE</span>
        <button
          onClick={triggerDeploy}
          className="text-[7.5px] font-mono px-2 py-0.5 rounded bg-grass-accent text-white font-bold hover:bg-sage-800"
        >
          {deploying ? 'Building Bundle...' : '+ Ship Feature'}
        </button>
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl p-2 border border-sage-200 space-y-1.5 overflow-hidden">
        {releases.map((rel, i) => (
          <motion.div
            key={rel}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-1.5 rounded-lg border border-sage-200 flex justify-between items-center text-[7.5px] font-mono"
          >
            <div>
              <span className="font-bold text-sage-900">{rel}</span>
              <span className="text-[6.5px] text-sage-400 ml-2">
                {i === 0 ? 'Production Live' : 'Archived'}
              </span>
            </div>
            <span className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-bold border border-emerald-200">
              100% PASS
            </span>
          </motion.div>
        ))}
      </div>

      <div className="pt-1.5 border-t border-sage-100 flex justify-between text-[7.5px] font-mono text-sage-500">
        <span>Vercel / GitHub Actions</span>
        <span className="text-grass-accent font-bold">Zero Downtime</span>
      </div>
    </MockCard>
  );
}

function VisualBugFixes() {
  const [fixed, setFixed] = useState(false);

  return (
    <MockCard headerTitle="sentry.error.watcher" headerTag={fixed ? 'STACK CLEAN' : '1 THREAT'} tone={fixed ? 'grass' : 'gold'}>
      <div className="flex-1 bg-sage-50 rounded-xl p-2.5 border border-sage-200 flex flex-col justify-between">
        {!fixed ? (
          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-[7.5px] font-mono text-amber-900">
              <div className="font-bold text-red-600">🚨 TypeError: Cannot read null (auth.ts:42)</div>
              <div className="text-[6.5px] text-amber-700 mt-1">Detected in session handler</div>
            </div>
            <button
              onClick={() => setFixed(true)}
              className="w-full py-1 rounded bg-grass-accent text-white font-mono text-[8px] font-bold hover:bg-sage-800 transition-colors"
            >
              ⚡ Auto-Patch with AI
            </button>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-1.5 text-center py-2">
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center font-bold text-base">
              ✓
            </div>
            <div className="text-[9.5px] font-bold text-sage-900 font-mono">PATCH APPLIED & VERIFIED</div>
            <div className="text-[7px] font-mono text-sage-500">0 Active Exceptions across stack</div>
          </motion.div>
        )}

        <div className="pt-1.5 border-t border-sage-200 flex justify-between text-[7.5px] font-mono text-sage-500">
          <span>Real-time Sentinel</span>
          <span className="text-grass-accent font-bold">24/7 Hotfixes</span>
        </div>
      </div>
    </MockCard>
  );
}

function VisualMonitoring() {
  const [spiking, setSpiking] = useState(false);

  const simulateSpike = () => {
    setSpiking(true);
    setTimeout(() => setSpiking(false), 1800);
  };

  return (
    <MockCard headerTitle="uptime.health.monitor" headerTag="UPTIME 99.99%">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[8px] font-mono font-bold text-sage-700">HEALTH METRICS</span>
        <button
          onClick={simulateSpike}
          className="text-[7.5px] font-mono px-2 py-0.5 rounded bg-grass-accent text-white font-bold hover:bg-sage-800"
        >
          {spiking ? 'Spike Load...' : 'Simulate Spike'}
        </button>
      </div>

      <div className="flex-1 bg-sage-50 rounded-xl p-2 border border-sage-200 flex flex-col justify-between relative overflow-hidden">
        <svg className="w-full h-10" viewBox="0 0 200 40">
          <motion.path
            d={
              spiking
                ? 'M 0,20 L 30,20 L 40,5 L 50,35 L 60,10 L 70,30 L 120,20 L 140,2 L 160,38 L 200,20'
                : 'M 0,20 L 40,20 L 50,15 L 60,25 L 70,20 L 120,20 L 130,16 L 140,24 L 150,20 L 200,20'
            }
            fill="none"
            stroke={VG}
            strokeWidth="2"
            transition={{ duration: 0.4 }}
          />
        </svg>

        <div className="flex justify-between items-center text-[7.5px] font-mono bg-white p-1.5 rounded border border-sage-200">
          <span>Global Latency: {spiking ? '42ms' : '12ms'}</span>
          <span className="text-grass-accent font-bold">{spiking ? 'HEAVY TRAFFIC' : 'NORMAL'}</span>
        </div>

        <div className="pt-1 border-t border-sage-200 flex justify-between text-[7.5px] font-mono text-sage-500">
          <span>Status: All Operational</span>
          <span className="text-grass-accent font-bold">24/7 Monitoring</span>
        </div>
      </div>
    </MockCard>
  );
}

const VISUALS = {
  'immersive-web': [VisualBrandPlatforms, VisualInteractiveUI, VisualLandingPages, VisualModernization],
  'web-apps': [VisualDashboards, VisualClientPortals, VisualAdminPanels, VisualCloudData],
  'ai-automation': [VisualAIAssistants, VisualKnowledgeSearch, VisualAutomation, VisualAPIIntegration],
  maintenance: [VisualPerformance, VisualEnhancements, VisualBugFixes, VisualMonitoring],
};

function ServiceVisualStage({ cardId, subIdx }) {
  const Visual = VISUALS[cardId]?.[subIdx] ?? VISUALS[cardId]?.[0];
  return (
    <div className="flex-1 min-h-[260px] lg:min-h-0 rounded-2xl flex flex-col items-center justify-center p-1 sm:p-2 relative overflow-hidden">
      <div className="w-full h-full flex items-center justify-center relative">
        <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cardId}-${subIdx}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {Visual ? <Visual /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
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
  const reduceMotion = useReducedMotion();
  const stepTimeouts = useRef([]);
  // Id of the item making the long end-to-end jump this transition (set right before
  // the reorder fires), so it alone gets the extra "hop" arc during the slide phase.
  const jumpingIdRef = useRef(null);

  // Section-visibility gate. This section is never unmounted, so without
  // this, the starfish `useAnimationFrame` loops and whichever hover-visual
  // is currently the "sticky" `hoveredSubIdx` sub-component (some of which
  // run their own rAF/`setInterval` loops - see `VisualDashboards`) kept
  // animating in the background for the entire time the visitor was on the
  // page, even scrolled several sections away. Generous rootMargin so
  // nothing pops in/out right at the viewport edge.
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '400px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const isSwitching = phase !== 'idle';
  const switchMs = SHRINK_MS + SLIDE_MS;
  const starfishA = useSwitchSpin({
    baseSpeed: 4,
    active: isSwitching,
    reduceMotion,
    direction: 1,
    switchMs,
    enabled: SHOW_STARFISH && inView,
  });
  const starfishB = useSwitchSpin({
    baseSpeed: 4,
    active: isSwitching,
    reduceMotion,
    direction: -1,
    switchMs,
    enabled: SHOW_STARFISH && inView,
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
    advance(rotateRight, (order) => order[3]);
  };

  const prev = () => {
    advance(rotateLeft, (order) => order[0]);
  };

  useEffect(() => clearStepTimeouts, []);

  return (
    <section
      id="services"
      ref={sectionRef}
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
          rotation over the course of every card switch.
          Temporarily hidden - flip SHOW_STARFISH back to true to bring them back. */}
      {SHOW_STARFISH && (
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
      )}

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 relative z-10">
        {/* Section header */}
        <div className="mb-6 md:mb-8">
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
                aria-live={isCard ? 'polite' : undefined}
                className={
                  isCard
                    ? 'group relative w-full md:flex-1 lg:min-w-[660px] h-[460px] sm:h-[480px] md:h-[520px] rounded-[32px] border border-grass-accent-light/40 shadow-2xl overflow-hidden'
                    : 'group relative shrink-0 w-16 h-16 rounded-[32px] bg-sage-950 border border-sage-900 shadow-md overflow-hidden'
                }
              >
                {/* Gloss reflection overlay, on both circles and the card - same 32px radius as the
                    card itself so Framer never has to interpolate border-radius across the morph */}
                <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-tr from-transparent via-white/5 to-white/15 z-10" />

                {/* Circle icon: always mounted (never unmounts/remounts), just crossfades its own
                    opacity in/out of sync with isCard. Keeping it out of AnimatePresence's mount/
                    unmount cycle avoids a race with the parent's own `layout` shrink/grow animation
                    that could otherwise leave the icon stuck at a stale, near-invisible scale. */}
                <motion.div
                  className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                  animate={{ opacity: isCard ? 0 : 1 }}
                  transition={{ duration: 0.18, ease: 'easeOut', delay: isCard ? 0 : 0.15 }}
                >
                  <Icon size={20} weight="duotone" className="text-sage-300" />
                </motion.div>

                <AnimatePresence initial={false}>
                  {isCard && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.22, ease: 'easeOut', delay: 0.08 }}
                      className="relative z-30 h-full flex flex-col lg:flex-row gap-6 lg:gap-8 px-7 py-6 sm:px-9 sm:py-7 md:px-11 md:py-8"
                    >
                      {/* Left: category info + 2x2 sub-service grid */}
                      <div className="flex flex-col lg:h-full lg:w-[52%] lg:shrink-0 min-h-0">
                        <Icon size={36} weight="duotone" className="text-sage-950 shrink-0" />

                        <h3 className="mt-4 text-2xl sm:text-3xl md:text-[1.9rem] font-sans font-bold text-sage-950 tracking-tight leading-tight">
                          {svc.title}
                        </h3>
                        <p className="mt-1 text-sm sm:text-base text-sage-500 font-light leading-relaxed">
                          {svc.description}
                        </p>

                        <div className="mt-6 h-px w-full bg-luxury-border" />

                        <div className="mt-5 flex-1 grid grid-cols-2 gap-1.5 content-center">
                          {svc.subServices.map((sub, subIdx) => (
                            <div
                              key={sub.title}
                              onMouseEnter={() => setHoveredSubIdx(subIdx)}
                              className="relative rounded-xl"
                            >
                              {hoveredSubIdx === subIdx && (
                                <motion.div
                                  layoutId="subHighlight"
                                  className="absolute inset-0 rounded-xl bg-sage-100"
                                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                />
                              )}
                              <div className="relative z-10 px-3 py-2.5">
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

                      {/* Right: hover-reactive motion graphic - swaps per sub-service row
                          hovered. Only mounted while the section is actually on screen
                          (`inView`, see above) - whichever visual is currently showing has
                          its own animation loop/interval that would otherwise keep running
                          indefinitely in the background once scrolled away. Unmounting runs
                          each visual's own cleanup; remounting on scroll-back replays its
                          entrance exactly as if freshly hovered, same as it does today when
                          switching between sub-service rows. The empty div matches its
                          layout box so nothing shifts at the visibility boundary. */}
                      {inView ? (
                        <ServiceVisualStage cardId={svc.id} subIdx={hoveredSubIdx} />
                      ) : (
                        <div className="flex-1 min-h-[260px] lg:min-h-0" />
                      )}
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
