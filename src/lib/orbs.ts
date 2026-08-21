import type { Orb } from "@/data/site";

/* ────────────────────────────────────────────────────────────────────
   THE ORB SYSTEM

   Shared by every surface that wants the glass cluster. Nothing here
   touches React or the DOM beyond making offscreen texture canvases.

   Orbs are cylindrically mapped: the visible half of each sphere is cut
   into bands of equal longitude, and each band is blitted from a texture
   at a width of R·Δsin(θ). Bands bunch up at the silhouette on their
   own, which is what sells the curvature. Shading (limb darkening,
   specular, rim light) goes on top of the clip.
   ──────────────────────────────────────────────────────────────────── */

const BANDS = 34; // longitude slices per orb — enough that the seams vanish
const TEX_W = 512; // texture is stored doubled, so a band never wraps
const TEX_H = 256;

const INK = "#14202B";
const BRAND = "#F0531C";
const BLUE = "#0D99FF";

/* timeline, seconds from the moment the section scrolls into view */
const T_BAR_IN = 0.42;
const T_HOLD_END = 0.78;
const T_MORPH_END = 1.22;
const T_ORB_START = 1.02;
const ORB_STAGGER = 0.055;
const ORB_DUR = 0.62;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
/** overshoot, so the orbs arrive with weight instead of just stopping */
const easeOutBack = (p: number) => {
  const c = 1.42;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};

type Live = Orb & {
  /* current + home position in px, and velocity, for the cursor spring */
  hx: number;
  hy: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  R: number;
  tex: HTMLCanvasElement | null;
  rot: number;
};

/* ── textures ─────────────────────────────────────────────────────────
   Drawn once at layout time into a canvas that is TEX_W*2 wide with the
   content duplicated, so sampling at any u in [0,1] can read a full band
   without wrapping logic.                                             */

function tile(draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement("canvas");
  cv.width = TEX_W * 2;
  cv.height = TEX_H;
  const c = cv.getContext("2d");
  if (!c) return cv;
  c.save();
  draw(c);
  c.restore();
  c.save();
  c.translate(TEX_W, 0);
  draw(c);
  c.restore();
  return cv;
}

function codeTex() {
  // Short lines, drawn as two columns. A sphere shows half the tile at a
  // time, so any gap here becomes a blank face as the orb turns.
  const A = [
    "export async function POST(req) {",
    "  const { q } = await req.json()",
    "  const hits = await index.query({",
    "    vector: await embed(q),",
    "    topK: 8,",
    "  })",
    "  return streamText({ model, hits })",
    "}",
    "",
    "const model = google('gemini-2.5')",
    "await db.insert(docs).values(rows)",
    "revalidatePath('/dashboard')",
  ];
  const B = [
    "type Plan = 'free' | 'pro'",
    "",
    "export const auth = betterAuth({",
    "  database: drizzleAdapter(db),",
    "  emailAndPassword: { enabled: 1 },",
    "})",
    "",
    "await queue.enqueue('reindex', {",
    "  tenantId, after: cursor,",
    "})",
    "",
    "logger.info('shipped', { ms })",
  ];
  return tile((c) => {
    c.fillStyle = "#080D12";
    c.fillRect(0, 0, TEX_W, TEX_H);
    c.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
    c.textBaseline = "top";
    const col = (lines: string[], x: number) =>
      lines.forEach((l, i) => {
        c.fillStyle = i % 4 === 1 ? BLUE : i % 5 === 0 ? "#7FE3B0" : "#93A9BC";
        c.fillText(l, x, 12 + i * 20);
      });
    col(A, 10);
    col(B, 266);
  });
}

function chartTex(tint: string) {
  return tile((c) => {
    const g = c.createLinearGradient(0, 0, 0, TEX_H);
    g.addColorStop(0, "#F4F8FB");
    g.addColorStop(1, "#C9D8E4");
    c.fillStyle = g;
    c.fillRect(0, 0, TEX_W, TEX_H);
    // gridlines
    c.strokeStyle = "rgba(20,32,43,.10)";
    c.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      c.beginPath();
      c.moveTo(0, (TEX_H / 5) * i);
      c.lineTo(TEX_W, (TEX_H / 5) * i);
      c.stroke();
    }
    // columns
    const n = 11;
    const bw = TEX_W / n;
    for (let i = 0; i < n; i++) {
      const h = 26 + Math.abs(Math.sin(i * 1.27)) * 150;
      c.fillStyle = i % 3 === 0 ? tint : "rgba(13,153,255,.55)";
      c.fillRect(i * bw + bw * 0.24, TEX_H - 30 - h, bw * 0.5, h);
    }
    // trend line
    c.strokeStyle = BRAND;
    c.lineWidth = 3;
    c.beginPath();
    for (let i = 0; i <= n; i++) {
      const x = i * bw;
      const y = TEX_H - 62 - Math.abs(Math.cos(i * 0.9)) * 120;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    c.fillStyle = "rgba(20,32,43,.45)";
    c.font = "bold 12px ui-monospace, Menlo, monospace";
    c.fillText("SHIPPED / MONTH", 14, 16);
  });
}

