/* ════════════════════════════════════════════════════════════════════
   EVERYTHING PERSONAL LIVES HERE — edit this file, not the components.

   Sourced from Swapnanil's CV, the signed Aspir reference letter, and the
   project list he supplied. Anything unverified is marked // TODO.
   ════════════════════════════════════════════════════════════════════ */

export const PROFILE = {
  name: "Swapnanil Manna",
  short: "Swapnanil",
  wordmark: "Swapnanil",
  email: "swapnanilmanna06694@gmail.com",
  phone: "+91 89458 96607",
  role: "Full-stack & AI product engineer",
  location: "Kolkata, India",
  availability: "available for freelance",
  /** second ambient cursor on the canvas — set to "" to remove it */
  guestCursor: "Guest",
  year: "2026",
  links: {
    linkedin: "https://in.linkedin.com/in/swapnanil-manna",
    // TODO paste your GitHub, X and a hosted resume URL
    github: "#",
    x: "#",
    resume: "#",
  },
};

export const EMAIL = PROFILE.email;

/* ── HERO ─────────────────────────────────────────────────────────── */
export const HERO = {
  lines: ["I BUILD", "AI PRODUCTS ."],
  badgePre: "4×",
  badgeMark: "🏆",
  badgeHi: "national hackathon winner",
  badgePost: "· NIT Durgapur '26",
  hint: "full-stack, ai, and 0 → 1 ✦",
  sub: "I take products from an empty repo to something real users log into — database, API, AI pipeline and interface, all of it mine.",
  primaryCta: "Start a project",
  secondaryCta: "See the work",
  cornerLeft: ["based in kolkata", "working worldwide"],
  cornerRight: ["open for freelance", "your timezone, handled"],
};

/* ── WORK ─────────────────────────────────────────────────────────── */
export type Project = {
  slug: string;
  name: string;
  blurb: string;
  tags: string[];
  href: string;
  /** false = deployment was down when last checked */
  live: boolean;
  hue: number;
  kind: "dash" | "wave" | "grid";
  /** real screenshot in /public/work; when set it replaces the stand-in mockup */
  shot?: string;
};

/* ⚠ 5 of these 8 deployments returned 503/500 when last checked.
   Redeploy them, or set live:false so they don't render as working links. */
export const PROJECTS: Project[] = [
  {
    slug: "cazzai", name: "CazzAI",
    blurb: "Unified AI platform for students and professionals — chatbot, interview prep, code conversion, resume builder and analyzer.",
    tags: ["NEXT.JS", "POSTGRES", "GEMINI"],
    href: "https://cazz-ai.vercel.app/", live: true, hue: 22, kind: "dash",
    shot: "/work/cazzai.jpg",
  },
  {
    slug: "ivey", name: "IVEY",
    blurb: "An AI workspace for founders — research, think and produce the documents behind a growing business, without losing the context that makes them yours.",
    // TODO these describe the product, not the stack — swap in the real one
    tags: ["AI WORKSPACE", "RESEARCH", "DOCUMENTS"],
    // TODO no deployment URL on file yet; until there is one this renders an
    // OFFLINE chip, which reads as "was up, now down" rather than "unlaunched"
    href: "#", live: false, hue: 18, kind: "wave",
    shot: "/work/ivey.jpg",
  },
  {
    slug: "douchat", name: "douchat",
    blurb: "Chat with your documents — a retrieval pipeline that indexes uploads and answers from them.",
    tags: ["RAG", "NEXT.JS", "VECTOR DB"],
    href: "https://notebookllm-pi.vercel.app/", live: true, hue: 268, kind: "wave",
  },
  {
    slug: "imagzz", name: "ImagZZ",
    blurb: "AI image SaaS with generative fill, object recolor, object removal, background removal and restore.",
    tags: ["NEXT.JS", "CLOUDINARY", "STRIPE"],
    href: "https://imagzz.vercel.app/", live: true, hue: 212, kind: "grid",
  },
  {
    slug: "conference", name: "Conference",
    blurb: "Video conferencing — instant calls, scheduled meetings and recording.",
    tags: ["NEXT.JS", "STREAM", "CLERK"],
    href: "https://conference-pi-gray.vercel.app/", live: false, hue: 160, kind: "dash",
  },
  {
    slug: "lor-generator", name: "AI LOR Generator",
    blurb: "Generates letters of recommendation from a short brief, with inline editing before export.",
    tags: ["NEXT.JS", "LLM", "EDITOR"],
    href: "https://ai-lor-generator-with-editing.vercel.app/", live: false, hue: 320, kind: "wave",
  },
  {
    slug: "learnato", name: "Learnato",
    blurb: "Discussion forum for learners — threads, replies and topic navigation.",
    tags: ["NEXT.JS", "FORUM", "AUTH"],
    href: "https://learnato-discussion-forum.vercel.app/", live: false, hue: 190, kind: "grid",
  },
  {
    slug: "media-manager", name: "Media Manager",
    blurb: "Media library with authentication, user profiles and upload management.",
    tags: ["NEXT.JS", "AUTH", "UPLOADS"],
    href: "https://media-manager-with-auth-profile.vercel.app/", live: false, hue: 45, kind: "dash",
  },
  {
    slug: "gemini-chat", name: "Gemini Chatbot",
    blurb: "Streaming chat interface built on the Gemini API.",
    tags: ["REACT", "GEMINI", "STREAMING"],
    href: "https://gemini-react-chatbot-vercel-ui.vercel.app/", live: false, hue: 285, kind: "wave",
  },
];

