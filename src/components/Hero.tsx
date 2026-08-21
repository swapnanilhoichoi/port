"use client";

import { useEffect, useRef } from "react";
import { HERO, PROFILE } from "@/data/site";

const COLS = ["#F0531C", "#F0531C", "#F0531C", "#14202B", "#0D99FF"];
const LINES = HERO.lines;

type P = { x: number; y: number; vx: number; vy: number; c: string; tx: number; ty: number };

/**
 * The headline is a particle field: the two lines are drawn to an offscreen
 * canvas in Anton, sampled on a 2–3px grid, and every opaque pixel becomes a
 * dot that springs to its target and is repelled by the cursor.
 */
function ParticleHeadline() {
  const cv = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const fine = matchMedia("(pointer:fine)").matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let particles: P[] = [];
    let PSIZE = 2.9;
    const mouse = { x: -9999, y: -9999 };

    // next/font hashes the family name, so read it back off the CSS variable
    const antonFamily = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-anton")
        .trim();
      return v ? `${v}, sans-serif` : "Anton, sans-serif";
    };

    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      const r = c.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const build = () => {
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d");
      if (!o) return;
      const fam = antonFamily();
      o.fillStyle = "#000";
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.font = `700 100px ${fam}`;
      let w100 = 1;
      for (const l of LINES) w100 = Math.max(w100, o.measureText(l).width);
      const fs = Math.min((W * 0.9 / w100) * 100, H * 0.46);
      o.font = `700 ${fs}px ${fam}`;
      const lh = fs * 0.92;
      o.fillText(LINES[0], W / 2, H / 2 - lh / 2);
      o.fillText(LINES[1], W / 2, H / 2 + lh / 2);

      const data = o.getImageData(0, 0, W, H).data;
      const step = Math.max(2, Math.min(3, Math.round(fs / 47)));
      PSIZE = Math.max(2.2, Math.min(2.55, fs / 72));

      const next: P[] = [];
      let k = 0;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 128) {
            const prev = particles[k];
            next.push(
              prev
                ? { ...prev, tx: x, ty: y }
                : {
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: 0,
                    vy: 0,
                    c: COLS[k % COLS.length],
                    tx: x,
                    ty: y,
                  },
            );
            k++;
          }
        }
      }
      particles = next;
    };

    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      const R = 92;
      for (const p of particles) {
        let ax = (p.tx - p.x) * 0.02;
        let ay = (p.ty - p.y) * 0.02;
        if (fine) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = ((R - d) / R) * 4.5;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
        }
        p.vx = (p.vx + ax) * 0.86;
        p.vy = (p.vy + ay) * 0.86;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, PSIZE, PSIZE);
      }
      raf = requestAnimationFrame(frame);
    };

    const init = () => {
      size();
      build();
    };

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    c.addEventListener("pointermove", onMove);
    c.addEventListener("pointerleave", onLeave);

    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(init, 200);
    };
    addEventListener("resize", onResize);

    init();
    raf = requestAnimationFrame(frame);
    // re-sample once Anton has actually loaded; the fallback face mis-measures
    document.fonts?.ready.then(init).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      removeEventListener("resize", onResize);
      c.removeEventListener("pointermove", onMove);
      c.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={cv}
      className="mb-1 mt-[22px] h-[min(38vh,300px)] w-full touch-none"
      aria-label={HERO.lines.join(" ")}
      role="img"
    />
  );
}

/** The subhead you can grab and fling — it springs back on release. */
function DraggableSub() {
  const el = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = el.current;
    if (!node || !matchMedia("(pointer:fine)").matches) return;
    let on = false;
    let sx = 0;
    let sy = 0;

    const down = (e: PointerEvent) => {
      on = true;
      sx = e.clientX;
      sy = e.clientY;
      node.setPointerCapture(e.pointerId);
      node.style.transition = "";
      node.dataset.dragging = "1";
    };
    const move = (e: PointerEvent) => {
      if (!on) return;
      node.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px)`;
    };
    const up = () => {
      if (!on) return;
      on = false;
      delete node.dataset.dragging;
      node.style.transition = "transform .6s cubic-bezier(.34,1.4,.5,1)";
      node.style.transform = "translate(0,0)";
    };

    node.addEventListener("pointerdown", down);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
    return () => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div
      ref={el}
      data-drag
      className="relative max-w-[540px] cursor-grab select-none rounded-[2px] px-3.5 py-2.5 text-center font-deco text-[26px] leading-[1.32] tracking-[0.005em] outline outline-[1.4px] outline-dashed outline-blue active:cursor-grabbing data-[dragging]:bg-white/35 data-[dragging]:outline-solid"
    >
      <span className="absolute -top-[22px] left-[-1px] whitespace-nowrap rounded-t bg-blue px-1.5 py-[2px] font-mono text-[9.5px] font-bold tracking-[0.06em] text-white">
        do not drag
      </span>
      <i className="handle -left-[5px] -top-[5px]" />
      <i className="handle -right-[5px] -top-[5px]" />
      <i className="handle -bottom-[5px] -left-[5px]" />
      <i className="handle -bottom-[5px] -right-[5px]" />
      {HERO.sub}
    </div>
  );
}

export default function Hero() {
  return (
    <header
      id="phero"
      className="relative z-[5] grid min-h-screen place-items-center pb-[78px] pt-[calc(var(--spacing-rail)+92px)]"
    >
      <div className="absolute bottom-[42px] left-[30px] hidden font-mono text-[10px] font-bold uppercase leading-[1.65] tracking-[0.14em] sm:block">
        {HERO.cornerLeft[0]}
        <br />
        <span className="font-normal text-ink-soft">{HERO.cornerLeft[1]}</span>
      </div>
      <div className="absolute bottom-[42px] right-[30px] hidden text-right font-mono text-[10px] font-bold uppercase leading-[1.65] tracking-[0.14em] sm:block">
        {HERO.cornerRight[0]}
        <br />
        <span className="font-normal text-ink-soft">{HERO.cornerRight[1]}</span>
      </div>

      <div className="mx-auto flex w-full max-w-[1224px] flex-col items-center px-[72px] max-md:px-6">
        <div className="relative">
          <div className="relative inline-flex h-[46px] items-center gap-[9px] rounded-lg border border-line-2 bg-white/90 px-[22px] shadow-[0_14px_34px_-26px_rgba(20,32,43,.6)] outline outline-[1.4px] -outline-offset-1 outline-blue backdrop-blur-[10px]">
            <i className="handle -left-[5px] -top-[5px]" />
            <i className="handle -right-[5px] -top-[5px]" />
            <i className="handle -bottom-[5px] -left-[5px]" />
            <i className="handle -bottom-[5px] -right-[5px]" />
            <span className="text-[15px]">{HERO.badgePre}</span>
            <span className="grid h-[22px] w-[22px] place-items-center rounded-[5px] bg-brand text-[13px] font-bold text-white">
              {HERO.badgeMark}
            </span>
            <span className="text-[15px] font-semibold text-brand">{HERO.badgeHi}</span>
            <span className="text-[15px] text-ink-soft">{HERO.badgePost}</span>
          </div>
        </div>

        <ParticleHeadline />
        <h1 className="sr-only">{PROFILE.name} — {PROFILE.role}</h1>

        <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
          {HERO.hint}
        </div>

        <DraggableSub />

        <div className="mt-[26px] flex flex-wrap justify-center gap-3">
          <a href="#contact" className="btn-primary">
            {HERO.primaryCta} <span className="arrow">→</span>
          </a>
          <a href="#work" className="btn-ghost">
            {HERO.secondaryCta}
          </a>
        </div>
      </div>
    </header>
  );
}