/** Dark counterpart to chartTex, so two data orbs never read as duplicates. */
function waveTex(tint: string) {
  return tile((c) => {
    c.fillStyle = "#070C11";
    c.fillRect(0, 0, TEX_W, TEX_H);
    c.strokeStyle = "rgba(140,180,215,.13)";
    c.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      c.beginPath();
      c.moveTo(0, (TEX_H / 6) * i);
      c.lineTo(TEX_W, (TEX_H / 6) * i);
      c.stroke();
    }
    // two traces, phase-shifted, with the brand one on top
    const trace = (phase: number, amp: number, col: string, w: number) => {
      c.strokeStyle = col;
      c.lineWidth = w;
      c.beginPath();
      for (let x = 0; x <= TEX_W; x += 4) {
        const k = (x / TEX_W) * Math.PI * 6 + phase;
        const y =
          TEX_H / 2 + Math.sin(k) * amp * (0.6 + 0.4 * Math.sin(k * 0.37));
        x ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    };
    trace(0.8, 54, tint, 2);
    trace(0, 70, BRAND, 3);
    c.fillStyle = "rgba(190,215,235,.5)";
    c.font = "bold 12px ui-monospace, Menlo, monospace";
    c.fillText("LATENCY p95", 14, 18);
  });
}

function monoTex(tint: string) {
  return tile((c) => {
    c.fillStyle = INK;
    c.fillRect(0, 0, TEX_W, TEX_H);
    c.textAlign = "center";
    c.textBaseline = "middle";
    // two marks, half a turn apart — the visible hemisphere is half the tile,
    // so exactly one faces forward at any rotation
    for (const f of [0.25, 0.75]) {
      const cx = TEX_W * f;
      const sz = 116;
      c.fillStyle = tint;
      c.beginPath();
      c.roundRect(cx - sz / 2, (TEX_H - sz) / 2, sz, sz, 28);
      c.fill();
      c.fillStyle = "#fff";
      c.font = "800 76px ui-sans-serif, system-ui, sans-serif";
      c.fillText("S", cx, TEX_H / 2 + 4);
    }
    c.textAlign = "left";
  });
}

function shotTex(img: HTMLImageElement | null) {
  return tile((c) => {
    c.fillStyle = INK;
    c.fillRect(0, 0, TEX_W, TEX_H);
    if (!img || !img.complete || !img.naturalWidth) return;
    // crop to the interface itself — cover-fitting the whole render would put
    // the surrounding sky on the sphere, and the product would be unreadable
    const sw = img.naturalWidth * 0.84;
    const sh = img.naturalHeight * 0.72;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;
    const s = Math.max(TEX_W / sw, TEX_H / sh);
    const w = sw * s;
    const h = sh * s;
    c.drawImage(img, sx, sy, sw, sh, (TEX_W - w) / 2, (TEX_H - h) / 2, w, h);
  });
}

/* ── sphere ───────────────────────────────────────────────────────── */

/** Blit the visible hemisphere of a cylindrically mapped texture. */
function bandMap(
  c: CanvasRenderingContext2D,
  tex: HTMLCanvasElement,
  R: number,
  rot: number,
) {
  for (let i = 0; i < BANDS; i++) {
    const t0 = -Math.PI / 2 + (Math.PI * i) / BANDS;
    const t1 = -Math.PI / 2 + (Math.PI * (i + 1)) / BANDS;
    const x0 = Math.sin(t0) * R;
    const x1 = Math.sin(t1) * R;
    const w = x1 - x0;
    if (w <= 0.05) continue;

    // longitude → texture u, wrapped into the first copy
    let u = (((t0 + rot) / (Math.PI * 2)) % 1 + 1) % 1;
    const du = (t1 - t0) / (Math.PI * 2);

    c.drawImage(
      tex,
      u * TEX_W, 0, du * TEX_W, TEX_H,
      x0, -R, w, R * 2,
    );

    // limb darkening: bands near the silhouette turn away from the light
    const shade = 1 - Math.cos((t0 + t1) / 2) ** 0.7;
    if (shade > 0.01) {
      c.fillStyle = `rgba(4,9,14,${shade * 0.86})`;
      c.fillRect(x0, -R, w + 0.6, R * 2);
    }
  }
}