/** Stand-in project art until real screenshots go in. */
export function projectArt(p: Project): string {
  const h = p.hue;
  const base = `linear-gradient(160deg,hsl(${h} 30% 17%),hsl(${h} 34% 9%))`;
  let deco: string;
  if (p.kind === "dash") {
    deco =
      `radial-gradient(circle 120px at 22% 26%,hsl(${h} 70% 52% / .38),transparent 70%),` +
      `linear-gradient(90deg,transparent 62%,hsl(${h} 40% 24% / .8) 62%)`;
  } else if (p.kind === "wave") {
    deco =
      `radial-gradient(140% 90% at 50% 118%,hsl(${h} 74% 56% / .34),transparent 62%),` +
      `radial-gradient(circle 90px at 76% 24%,hsl(${(h + 40) % 360} 76% 58% / .3),transparent 70%)`;
  } else {
    deco =
      `repeating-linear-gradient(0deg,hsl(${h} 30% 30% / .22) 0 1px,transparent 1px 46px),` +
      `repeating-linear-gradient(90deg,hsl(${h} 30% 30% / .22) 0 1px,transparent 1px 46px),` +
      `radial-gradient(circle 150px at 70% 70%,hsl(${h} 72% 54% / .3),transparent 70%)`;
  }
  return `${deco},${base}`;
}

export const NAV = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Reviews", href: "#reviews" },
  { label: "Pricing", href: "#pricing" },
];

/* ── ABOUT ────────────────────────────────────────────────────────── */
export const ABOUT = {
  quote: "A mechanical engineering degree,",
  quoteHi: "and a production codebase.",
  body: "I taught myself to ship. Five engineering teams across Seattle, Singapore, Palo Alto and India later, I build AI products end to end — retrieval pipelines, document generation, workflow automation, and the interfaces on top of them.",
  bodyBold: "Five engineering teams",
  footLeft: "SWAPNANIL MANNA · NIT DURGAPUR '26",
  footRight: "AVAILABLE NOW",
};

export const METRICS = [
  { to: 8, suffix: "+", label: "PROJECTS SHIPPED" },
  { to: 4, suffix: "×", label: "HACKATHON WINS" },
  { to: 6, suffix: "", label: "TEAMS SHIPPED FOR" },
];

export const CAPABILITIES = [
  { label: "Next.js", icon: "layout" },
  { label: "React", icon: "code" },
  { label: "TypeScript", icon: "grid" },
  { label: "Node.js", icon: "nodes" },
  { label: "PostgreSQL", icon: "diamond" },
  { label: "AI / RAG", icon: "play" },
] as const;

