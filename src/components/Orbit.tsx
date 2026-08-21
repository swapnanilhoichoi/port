"use client";

import { useEffect, useRef, useState } from "react";
import { ORBIT, WORD_Z, type Orb } from "@/data/site";
import {
  BLUE, BRAND, clamp01, drawOrb, easeInOutCubic, easeOutBack, easeOutCubic,
  makeTexture, orbHalo,
} from "@/lib/orbs";

/* ────────────────────────────────────────────────────────────────────
   THE CONSTELLATION

   Three things happen, in this order:

   1. LOADER   Vertical bars stagger up and hold while a bright wave
               travels across them.
   2. MORPH    The bars slide out to the letter positions and widen; the
               glyphs expand from those stems, so the bars *become* the
               word rather than being replaced by it.
   3. ORBIT    Glass orbs fly in from off-screen, overshoot, and settle
               into a fixed cluster. From then on each one rotates about
               its own axis, so whatever is mapped onto it cycles past.

   The orbs are cylindrically mapped: the visible half of each sphere is
   cut into bands of equal longitude, and each band is blitted from a
   texture at a width of R·Δsin(θ). Bands bunch up at the silhouette on
   their own, which is what sells the curvature. Shading (limb darkening,
   specular, rim light) goes on top of the clip.

   Depth is a single number per orb. It sorts drawing order, decides
   whether an orb passes in front of or behind the letters, and scales
   how far the cursor pushes it.
   ──────────────────────────────────────────────────────────────────── */

/* timeline, seconds from the moment the section scrolls into view */
const T_BAR_IN = 0.42;
const T_HOLD_END = 0.78;
const T_MORPH_END = 1.22;
const T_ORB_START = 1.02;
const ORB_STAGGER = 0.055;
const ORB_DUR = 0.62;

type Live = Orb & {
  hx: number; hy: number;
  px: number; py: number;
  vx: number; vy: number;
  R: number;
  tex: HTMLCanvasElement | null;
  rot: number;
};