/** Everything that makes a filled circle read as glass. */
function glassShell(
  c: CanvasRenderingContext2D,
  R: number,
  rim = "rgba(190,225,255,.5)",
  rimW = 0.035,
  ring = 0,
  spec = 0.82,
  vig = 0.92,
) {
  // vignette toward the rim
  const v = c.createRadialGradient(-R * 0.22, -R * 0.28, R * 0.1, 0, 0, R);
  v.addColorStop(0, "rgba(255,255,255,0)");
  v.addColorStop(0.62, "rgba(4,9,14,0)");
  v.addColorStop(1, `rgba(2,5,9,${vig})`);
  c.fillStyle = v;
  c.beginPath();
  c.arc(0, 0, R, 0, Math.PI * 2);
  c.fill();

  // specular — the small hard highlight that reads as a glass surface
  const s = c.createRadialGradient(
    -R * 0.38, -R * 0.44, 0,
    -R * 0.38, -R * 0.44, R * 0.52,
  );
  s.addColorStop(0, `rgba(255,255,255,${spec})`);
  s.addColorStop(0.35, `rgba(255,255,255,${spec * 0.2})`);
  s.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = s;
  c.beginPath();
  c.arc(0, 0, R, 0, Math.PI * 2);
  c.fill();

  // rim light along the lower-right, where the sky would bounce back up
  c.save();
  // a faint band all the way round, for orbs that carry a lit edge
  if (ring > 0) {
    c.beginPath();
    c.arc(0, 0, R * 0.97, 0, Math.PI * 2);
    c.strokeStyle = rim;
    c.globalAlpha = ring;
    c.lineWidth = Math.max(1, R * rimW * 0.8);
    c.stroke();
    c.globalAlpha = 1;
  }
  c.beginPath();
  c.arc(0, 0, R * 0.985, Math.PI * 0.08, Math.PI * 0.92);
  c.strokeStyle = rim;
  c.lineWidth = Math.max(1, R * rimW);
  c.stroke();
  c.restore();
}

function drawWire(c: CanvasRenderingContext2D, R: number, rot: number) {
  c.strokeStyle = "rgba(214,234,250,.62)";
  c.lineWidth = Math.max(0.6, R * 0.012);
  // latitudes
  for (let i = 1; i < 8; i++) {
    const phi = (Math.PI * i) / 8 - Math.PI / 2;
    const y = Math.sin(phi) * R;
    const rx = Math.cos(phi) * R;
    c.beginPath();
    c.ellipse(0, y, rx, rx * 0.20, 0, 0, Math.PI * 2);
    c.stroke();
  }
  // longitudes — squashed by their angle to the viewer, so they spin
  for (let i = 0; i < 9; i++) {
    const a = rot + (Math.PI * i) / 9;
    const rx = Math.abs(Math.cos(a)) * R;
    if (rx < 0.6) continue;
    c.globalAlpha = 0.35 + Math.abs(Math.cos(a)) * 0.5;
    c.beginPath();
    c.ellipse(0, 0, rx, R, 0, 0, Math.PI * 2);
    c.stroke();
  }
  c.globalAlpha = 1;
}

function drawBurst(c: CanvasRenderingContext2D, R: number, rot: number) {
  const N = 132;
  for (let i = 0; i < N; i++) {
    const a = (Math.PI * 2 * i) / N + rot * 0.4;
    // pseudo-random but stable length
    const len = R * (0.42 + ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 0.58);
    c.globalAlpha = 0.32 + (i % 3) * 0.22;
    c.strokeStyle = i % 11 === 0 ? BRAND : "rgba(232,244,255,.9)";
    c.lineWidth = Math.max(0.5, R * 0.008);
    c.beginPath();
    c.moveTo(Math.cos(a) * R * 0.06, Math.sin(a) * R * 0.06);
    c.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    c.stroke();
  }
  c.globalAlpha = 1;
}

