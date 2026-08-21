"use client";

import { useEffect, useRef } from "react";
import { FOOTER_ORBS, WORD_Z, type Orb } from "@/data/site";
import { clamp01, drawOrb, easeOutBack, makeTexture, orbHalo } from "@/lib/orbs";

/* ────────────────────────────────────────────────────────────────────
   The glass cluster, orbiting the footer wordmark.

   Two canvases, not one: the wordmark is its own component with its own
   canvas, so the only way to get orbs both in front of and behind the
   letters is to sandwich it. These render as siblings of the wordmark —
   back at z-0, wordmark at z-1, front at z-2 — and share one simulation.

   Sizing is driven by the wordmark's own box, so the cluster tracks the
   type at every breakpoint instead of the viewport.
   ──────────────────────────────────────────────────────────────────── */

const ORB_DUR = 0.62;
const STAGGER = 0.055;
const START = 0.12;

type Live = Orb & {
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

export default function FooterOrbs() {
  const backRef = useRef<HTMLCanvasElement | null>(null);
  const frontRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const back = backRef.current;
    const front = frontRef.current;
    if (!back || !front) return;
    const zone = back.parentElement;
    if (!zone) return;
    const bc = back.getContext("2d");
    const fc = front.getContext("2d");
    if (!bc || !fc) return;

    const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const fine = matchMedia("(pointer:fine)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let capH = 0;
    let cx = 0;
    let cy = 0;
    let spread = 1; // squeezes the cluster in when it would overrun the box
    let live: Live[] = [];
    let started = false;
    let t0 = 0;
    let raf = 0;
    let last = 0;

    const mouse = { x: -9999, y: -9999, has: false };
    const shot = new Image();
    shot.src = FOOTER_ORBS.find((o) => o.kind === "shot")?.src ?? "";

    function measure() {
      const r = zone!.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      for (const [c, ctx] of [
        [back!, bc!],
        [front!, fc!],
      ] as [HTMLCanvasElement, CanvasRenderingContext2D][]) {
        c.width = W * dpr;
        c.height = H * dpr;
        c.style.width = `${W}px`;
        c.style.height = `${H}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // anchor to the wordmark's actual box, not to the viewport
      const wm = zone!.querySelector<HTMLElement>("[data-wm]");
      const wr = wm?.getBoundingClientRect();
      const wmH = wr?.height ?? H * 0.4;
      cx = W / 2;
      cy = wr ? wr.top - r.top + wmH / 2 : H - wmH / 2;
      // LiquidWordmark sets its type at 1.02× its box height
      capH = wmH * 1.02 * 0.72;

      const maxX = Math.max(...FOOTER_ORBS.map((o) => Math.abs(o.x) + o.r));
      spread = Math.min(1, (W / 2 - 10) / (maxX * capH));

      live = FOOTER_ORBS.map((o) => {
        const hx = o.x * capH * spread;
        const hy = o.y * capH;
        return {
          ...o,
          R: o.r * capH,
          hx,
          hy,
          px: hx,
          py: hy,
          vx: 0,
          vy: 0,
          tex: makeTexture(o, shot),
          rot: Math.random() * Math.PI * 2,
        };
      });
      live.sort((a, b) => a.z - b.z);
    }

    function paint(o: Live, ctx: CanvasRenderingContext2D, now: number, i: number) {
      const p = clamp01((now - (START + i * STAGGER)) / ORB_DUR);
      if (p <= 0) return;
      const e = easeOutBack(p);
      const fx = o.fromX * capH * spread;
      const fy = o.fromY * capH;
      const ax = fx + (o.hx - fx) * e;
      const ay = fy + (o.hy - fy) * e;
      const R = o.R * (0.42 + 0.58 * clamp01(p * 1.25));

      ctx.save();
      ctx.translate(cx + ax + o.px - o.hx, cy + ay + o.py - o.hy);
      ctx.globalAlpha = clamp01(p * 1.8);
      orbHalo(ctx, R);
      drawOrb(ctx, o, R, o.rot, o.tex);
      ctx.restore();
    }

    function frame(ts: number) {
      raf = requestAnimationFrame(frame);
      if (!started) return;
      if (!last) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      const now = reduced ? 99 : (ts - t0) / 1000;

      bc!.clearRect(0, 0, W, H);
      fc!.clearRect(0, 0, W, H);

      for (const o of live) {
        o.rot += o.spin * dt * Math.PI * 2;

        let tx = o.hx;
        let ty = o.hy;
        if (mouse.has && fine) {
          const par = 6 + o.z * 38;
          tx += ((mouse.x - cx) / (W / 2)) * par;
          ty += ((mouse.y - cy) / (H / 2 || 1)) * par * 0.5;

          const dx = o.px + cx - mouse.x;
          const dy = o.py + cy - mouse.y;
          const d = Math.hypot(dx, dy) || 1;
          const reach = o.R + 88;
          if (d < reach) {
            const f = ((reach - d) / reach) ** 2 * (22 + o.z * 26);
            tx += (dx / d) * f;
            ty += (dy / d) * f;
          }
        }
        o.vx = (o.vx + (tx - o.px) * 0.055) * 0.84;
        o.vy = (o.vy + (ty - o.py) * 0.055) * 0.84;
        o.px += o.vx;
        o.py += o.vy;
      }

      live.forEach((o, i) => paint(o, o.z < WORD_Z ? bc! : fc!, now, i));
    }

    const scope = zone.closest("footer") ?? zone;
    const onMove = (e: PointerEvent) => {
      const r = zone.getBoundingClientRect();
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
        { threshold: 0.15 },
      );
      io.observe(zone);
    } else {
      begin();
    }

    raf = requestAnimationFrame(frame);
    scope.addEventListener("pointermove", onMove as EventListener);
    scope.addEventListener("pointerleave", onLeave);

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
      scope.removeEventListener("pointermove", onMove as EventListener);
      scope.removeEventListener("pointerleave", onLeave);
      shot.onload = null;
    };
  }, []);

  return (
    <>
      <canvas
        ref={backRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />
      <canvas
        ref={frontRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
      />
    </>
  );
}