export const CAP_ICONS: Record<string, string> = {
  layout:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8'%3E%3Crect x='3' y='4' width='18' height='16' rx='2.5'/%3E%3Cpath d='M3 9h18M9 9v11'/%3E%3C/svg%3E\")",
  code: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8.5 8L5 12l3.5 4M15.5 8l3.5 4-3.5 4'/%3E%3C/svg%3E\")",
  diamond:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linejoin='round'%3E%3Cpath d='M12 3l9 9-9 9-9-9z'/%3E%3C/svg%3E\")",
  nodes:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8'%3E%3Ccircle cx='12' cy='12' r='2.6'/%3E%3Ccircle cx='5' cy='5' r='1.8'/%3E%3Ccircle cx='19' cy='5' r='1.8'/%3E%3Ccircle cx='5' cy='19' r='1.8'/%3E%3Ccircle cx='19' cy='19' r='1.8'/%3E%3C/svg%3E\")",
  play: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8' stroke-linejoin='round'%3E%3Cpath d='M8 5l11 7-11 7z'/%3E%3C/svg%3E\")",
  grid: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.8'%3E%3Crect x='3.5' y='3.5' width='7' height='7' rx='1.6'/%3E%3Crect x='13.5' y='3.5' width='7' height='7' rx='1.6'/%3E%3Crect x='3.5' y='13.5' width='7' height='7' rx='1.6'/%3E%3Crect x='13.5' y='13.5' width='7' height='7' rx='1.6'/%3E%3C/svg%3E\")",
};

/** the mini "frame" card — current role */
export const CRAFT = {
  label: "CURRENT.ROLE",
  kicker: "HOICHOI · LOGLINEAI",
  head: "AI Applied",
  headHi: "Engineer.",
  btn: "Kolkata",
  dim: "JUL 2026 →",
  footLeft: "Swapnanil",
  footRight: "SHIPPING NOW",
};

export const NOW = {
  label: "▶ CURRENTLY BUILDING WITH",
  title: "Next.js & AI pipelines",
  tools: ["TypeScript", "Postgres", "Claude Code"],
};

/** Pull quote — from the signed Aspir reference letter. */
export const FEATURED_REVIEW = {
  quote: "He strengthened Aspir's backend by building key data portability features. His work ensured the scalability and long-term flexibility of Aspir's systems.",
  by: "NICOLE DOYLE · FOUNDER & CEO, ASPIR",
};

/* ── SERVICES ─────────────────────────────────────────────────────── */
export const SERVICES = [
  {
    n: "01",
    layer: "01 AI-Product-Engineering",
    title: "AI Product Engineering",
    lead: "RAG, agents, pipelines.",
    desc: "AI features built to survive real users, not just a demo video.",
    work: "Retrieval over your own documents, business document generation, OCR pipelines and workflow automation — wired into a real database with real auth, evaluated on real inputs, and deployed. I've shipped this at Aspir, S2T.ai and Hoichoi's AI wing.",
    deliverables: ["RAG systems", "Document generation", "OCR pipelines", "Workflow automation", "LLM integration", "Vector search", "Prompt evaluation", "Agent tooling"],
  },
  {
    n: "02",
    layer: "02 Full-Stack-Development",
    title: "Full-Stack Development",
    lead: "Next.js & Node.",
    desc: "Database to interface, typed the whole way through.",
    work: "Next.js and React on the front, Node, Express and Nest on the back, Postgres or Mongo underneath. Typed end to end, deployed on Vercel or your own cloud, and handed over with the parts your team has to maintain actually documented.",
    deliverables: ["Next.js apps", "REST & API design", "PostgreSQL / MongoDB", "Auth & payments", "Prisma / Drizzle", "AWS · GCP · Azure", "Docker", "CI & deployment"],
  },
  {
    n: "03",
    layer: "03 Zero-To-One",
    title: "0 → 1 Product Builds",
    lead: "Empty repo to launch.",
    desc: "The whole first version, shipped — at startup speed.",
    work: "I've done the 0 → 1 twice over: Aspir's beta and Product Hunt launch out of Seattle, and TickTime's site from the founder's office. Scoping, building, launching, and sticking around for the week after launch when everything actually breaks.",
    deliverables: ["MVP scoping", "Full build", "Launch support", "Analytics", "Landing pages", "Iteration cycles", "Handover docs"],
  },
];

