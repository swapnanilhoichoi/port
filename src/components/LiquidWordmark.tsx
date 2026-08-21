"use client";

import { useEffect, useRef } from "react";
import { PROFILE } from "@/data/site";

/**
 * The wordmark behaves like a sheet of liquid.
 *
 * The text is rendered once to an offscreen canvas, then blitted back one
 * horizontal band at a time. Each band is displaced by a falloff around a
 * "cut line" that follows the pointer, so everything below the cut lags behind
 * and the seam stretches. A gooey SVG filter (blur → alpha contrast) welds the
 * bands back together, which is what turns the seam into liquid and pinches
 * thin features off into droplets.
 *
 * Pull is driven by pointer travel and decays on a spring, so it settles back
 * to clean type when you stop moving.
 */
export default function LiquidWordmark() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const c = cv.current;
    const box = host.current;
    if (!c || !box) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let off: HTMLCanvasElement | null = null;

    // pointer state, in canvas space
    const p = { x: -9999, y: -9999, px: -9999, py: -9999, inside: false };
    // where the lower half is, and where it's being pulled to
    const pull = { x: 0, y: 0, vx: 0, vy: 0 };
    const target = { x: 0, y: 0 };
    const CAP = 34; // the sheet sags — it does not fly apart
    // the seam, eased toward the pointer so it doesn't snap
    let cut = 0.5;

    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

    const BAND = 3; // px per blitted band — small enough that the filter hides it

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

      // bake the type once
      off = document.createElement("canvas");
      off.width = W * dpr;
      off.height = H * dpr;
      const o = off.getContext("2d");
      if (!o) return;
      o.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fam =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--font-bricolage")
          .trim() || "sans-serif";
      // fill the box: size from width, then clamp so descenders still fit
      let size = H * 1.02;
      o.font = `800 ${size}px ${fam}, sans-serif`;
      const w = o.measureText(PROFILE.wordmark).width;
      if (w > W) size *= W / w;
      o.font = `800 ${size}px ${fam}, sans-serif`;
      o.textAlign = "center";
      o.textBaseline = "alphabetic";

      const text = PROFILE.wordmark;
      const total = o.measureText(text).width;
      const baseline = H * 0.86;
      let x = W / 2 - total / 2;
      // first letter in brand orange, the rest white
      for (let i = 0; i < text.length; i++) {
        o.fillStyle = i === 0 ? "#F0531C" : "#ffffff";
        o.textAlign = "left";
        o.fillText(text[i], x, baseline);
        x += o.measureText(text[i]).width;
      }
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!off) return;

      // the pull target bleeds away, and the sheet springs toward it
      target.x *= 0.90;
      target.y *= 0.90;
      pull.vx += (target.x - pull.x) * 0.16;
      pull.vy += (target.y - pull.y) * 0.16;
      pull.vx *= 0.80;
      pull.vy *= 0.80;
      pull.x += pull.vx;
      pull.y += pull.vy;

      if (p.inside) cut += (p.y / H - cut) * 0.12;

      // the gooey filter rounds off corners, so only pay for it while the
      // sheet is actually moving — at rest the type stays crisp
      const mag = Math.hypot(pull.x, pull.y);
      const wet = mag > 0.7;
      if (wet !== isWet) {
        isWet = wet;
        c!.style.filter = wet ? "url(#wm-goo)" : "none";
      }
      if (wet && blurNode) {
        blurNode.setAttribute("stdDeviation", String(Math.min(7, 1.5 + mag * 0.22)));
      }

      ctx!.clearRect(0, 0, W, H);

      const cutPx = cut * H;
      // how wide the seam transition is — wider when pulled harder
      const band = 26 + Math.min(70, Math.abs(pull.y) * 1.6);

      for (let y = 0; y < H; y += BAND) {
        // -1 fully above the cut, +1 fully below, smoothstepped through the seam
        const t = Math.max(-1, Math.min(1, (y - cutPx) / band));
        const s = t <= -1 ? 0 : t >= 1 ? 1 : (t + 1) / 2;
        const w = s * s * (3 - 2 * s); // smoothstep

        const dx = w * pull.x;
        const dy = w * pull.y;
        const h = Math.min(BAND, H - y);

        ctx!.drawImage(
          off,
          0, y * dpr, W * dpr, h * dpr,
          dx, y + dy, W, h,
        );
      }
    }

    let raf = 0;
    let isWet = false;
    const blurNode = document.querySelector<SVGFEGaussianBlurElement>("#wm-goo feGaussianBlur");

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const first = !p.inside;
      p.inside = true;
      p.px = p.x;
      p.py = p.y;
      p.x = x;
      p.y = y;
      if (first) {
        cut = y / H;
        return;
      }
      // pointer travel drags the sheet, mostly downward, and always gently
      const dx = p.x - p.px;
      const dy = p.y - p.py;
      const step = Math.min(60, Math.hypot(dx, dy)); // ignore teleports
      const k = step > 0 ? step / Math.max(1, Math.hypot(dx, dy)) : 0;
      target.x = clamp(target.x + dx * k * 0.16, -CAP * 0.7, CAP * 0.7);
      target.y = clamp(target.y + dy * k * 0.16 + step * 0.05, -CAP, CAP);
    };
    const onLeave = () => {
      p.inside = false;
    };

    measure();
    if (reduced) {
      // static type, no simulation
      ctx.clearRect(0, 0, W, H);
      if (off) ctx.drawImage(off, 0, 0, W * dpr, H * dpr, 0, 0, W, H);
      return;
    }

    raf = requestAnimationFrame(frame);
    const scope = box.closest("footer") ?? box;
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
      removeEventListener("resize", onResize);
      scope.removeEventListener("pointermove", onMove as EventListener);
      scope.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={host}
      aria-label={PROFILE.wordmark}
      role="img"
      data-talk
      className="relative h-[clamp(72px,13.4vw,196px)] w-full select-none"
    >
      {/* blur → alpha-contrast: neighbouring bands fuse, thin ones pinch off */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <filter id="wm-goo" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 26 -13"
            />
          </filter>
        </defs>
      </svg>
      <canvas ref={cv} className="h-full w-full" />
    </div>
  );
}
