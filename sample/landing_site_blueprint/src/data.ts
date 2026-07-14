import { ServiceCategory, TechItem } from "./types";

export const SERVICES: ServiceCategory[] = [
  {
    id: "immersive-web",
    title: "Immersive Web Design & Development",
    tagline: "High-performance digital products engineered for absolute distinction.",
    description: "We design and develop modern, high-performance websites that combine exceptional user experience with reliable engineering. Every project is built to be fast, responsive, and tailored to reflect your brand while delivering measurable business value.",
    iconName: "Compass",
    accentColor: "from-emerald-400 to-teal-500",
    subServices: [
      {
        title: "Corporate Websites & Brand Platforms",
        description: "Professional, responsive websites that establish credibility, communicate your brand clearly, and create a strong online presence."
      },
      {
        title: "Interactive Web Experiences",
        description: "Engaging user interfaces enhanced with smooth animations, micro-interactions, and optional 3D experiences using technologies like Three.js and WebGL."
      },
      {
        title: "Landing Pages & Marketing Websites",
        description: "Fast-loading promotional websites optimized for conversions, accessibility, and search engine visibility."
      },
      {
        title: "Website Redesign & Modernization",
        description: "Transform outdated websites into clean, responsive, and maintainable platforms with improved usability and performance."
      }
    ]
  },
  {
    id: "web-apps",
    title: "Web Applications & Client Portals",
    tagline: "Custom digital tools that consolidate operations and empower users.",
    description: "We build secure, browser-based applications that simplify business operations, improve collaboration, and organize data through intuitive interfaces. Using modern cloud platforms, we create scalable solutions without the complexity of maintaining traditional servers.",
    iconName: "Cpu",
    accentColor: "from-gold-300 to-gold-500",
    subServices: [
      {
        title: "Business Dashboards & Analytics",
        description: "Interactive dashboards that present business data through clear charts, reports, and real-time metrics."
      },
      {
        title: "Secure Client Portals",
        description: "Private web portals where customers or employees can securely access documents, manage accounts, submit requests, and track progress."
      },
      {
        title: "Content Management Systems",
        description: "Custom admin panels that allow your team to manage content, products, users, or business information without technical knowledge."
      },
      {
        title: "Cloud Database Integration",
        description: "Reliable backend solutions powered by platforms like Supabase and Firebase for authentication, database management, file storage, and real-time synchronization."
      }
    ]
  },
  {
    id: "ai-automation",
    title: "AI Integration & Workflow Automation",
    tagline: "Injecting cognitive power and automated systems into legacy workflows.",
    description: "We integrate modern AI capabilities and automation into your digital products to reduce repetitive work, improve productivity, and streamline business processes through reliable API-driven solutions.",
    iconName: "Sparkles",
    accentColor: "from-teal-400 to-emerald-500",
    subServices: [
      {
        title: "AI Assistants & Content Generation",
        description: "Integrate AI to generate emails, reports, summaries, FAQs, documentation, and other business content using OpenAI, Anthropic, or Gemini APIs."
      },
      {
        title: "Knowledge Search Systems",
        description: "Build searchable knowledge bases that help teams quickly find information from documentation, manuals, and internal resources."
      },
      {
        title: "Business Process Automation",
        description: "Automate repetitive tasks such as form processing, notifications, data synchronization, scheduled reports, and routine administrative workflows."
      },
      {
        title: "Third-Party API Integration",
        description: "Connect your applications with services such as Stripe, Google Workspace, CRM platforms, email providers, calendars, and other business tools."
      }
    ]
  },
  {
    id: "maintenance-support",
    title: "Performance, Maintenance & Technical Support",
    tagline: "Ensuring long-term stability, scaling, and continuous execution.",
    description: "Launching a product is only the beginning. We provide ongoing improvements, maintenance, and technical support to ensure your website or application continues performing reliably as your business grows.",
    iconName: "ShieldCheck",
    accentColor: "from-gold-400 to-amber-600",
    subServices: [
      {
        title: "Performance Optimization",
        description: "Improve loading speed, responsiveness, accessibility, and overall user experience."
      },
      {
        title: "Feature Enhancements",
        description: "Add new functionality, expand existing systems, and continuously improve your product based on evolving business requirements."
      },
      {
        title: "Bug Fixes & Technical Maintenance",
        description: "Resolve issues, maintain compatibility with modern browsers and frameworks, and keep your application stable."
      },
      {
        title: "Monitoring & Analytics",
        description: "Integrate analytics tools and performance monitoring to help you understand user behavior and make informed decisions."
      }
    ]
  }
];

export const TECH_STACK: TechItem[] = [
  // Frontend
  { name: "React", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "JavaScript", category: "frontend" },
  { name: "HTML5", category: "frontend" },
  { name: "CSS3", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "GSAP", category: "frontend" },
  { name: "Three.js", category: "frontend" },
  
  // Backend & Cloud
  { name: "Node.js", category: "backend" },
  { name: "Express.js", category: "backend" },
  { name: "Firebase", category: "backend" },
  { name: "Supabase", category: "backend" },
  { name: "MySQL", category: "backend" },
  
  // AI & Automation
  { name: "OpenAI API", category: "ai" },
  { name: "Anthropic API", category: "ai" },
  { name: "Google Gemini API", category: "ai" },
  { name: "REST APIs", category: "ai" },
  { name: "Workflow Automation", category: "ai" },
  
  // Tools
  { name: "Git", category: "tools" },
  { name: "GitHub", category: "tools" },
  { name: "Figma", category: "tools" },
  { name: "Vercel", category: "tools" },
  { name: "Netlify", category: "tools" }
];

export const PHILOSOPHY = [
  {
    title: "Absolute Craftsmanship",
    description: "We do not deal in generic presets or templates. Every asset, curve, and responsive media query is designed to make an impact."
  },
  {
    title: "Pragmatic Engineering",
    description: "Exceptional aesthetics are useless without performance. We build on lean foundations, achieving 95+ Lighthouse scores and blazing-fast loading states."
  },
  {
    title: "Literal & Honest Pricing",
    description: "No hidden agency markups, and no technical buzzwords to inflate invoices. Transparent, milestones-driven pricing tailored directly to your business value."
  }
];