/* ── DIFFERENCE ───────────────────────────────────────────────────── */
export const DIFFERENCE = {
  them: [
    "Front-end only — the API is somebody else's problem.",
    "AI bolted on as a demo that folds under real input.",
    "Hourly billing with a finish line that keeps moving.",
    "Goes quiet for a week between updates.",
    "Ships it, then leaves you the maintenance.",
  ],
  me: [
    "Database, API, AI layer and interface — I own the whole path.",
    "AI features evaluated on real inputs before they ship.",
    "Fixed scope, fixed price, no surprise invoices.",
    "One thread, and a reply within a day.",
    "Deployed, documented, and handed over running.",
  ],
  pick: "work with me",
  foot: "Same brief, same budget. Wildly different outcome.",
};

/* ── WHERE I'VE SHIPPED ───────────────────────────────────────────── */
export const EXPERIENCE = [
  {
    hue: 268, period: "JUL 2026 →", badge: "ONGOING",
    stats: [["Search", "", "PAGE REVAMP"], ["IMDb", "", "SYNC CRON"]],
    name: "Hoichoi", role: "Software Engineer", org: "LOGLINEAI · KOLKATA",
  },
  {
    hue: 210, period: "JAN — JUN 2026", badge: "SHIPPED",
    stats: [["AI", "", "PIPELINES"], ["Azure", "", "DEVOPS"]],
    name: "S2T.ai", role: "AI Product Developer", org: "SINGAPORE · REMOTE",
  },
  {
    hue: 24, period: "AUG — OCT 2025", badge: "0 → 1",
    stats: [["Beta", "", "LAUNCH"], ["JSON", "/CSV", "DATA EXPORT"]],
    name: "Aspir AI", role: "SDE Intern", org: "SEATTLE, USA",
  },
] as const;

/* ── REFERENCES ───────────────────────────────────────────────────── */
// Slot 1 is a real, signed reference. TODO: replace slots 2 and 3, or delete them.
export const NOTES = [
  {
    name: "Nicole Doyle", role: "FOUNDER & CEO, ASPIR", time: "Reference letter",
    text: "Neel demonstrated curiosity, adaptability, and professionalism throughout the program. He collaborated seamlessly across disciplines, grew rapidly in his skills, and consistently embodied the kind of initiative and resilience that define great startup teammates.",
    hearts: 0, thumbs: 0, tag: "SIGNED", real: true,
  },
  {
    name: "Add a reference", role: "ROLE, COMPANY", time: "—",
    text: "Ask a lead from S2T.ai, TickTime or StashBase for two lines. Specific beats glowing: what was broken, what you built, what changed.",
    hearts: 0, thumbs: 0, tag: "PENDING", real: false,
  },
  {
    name: "Add a reference", role: "ROLE, COMPANY", time: "—",
    text: "Ask a lead from S2T.ai, TickTime or StashBase for two lines. Specific beats glowing: what was broken, what you built, what changed.",
    hearts: 0, thumbs: 0, tag: "PENDING", real: false,
  },
];

/* ── PRICING ──────────────────────────────────────────────────────── */
// TODO your actual rates — these are placeholders
export const PLANS = {
  design: { price: "1,200", was: "$1,500", label: "BUILD ONLY", count: "8 things" },
  dev: { price: "2,200", was: "$2,600", label: "BUILD + AI", count: "14 things" },
};

export const DESIGN_FEATURES = [
  "One request at a time", "Next.js / React build", "API & database work",
  "Auth & payments", "Responsive UI", "Unlimited revisions",
  "Direct line to me", "Deployment included",
];

export const DEV_FEATURES = [
  "RAG / retrieval pipeline", "LLM integration", "Document generation",
  "OCR & automation", "Vector database setup", "Prompt evaluation",
];