/** The four-pointed sparkle: concave waists, glossy top-left lighting. */
function sparkle(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
) {
  c.save();
  c.translate(x, y);
  c.beginPath();
  const k = 0.26; // how far the control points sit off-centre → waist depth
  c.moveTo(0, -r);
  c.quadraticCurveTo(r * k, -r * k, r, 0);
  c.quadraticCurveTo(r * k, r * k, 0, r);
  c.quadraticCurveTo(-r * k, r * k, -r, 0);
  c.quadraticCurveTo(-r * k, -r * k, 0, -r);
  c.closePath();
  const g = c.createLinearGradient(-r * 0.75, -r * 0.85, r * 0.65, r * 0.8);
  g.addColorStop(0, "#FBF9FF");
  g.addColorStop(0.28, "#DDD2FB");
  g.addColorStop(0.62, "#B6A2EF");
  g.addColorStop(1, "#7A62CE");
  c.fillStyle = g;
  c.fill();
  c.restore();
}

/** The thick lavender edge the reference orb carries. */
function violetRim(c: CanvasRenderingContext2D, R: number) {
  // even base glow at the very edge
  const rg = c.createRadialGradient(0, 0, R * 0.70, 0, 0, R);
  rg.addColorStop(0, "rgba(150,116,236,0)");
  rg.addColorStop(0.72, "rgba(163,130,240,.18)");
  rg.addColorStop(1, "rgba(206,188,255,.62)");
  c.fillStyle = rg;
  c.beginPath();
  c.arc(0, 0, R, 0, Math.PI * 2);
  c.fill();

  /* The lit edge is brightest where the key light wraps the lower-left, with
     a weaker bounce on the opposite shoulder. Stroking arc segments to fake
     the falloff leaves tick marks wherever they butt or overlap, so use a
     real conic gradient and clip it to an annulus. */
  const KEY = Math.PI * 0.86;
  const BOUNCE = Math.PI * 1.80;
  const near = (a: number, b: number) => {
    let d = Math.abs(a - b) % (Math.PI * 2);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d;
  };
  const amtAt = (a: number) => {
    const k = Math.max(0, Math.cos(near(a, KEY) * 0.92)) ** 2.2;
    const b = Math.max(0, Math.cos(near(a, BOUNCE) * 1.25)) ** 3 * 0.45;
    return Math.min(1, k + b);
  };

  const ring = (inner: number, alpha: number) => {
    c.save();
    c.beginPath();
    c.arc(0, 0, R, 0, Math.PI * 2);
    c.arc(0, 0, R * inner, 0, Math.PI * 2, true);
    c.clip("evenodd");
    if (typeof c.createConicGradient === "function") {
      const cg = c.createConicGradient(0, 0, 0);
      for (let i = 0; i <= 48; i++) {
        const t = i / 48;
        cg.addColorStop(t, `rgba(228,216,255,${alpha * amtAt(t * Math.PI * 2)})`);
      }
      c.fillStyle = cg;
    } else {
      c.fillStyle = `rgba(228,216,255,${alpha * 0.55})`;
    }
    c.fillRect(-R, -R, R * 2, R * 2);
    c.restore();
  };
  // two passes give the band a soft inward falloff
  ring(0.84, 0.42);
  ring(0.93, 0.95);
}

/**
 * Indigo glass with sparkles ON the surface — mapping them through bandMap is
 * what makes them squash to slivers at the limb, which is the whole tell.
 * Six across the tile means about three face forward at any rotation.
 */
function sparkTex() {
  // one cycle of three — big / small / biggest — repeated twice round the
  // tile at even spacing, so exactly three face forward at any rotation
  const MARKS: [number, number, number][] = [
    [32, 92, 26], [96, 60, 17], [160, 154, 32], [224, 104, 22],
    [288, 92, 26], [352, 60, 17], [416, 154, 32], [480, 104, 22],
  ];
  return tile((c) => {
    c.fillStyle = "#140A2E";
    c.fillRect(0, 0, TEX_W, TEX_H);
    // marbling
    for (const [bx, by, br] of [
      [90, 60, 130], [300, 190, 160], [430, 70, 120], [200, 120, 110],
    ] as [number, number, number][]) {
      const g = c.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, "rgba(96,56,176,.72)");
      g.addColorStop(1, "rgba(96,56,176,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, TEX_W, TEX_H);
    }
    // star dust — stable, not random, so the texture is identical each build
    for (let i = 0; i < 150; i++) {
      const x = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * TEX_W;
      const y = ((Math.sin(i * 78.233) * 12345.6789) % 1 + 1) % 1 * TEX_H;
      const a = 0.25 + (((Math.sin(i * 3.71) * 997.13) % 1 + 1) % 1) * 0.6;
      c.fillStyle = `rgba(255,255,255,${a})`;
      c.fillRect(x, y, 1.4, 1.4);
    }
    for (const [x, y, r] of MARKS) sparkle(c, x, y, r);
  });
}