export default function Orbit() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const host = useRef<HTMLDivElement | null>(null);
  const [copyIn, setCopyIn] = useState(false);

  useEffect(() => {
    const c = cv.current;
    const box = host.current;
    if (!c || !box) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const fine = matchMedia("(pointer:fine)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let capH = 0; // the unit everything is expressed in
    let wordW = 0;
    let letters: { ch: string; cx: number; w: number }[] = [];
    let live: Live[] = [];
    let started = false;
    let t0 = 0;
    let raf = 0;
    let last = 0;

    const mouse = { x: -9999, y: -9999, has: false };
    const shot = new Image();
    shot.src = ORBIT.orbs.find((o) => o.kind === "shot")?.src ?? "";

    const fam = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-bricolage")
        .trim();
      return v ? `${v}, sans-serif` : "sans-serif";
    };

    function measure() {
      const r = box!.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      c!.width = W * dpr;
      c!.height = H * dpr;
      c!.style.width = `${W}px`;
      c!.style.height = `${H}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // size the word to the viewport, then derive every other measure
      const probe = 100;
      ctx!.font = `800 ${probe}px ${fam()}`;
      const w100 = ctx!.measureText(ORBIT.word).width;
      const target = Math.min(W * 0.80, H * 1.62);
      let fs = (target / w100) * probe;
      fs = Math.min(fs, H * 0.255);
      ctx!.font = `800 ${fs}px ${fam()}`;
      wordW = ctx!.measureText(ORBIT.word).width;
      capH = fs * 0.72;

      // per-letter centres, for the bar → letter morph
      letters = [];
      let x = -wordW / 2;
      for (const ch of ORBIT.word) {
        const lw = ctx!.measureText(ch).width;
        letters.push({ ch, cx: x + lw / 2, w: lw });
        x += lw;
      }

      live = ORBIT.orbs.map((o) => {
        const R = o.r * capH;
        return {
          ...o,
          R,
          hx: o.x * capH,
          hy: o.y * capH,
          px: o.x * capH,
          py: o.y * capH,
          vx: 0,
          vy: 0,
          tex: makeTexture(o, shot),
          rot: Math.random() * Math.PI * 2,
        };
      });
      live.sort((a, b) => a.z - b.z);
    }

    /* ── the word ── */
    function paintWord(now: number) {
      const fs = capH / 0.72;
      ctx!.save();
      ctx!.translate(W / 2, H / 2);
      // the letters drift with the cursor a touch less than a mid-depth orb
      if (mouse.has) {
        ctx!.translate(
          (mouse.x - W / 2) * 0.012,
          (mouse.y - H / 2) * 0.012,
        );
      }
      ctx!.font = `800 ${fs}px ${fam()}`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";

      const barW = capH * 0.13;
      const spread = 0.46; // bars start bunched, then fan out to the letters
      const morph = clamp01((now - T_HOLD_END) / (T_MORPH_END - T_HOLD_END));
      const m = easeInOutCubic(morph);

      letters.forEach((L, i) => {
        const inP = clamp01((now - i * 0.035) / T_BAR_IN);
        if (inP <= 0) return;
        const grow = easeOutCubic(inP);

        const barX = L.cx * spread;
        const x = barX + (L.cx - barX) * m;

        // 1 · the bar itself, fading out as the glyph takes over
        if (m < 1) {
          // a bright wave travels across the bars while they hold
          const wave = Math.sin(now * 5.2 - i * 0.62);
          const hot = Math.max(0, wave) ** 3;
          ctx!.globalAlpha = (1 - m * m) * (0.55 + 0.45 * grow);
          ctx!.fillStyle = i === 2 ? BRAND : i === 4 ? BLUE : "#EAF3FA";
          const bh = capH * 0.94 * grow;
          ctx!.fillRect(x - barW / 2, -bh / 2, barW, bh);
          if (hot > 0.02) {
            ctx!.globalAlpha = (1 - m) * hot * 0.9;
            ctx!.fillStyle = "#fff";
            ctx!.fillRect(x - barW / 2, -bh / 2, barW, bh);
          }
        }

        // 2 · the glyph, revealed by a clip that widens from the stem
        if (m > 0) {
          ctx!.save();
          const cw = Math.max(barW, L.w * 1.06 * m);
          ctx!.beginPath();
          ctx!.rect(x - cw / 2, -capH, cw, capH * 2);
          ctx!.clip();
          ctx!.globalAlpha = Math.min(1, m * 1.6);
          ctx!.fillStyle = "#F7FBFE";
          ctx!.fillText(L.ch, x, 0);
          ctx!.restore();
        }
      });
      ctx!.globalAlpha = 1;
      ctx!.restore();
    }

    /* ── one orb ── */
    function paintOrb(o: Live, now: number, i: number) {
      const born = T_ORB_START + i * ORB_STAGGER;
      const p = clamp01((now - born) / ORB_DUR);
      if (p <= 0) return;
      const e = easeOutBack(p);

      // fly in from off-screen to the resting spot
      const fx = o.fromX * capH;
      const fy = o.fromY * capH;
      const ax = fx + (o.hx - fx) * e;
      const ay = fy + (o.hy - fy) * e;

      const x = W / 2 + ax + o.px - o.hx;
      const y = H / 2 + ay + o.py - o.hy;
      const R = o.R * (0.42 + 0.58 * clamp01(p * 1.25));

      ctx!.save();
      ctx!.translate(x, y);
      ctx!.globalAlpha = clamp01(p * 1.8);

      orbHalo(ctx!, R);
      drawOrb(ctx!, o, R, o.rot, o.tex);
      ctx!.restore();
    }

    /* ── loop ── */
    function frame(ts: number) {
      raf = requestAnimationFrame(frame);
      if (!started) return;
      if (!last) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      const now = reduced ? 99 : (ts - t0) / 1000;

      ctx!.clearRect(0, 0, W, H);

      for (const o of live) {
        o.rot += o.spin * dt * Math.PI * 2;

        // cursor: parallax by depth, plus a soft shove when it gets close
        let tx = o.hx;
        let ty = o.hy;
        if (mouse.has && fine) {
          const par = 8 + o.z * 46;
          tx += ((mouse.x - W / 2) / (W / 2)) * par;
          ty += ((mouse.y - H / 2) / (H / 2)) * par * 0.6;

          const dx = o.px + W / 2 - mouse.x;
          const dy = o.py + H / 2 - mouse.y;
          const d = Math.hypot(dx, dy) || 1;
          const reach = o.R + 96;
          if (d < reach) {
            const f = ((reach - d) / reach) ** 2 * (26 + o.z * 30);
            tx += (dx / d) * f;
            ty += (dy / d) * f;
          }
        }
        // the same spring the hero particles use, tuned heavier
        o.vx = (o.vx + (tx - o.px) * 0.055) * 0.84;
        o.vy = (o.vy + (ty - o.py) * 0.055) * 0.84;
        o.px += o.vx;
        o.py += o.vy;
      }

      // behind the word, then the word, then in front of it
      live.forEach((o, i) => {
        if (o.z < WORD_Z) paintOrb(o, now, i);
      });
      paintWord(now);
      live.forEach((o, i) => {
        if (o.z >= WORD_Z) paintOrb(o, now, i);
      });
    }

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.has = true;
    };
    const onLeave = () => {
      mouse.has = false;
    };

    measure();
    shot.onload = measure;

    const begin = () => {
      if (started) return;
      started = true;
      t0 = performance.now();
      // the copy lands as the orbs are settling
      setTimeout(() => setCopyIn(true), reduced ? 0 : 1150);
    };

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (en.isIntersecting) {
              begin();
              io?.disconnect();
            }
          }
        },
        { threshold: 0.25 },
      );
      io.observe(box);
    } else {
      begin();
    }

    raf = requestAnimationFrame(frame);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerleave", onLeave);

    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(measure, 180);
    };
    addEventListener("resize", onResize);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      io?.disconnect();
      removeEventListener("resize", onResize);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
      shot.onload = null;
    };
  }, []);

  return (
    <section
      id="constellation"
      className="relative z-[6] overflow-hidden bg-black"
      aria-label={`${ORBIT.word} — selected work`}
    >
      <div
        ref={host}
        /* on a narrow, tall screen the cluster is width-bound, so a full
           viewport of height would just be dead black around it */
        className="relative h-[100svh] min-h-[520px] w-full touch-none max-md:h-[72svh]"
      >
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />

        {/* the word is on the canvas, so give assistive tech the real thing */}
        <h2 className="sr-only">{ORBIT.word}</h2>

        <div
          className={`pointer-events-none absolute bottom-[38px] left-[30px] max-w-[34ch] transition-all duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] max-md:left-5 max-md:bottom-6 ${
            copyIn ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <p className="whitespace-pre-line text-[15.5px] leading-[1.42] text-white/90 max-md:text-[13.5px]">
            {ORBIT.lede}
          </p>
          <a
            href="#work"
            className="pointer-events-auto mt-4 inline-flex items-center gap-2.5 rounded-full bg-brand px-[18px] py-[11px] font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-brand-deep"
          >
            {ORBIT.pill}
            <span aria-hidden>↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