/* ── FAQ ──────────────────────────────────────────────────────────── */
export const FAQS = [
  {
    frame: "WHAT-I-BUILD.FRAME", n: "01",
    q: "What do you actually build?",
    a: "Full-stack products with an AI layer. Next.js and React on the front, Node or Nest on the back, Postgres or Mongo underneath, and retrieval, document generation or automation wired in where it earns its place. I've shipped that at Aspir, S2T.ai, TickTime and Hoichoi's AI wing.",
  },
  {
    frame: "THE-DEGREE.FRAME", n: "02",
    q: "Your degree says mechanical engineering. How does that work?",
    a: "It says I taught myself this and then got paid to do it, which is the part that matters. Five engineering teams across Seattle, Singapore, Palo Alto and India, four national hackathon wins, and open-source contributions to StashBase. Judge the shipped work, not the department name.",
  },
  {
    frame: "NEED-FOR-SPEED.FRAME", n: "03",
    q: "How fast do you move?",
    a: "First reply within 24 hours. Most individual tasks land in around 48. A full 0 → 1 build is measured in weeks, not months — Aspir's beta and Product Hunt launch took about ten. You'll always know exactly where your request sits.",
  },
  {
    frame: "YOUR-STACK.FRAME", n: "04",
    q: "Can you work inside my existing codebase and team?",
    a: "Yes, and that's most of what I've done. At S2T.ai and Hoichoi I was modifying live pipelines and shipping into someone else's architecture. Tell me your stack and I'll fit it, rather than hand you something only I can maintain.",
  },
  {
    frame: "AI-REALITY.FRAME", n: "05",
    q: "What does an AI feature actually involve?",
    a: "Usually less model and more plumbing: getting your data clean, chunked and indexed, choosing retrieval that fits the shape of the question, then evaluating on inputs your real users would send. The demo is easy — surviving contact with production is the work.",
  },
];

/* ── CTA / FOOTER ─────────────────────────────────────────────────── */
export const CTA = {
  title: "So am I.",
  titleHi: "am I.",
  note: "the sun's up in india",
  lead: "in Kolkata. Perfect light for building, so send it over.",
  primary: "Talk with me",
  secondary: "or see the pricing",
};