function drawRibbon(
  c: CanvasRenderingContext2D,
  R: number,
  rot: number,
  text: string,
  tint: string,
) {
  // dark glass ball first
  const g = c.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.05, 0, 0, R);
  g.addColorStop(0, "#25313D");
  g.addColorStop(1, "#05090D");
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, R, 0, Math.PI * 2);
  c.fill();

  // a band wrapping the sphere: front half only, tilted
  c.save();
  c.rotate(-0.30);
  const bandH = R * 0.34;
  c.fillStyle = tint;
  c.fillRect(-R, -bandH / 2, R * 2, bandH);
  c.fillStyle = "#fff";
  c.font = `bold ${Math.round(bandH * 0.52)}px ui-monospace, Menlo, monospace`;
  c.textBaseline = "middle";
  const label = `${text} · `;
  const step = c.measureText(label).width;
  let x = -R - ((rot * R * 1.2) % step);
  while (x < R) {
    c.fillText(label, x, 1);
    x += step;
  }
  // the band curves away at the edges
  const e = c.createLinearGradient(-R, 0, R, 0);
  e.addColorStop(0, "rgba(2,5,9,.95)");
  e.addColorStop(0.22, "rgba(2,5,9,0)");
  e.addColorStop(0.78, "rgba(2,5,9,0)");
  e.addColorStop(1, "rgba(2,5,9,.95)");
  c.fillStyle = e;
  c.fillRect(-R, -bandH / 2, R * 2, bandH);
  c.restore();
}


/** Bake the texture an orb needs, or null when it is drawn vectorially. */
export function makeTexture(
  o: Orb,
  shot: HTMLImageElement | null,
): HTMLCanvasElement | null {
  switch (o.kind) {
    case "code": return codeTex();
    case "chart": return chartTex(o.tint ?? BLUE);
    case "wave": return waveTex(o.tint ?? BLUE);
    case "mono": return monoTex(o.tint ?? BRAND);
    case "gem": return sparkTex();
    case "shot": return shotTex(shot);
    default: return null;
  }
}

/**
 * Draw one orb of radius R at the current origin. Caller owns the
 * translate, the alpha and any halo.
 */
export function drawOrb(
  c: CanvasRenderingContext2D,
  o: Orb,
  R: number,
  rot: number,
  tex: HTMLCanvasElement | null,
) {
  c.save();
  c.beginPath();
  c.arc(0, 0, R, 0, Math.PI * 2);
  c.clip();

  c.fillStyle = "#060B10";
  c.fillRect(-R, -R, R * 2, R * 2);

  if (tex) bandMap(c, tex, R, rot);
  else if (o.kind === "wire") drawWire(c, R, rot);
  else if (o.kind === "burst") drawBurst(c, R, rot);
  else if (o.kind === "ribbon") drawRibbon(c, R, rot, o.text ?? "", o.tint ?? BLUE);

  if (o.kind === "gem") {
    glassShell(c, R, "rgba(0,0,0,0)", 0.001, 0, 0.26, 0.42);
    violetRim(c, R);
  } else {
    glassShell(c, R);
  }
  c.restore();
}

/** The soft contact glow that sits an orb in the dark instead of on it. */
export function orbHalo(c: CanvasRenderingContext2D, R: number) {
  const halo = c.createRadialGradient(0, 0, R * 0.8, 0, 0, R * 1.5);
  halo.addColorStop(0, "rgba(120,180,230,.18)");
  halo.addColorStop(1, "rgba(120,180,230,0)");
  c.fillStyle = halo;
  c.beginPath();
  c.arc(0, 0, R * 1.5, 0, Math.PI * 2);
  c.fill();
}

export { BRAND, BLUE, INK, clamp01, easeOutCubic, easeInOutCubic, easeOutBack };