export const FOOTER = {
  lead: "HAVE AN IDEA WORTH BUILDING?",
  cta: "Show me the idea",

  /* Links whose href is "#" are filtered out at render time — fill one in and
     it appears by itself. Nothing on this site should ever dead-end. */
  cols: [
    {
      h: "EXPLORE",
      links: [
        { label: "Work", href: "#work" },
        { label: "Services", href: "#services" },
        { label: "About", href: "#about" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      h: "CONNECT",
      links: [
        { label: "LinkedIn", href: PROFILE.links.linkedin },
        { label: "Email", href: `mailto:${PROFILE.email}` },
        { label: "Phone", href: "tel:+918945896607" },
        // TODO fill these in and they'll render automatically
        { label: "GitHub", href: PROFILE.links.github },
        { label: "X", href: PROFILE.links.x },
        { label: "Resume", href: PROFILE.links.resume },
      ],
    },
  ],

  /** Plain facts, not links — nothing here can go nowhere. */
  facts: [
    { k: "BASED IN", v: "Kolkata, India" },
    { k: "TIMEZONE", v: "IST · UTC+5:30" },
    { k: "REPLIES IN", v: "Under 24 hours" },
    { k: "CURRENTLY", v: "Open to freelance" },
  ],

  fileLabel: "swapnanil.fig",
  copyright: `© ${PROFILE.year} · designed & built by Swapnanil Manna`,
};

/* ── ORBIT ────────────────────────────────────────────────────────────
   The constellation moment: a loader of vertical bars morphs into the
   wordmark, then glass orbs fly in and settle into a fixed cluster
   around it, each one slowly rotating so its contents cycle.

   Coordinates are in "cap-height units" relative to the wordmark, so the
   whole cluster scales with the type instead of with the viewport.
   x/y are offsets from the centre of the word; r is the orb radius.
   z is depth: below WORD_Z an orb passes behind the letters, above it
   passes in front. z also scales cursor parallax.                    */

export type OrbKind =
  | "shot"    // a real product screenshot
  | "code"    // scrolling source
  | "chart"   // metrics
  | "wave"    // a dark signal trace
  | "wire"    // latitude/longitude globe
  | "mono"    // the S monogram
  | "burst"   // radial spikes
  | "gem"     // faceted stone
  | "ribbon"; // a band wrapping the sphere

export type Orb = {
  id: string;
  kind: OrbKind;
  x: number;
  y: number;
  r: number;
  z: number;
  /** turns per second; negative spins the other way */
  spin: number;
  /** where it flies in from, same units — settles to x/y */
  fromX: number;
  fromY: number;
  src?: string;
  text?: string;
  tint?: string;
};

/** depth of the wordmark itself — orbs sort in front of or behind it */
export const WORD_Z = 0.5;

export const ORBIT = {
  word: "SHIPPED",
  lede: "Design, code and the AI layer —\nall of it from one person.",
  pill: "Scroll to see the work",
  orbs: [
    { id: "product", kind: "shot",   x: -2.60, y: -0.66, r: 0.62, z: 0.72, spin:  0.055, fromX: -5.4, fromY: -2.6, src: "/work/cazzai.jpg" },
    { id: "signal",  kind: "wave",   x: -1.10, y: -0.98, r: 0.52, z: 0.34, spin: -0.045, fromX: -1.8, fromY: -3.4, tint: "#0D99FF" },
    { id: "metrics", kind: "chart",  x:  0.50, y: -1.06, r: 0.66, z: 0.86, spin:  0.038, fromX:  1.6, fromY: -3.6, tint: "#ffffff" },
    { id: "mesh",    kind: "wire",   x:  2.15, y: -0.94, r: 0.44, z: 0.22, spin:  0.070, fromX:  4.8, fromY: -2.8 },
    { id: "gem",     kind: "gem",    x:  3.02, y: -0.40, r: 0.42, z: 0.78, spin:  0.075, fromX:  5.6, fromY: -1.5, tint: "#8A73D8" },
    { id: "burst",   kind: "burst",  x:  2.05, y:  0.34, r: 0.56, z: 0.30, spin:  0.028, fromX:  5.0, fromY:  2.1 },
    { id: "ribbon",  kind: "ribbon", x:  0.90, y:  0.78, r: 0.60, z: 0.88, spin:  0.060, fromX:  2.2, fromY:  3.4, text: "freelance", tint: "#0D99FF" },
    { id: "code",    kind: "code",   x: -0.80, y:  0.90, r: 0.62, z: 0.64, spin:  0.042, fromX: -1.3, fromY:  3.6 },
    { id: "globe",   kind: "wire",   x: -2.40, y:  0.86, r: 0.58, z: 0.26, spin: -0.050, fromX: -5.2, fromY:  3.0 },
    { id: "mark",    kind: "mono",   x: -3.20, y:  0.40, r: 0.34, z: 0.92, spin:  0.075, fromX: -5.8, fromY:  1.3, tint: "#F0531C" },
  ] as Orb[],
};

/* ── FOOTER ORBS ──────────────────────────────────────────────────────
   The same cluster, re-laid-out around the footer wordmark. It has to
   sit above and across the letters rather than ringing them: the
   wordmark is the last thing on the page, so anything below its centre
   gets clipped by the footer edge. Units are cap-heights of the
   wordmark, measured from its centre.                                */
export const FOOTER_ORBS: Orb[] = [
  { id: "product", kind: "shot",   x: -3.05, y: -0.95, r: 0.50, z: 0.74, spin:  0.055, fromX: -5.6, fromY: -3.0, src: "/work/cazzai.jpg" },
  { id: "signal",  kind: "wave",   x: -1.78, y: -1.34, r: 0.40, z: 0.30, spin: -0.045, fromX: -2.4, fromY: -3.8, tint: "#0D99FF" },
  { id: "metrics", kind: "chart",  x: -0.40, y: -1.10, r: 0.52, z: 0.84, spin:  0.038, fromX:  0.2, fromY: -4.0, tint: "#ffffff" },
  { id: "mesh",    kind: "wire",   x:  0.86, y: -1.46, r: 0.36, z: 0.20, spin:  0.070, fromX:  2.0, fromY: -3.9 },
  { id: "gem",     kind: "gem",    x:  1.98, y: -0.92, r: 0.36, z: 0.80, spin:  0.075, fromX:  4.4, fromY: -3.1, tint: "#8A73D8" },
  { id: "burst",   kind: "burst",  x:  3.10, y: -1.34, r: 0.44, z: 0.28, spin:  0.028, fromX:  5.6, fromY: -3.6 },
  { id: "ribbon",  kind: "ribbon", x:  4.00, y: -0.58, r: 0.46, z: 0.88, spin:  0.060, fromX:  6.4, fromY: -2.4, text: "freelance", tint: "#0D99FF" },
  { id: "code",    kind: "code",   x: -4.10, y: -0.52, r: 0.46, z: 0.62, spin:  0.042, fromX: -6.6, fromY: -2.3 },
  /* these two ride down into the letters, so the word is threaded through
     the cluster rather than sitting under a row of it */
  { id: "globe",   kind: "wire",   x:  1.52, y:  0.14, r: 0.42, z: 0.24, spin: -0.050, fromX:  3.2, fromY: -2.0 },
  { id: "mark",    kind: "mono",   x: -2.42, y:  0.06, r: 0.28, z: 0.92, spin:  0.075, fromX: -4.6, fromY: -1.6, tint: "#F0531C" },
];

/* ── COMPANIES ────────────────────────────────────────────────────────
   The logo wall under "So am I."

   All six ship as trimmed, transparent PNGs in /public/logos. Add a
   company without a `logo` and it falls back to a drawn glass tile
   carrying its wordmark in `tint`.

   Everything in `points` traces to the CV, the signed Aspir reference
   letter, or copy already in this file. Where a period or role isn't
   recorded, the field is left empty and the panel omits that row
   instead of showing a placeholder.                                  */

export type Company = {
  id: string;
  name: string;
  /** file in /public/logos; without it the wordmark tile is drawn */
  logo?: string;
  /** wordmark + rim colour for the drawn tile */
  tint: string;
  role: string;
  /** "" hides the row */
  period: string;
  where: string;
  points: string[];
  stack: string[];
  href?: string;
};

export const COMPANIES: Company[] = [
  {
    id: "hoichoi",
    name: "hoichoi",
    logo: "/logos/hoichoi.png",
    tint: "#E7332B",
    role: "Software Engineer",
    period: "Jul 2026 — present",
    where: "LoglineAI · Kolkata",
    points: [
      "Rebuilt the search page on the streaming platform.",
      "Built the IMDb sync cron that keeps title metadata current.",
      "Shipped into the AI wing's existing pipelines rather than around them.",
    ],
    stack: ["NEXT.JS", "NODE", "CRON", "AI"],
  },
  {
    id: "s2t",
    name: "S2T.ai",
    logo: "/logos/s2t.png",
    tint: "#1E7BFF",
    role: "AI Product Developer",
    period: "Jan — Jun 2026",
    where: "Singapore · Remote",
    points: [
      "Built and modified live AI pipelines in a running product.",
      "Owned the Azure DevOps side of getting that work deployed.",
      "Fitted the existing architecture instead of replacing it.",
    ],
    stack: ["AI PIPELINES", "AZURE", "DEVOPS"],
  },
  {
    id: "aspir",
    name: "Aspir AI",
    logo: "/logos/aspir.png",
    tint: "#7C5CFF",
    role: "SDE Intern",
    period: "Aug — Oct 2025",
    where: "Seattle, USA",
    points: [
      "Built the data-portability features — JSON and CSV export.",
      "Took the beta from nothing to a Product Hunt launch in about ten weeks.",
      "Cited in the founder's reference letter for strengthening the backend.",
    ],
    stack: ["BACKEND", "DATA EXPORT", "0 → 1"],
  },
  {
    id: "ticktime",
    name: "TickTime",
    logo: "/logos/ticktime.png",
    tint: "#2563EB",
    role: "0 → 1 build",
    // TODO period and exact title
    period: "",
    where: "From the founder's office",
    points: [
      "Built and launched the site end to end.",
      "Stayed on through the week after launch, when things actually break.",
    ],
    stack: ["NEXT.JS", "LAUNCH"],
  },
  {
    id: "stashbase",
    name: "StashBase",
    logo: "/logos/stashbase.png",
    tint: "#0EA5E9",
    role: "Open-source contributor",
    // TODO period and the specific PRs worth naming
    period: "",
    where: "StashBase.ai",
    points: ["Contributed to the open-source codebase."],
    stack: ["OPEN SOURCE"],
  },
  {
    id: "zeepty",
    name: "Zeepty",
    logo: "/logos/zeepty.png",
    tint: "#8B3DFF",
    role: "Engineer",
    // TODO nothing about this role is recorded yet — period, scope, what shipped
    period: "",
    where: "",
    points: ["Add what you shipped here — this one has no detail on file yet."],
    stack: [],
  },
];
