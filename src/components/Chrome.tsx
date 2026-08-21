"use client";

import { useEffect, useRef, useState } from "react";
import { NAV, EMAIL, PROFILE } from "@/data/site";
import { clamp, useMediaQuery, useMounted, useScrollProgress } from "@/lib/hooks";

/* ══════════ LOADER ══════════ */
export function Loader() {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let armT = 0;
    let hideT = 0;
    let closed = false;

    const reveal = () => {
      if (closed) return;
      closed = true;
      setDone(true);
      document.body.classList.add("loaded");
      hideT = window.setTimeout(() => setGone(true), 1000);
    };
    // let the intro play through, then leave
    const arm = () => { armT = window.setTimeout(reveal, 1600); };
    if (document.readyState === "complete") arm();
    else addEventListener("load", arm);
    // hard floor, in case `load` never fires
    const floorT = window.setTimeout(reveal, 2500);

    return () => {
      removeEventListener("load", arm);
      clearTimeout(armT);
      clearTimeout(hideT);
      clearTimeout(floorT);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[#FBFDFF] transition-transform duration-[850ms] ease-[cubic-bezier(.7,0,.2,1)] ${
        done ? "-translate-y-[101%]" : "translate-y-0"
      }`}
    >
      <div className="ld-grid absolute inset-0" />
      <div className="relative z-[2] flex flex-col items-center gap-[30px]">
        <div className="ld-sel relative px-6 py-3.5">
          <span className="ld-mark block font-display text-[clamp(40px,8vw,84px)] font-extrabold tracking-[-0.03em] text-ink">
            <span className="text-brand">{PROFILE.wordmark.charAt(0)}</span>
            {PROFILE.wordmark.slice(1)}
          </span>
          <i className="ld-h ld-h-tl" />
          <i className="ld-h ld-h-tr" />
          <i className="ld-h ld-h-bl" />
          <i className="ld-h ld-h-br" />
          <span className="ld-dim absolute -bottom-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-blue px-2 py-0.5 font-mono text-[11px] font-bold text-white">
            1280 × 196
          </span>
        </div>
        <div className="h-[3px] w-[170px] overflow-hidden rounded-[3px] bg-blue/15">
          <span className="ld-fill block h-full rounded-[3px] bg-blue" />
        </div>
      </div>
    </div>
  );
}

/* ══════════ SKY ══════════ */
const CLOUDS = [
  { c: "a", w: 440, h: 210, top: "9%", dur: 70, delay: -8, o: 0.95 },
  { c: "b", w: 300, h: 110, top: "28%", dur: 96, delay: -52, o: 0.6 },
  { c: "a", w: 400, h: 190, top: "44%", dur: 60, delay: -30, o: 0.82 },
  { c: "b", w: 240, h: 118, top: "64%", dur: 110, delay: -74, o: 0.5 },
  { c: "a", w: 320, h: 150, top: "5%", dur: 80, delay: -46, o: 0.72 },
  { c: "b", w: 200, h: 96, top: "52%", dur: 124, delay: -18, o: 0.46 },
  { c: "a", w: 340, h: 150, top: "14%", dur: 88, delay: -22, o: 0.5 },
  { c: "b", w: 300, h: 130, top: "78%", dur: 116, delay: -60, o: 0.4 },
  { c: "a", w: 240, h: 108, top: "3%", dur: 100, delay: -12, o: 0.46 },
];

export function Sky() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {CLOUDS.map((c, i) => (
        <span
          key={i}
          className={`cloud cloud-${c.c}`}
          style={{
            width: c.w,
            height: c.h,
            top: c.top,
            opacity: c.o,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════ RULER ══════════ */
export function Ruler() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const ticksRef = useRef<HTMLDivElement | null>(null);
  const badge = useRef<HTMLSpanElement | null>(null);
  const p = useScrollProgress();
  const mounted = useMounted();
  const [time, setTime] = useState("");

  // ruler ticks
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const draw = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const W = Math.max(1, r.width);
      const H = Math.max(1, r.height);
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const UNITS = 1200;
      const px = W / UNITS;
      ctx.font = '9px var(--font-space-mono), monospace';
      ctx.textAlign = "left";
      for (let u = 0; u <= UNITS; u += 10) {
        const x = Math.round(u * px) + 0.5;
        const major = u % 100 === 0;
        const mid = u % 50 === 0;
        ctx.strokeStyle = major
          ? "rgba(20,32,43,.34)"
          : mid
            ? "rgba(20,32,43,.22)"
            : "rgba(20,32,43,.13)";
        ctx.lineWidth = 1;
        const len = major ? 9 : mid ? 6 : 4;
        ctx.beginPath();
        ctx.moveTo(x, H - len);
        ctx.lineTo(x, H);
        ctx.stroke();
        if (major && u > 0) {
          ctx.fillStyle = "rgba(20,32,43,.5)";
          ctx.fillText(String(u), x + 3, 12);
        }
      }
    };
    draw();
    let t: ReturnType<typeof setTimeout>;
    const on = () => {
      clearTimeout(t);
      t = setTimeout(draw, 150);
    };
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("resize", on);
      clearTimeout(t);
    };
  }, []);

  // live clock
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      const h = d.getHours();
      const ap = h >= 12 ? "PM" : "AM";
      setTime(`${pad(h % 12 || 12)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ap}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // badge rides the fill edge
  useEffect(() => {
    const t = ticksRef.current;
    const b = badge.current;
    if (!t || !b) return;
    const w = t.clientWidth;
    const bw = b.offsetWidth || 26;
    b.style.transform = `translateX(${clamp(p * w - bw - 4, 0, w - bw - 8)}px)`;
  }, [p]);

  const label = p > 0.995 ? "SHIPPED" : `${Math.round(p * 100)}%`;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex h-rail items-stretch border-b border-line-2 bg-white/[0.82] font-mono backdrop-blur-[14px] backdrop-saturate-150">
      <div className="flex w-[145px] flex-none items-center gap-2 border-r border-line-2 pl-3.5 text-[10px] font-bold tracking-[0.16em] text-ink">
        <b className="om-mark-ink h-5 w-5 flex-none rounded-md bg-ink" />
        {PROFILE.wordmark.toUpperCase()}
      </div>

      <div ref={ticksRef} className="relative flex-1 overflow-hidden">
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />
        <div
          className="absolute inset-y-0 left-0 border-r-[1.5px] border-brand bg-[linear-gradient(90deg,rgba(240,83,28,.10),rgba(240,83,28,.26))]"
          style={{ width: `${p * 100}%` }}
        />
        <span
          ref={badge}
          className="absolute left-1 top-[5px] whitespace-nowrap rounded bg-brand px-[5px] py-[2px] text-[10px] font-bold tracking-[0.06em] text-white"
        >
          {mounted ? label : "0%"}
        </span>
      </div>

      <div className="flex w-[168px] flex-none items-center justify-center gap-1.5 border-l border-line-2 text-[10px] font-bold tracking-[0.1em] text-ink-soft">
        <span className="animate-blip h-[7px] w-[7px] rounded-full bg-[#22C55E] shadow-[0_0_0_3px_#22c55e33]" />
        LIVE&nbsp;·&nbsp;<span className="tabular-nums">{time || "--:--:-- --"}</span>
      </div>
    </div>
  );
}

/* ══════════ TOP BAR ══════════ */
export function TopBar() {
  const [active, setActive] = useState("#top");

  useEffect(() => {
    const upd = () => {
      const y = window.scrollY + window.innerHeight * 0.32;
      let best = "#top";
      for (const n of NAV) {
        const el = document.querySelector(n.href);
        if (!el) continue;
        if (el.getBoundingClientRect().top + window.scrollY <= y) best = n.href;
      }
      setActive(best);
    };
    upd();
    window.addEventListener("scroll", upd, { passive: true });
    return () => window.removeEventListener("scroll", upd);
  }, []);

  const pill =
    "inline-flex items-center gap-[9px] rounded-full border border-line-2 bg-white/[0.92] shadow-[0_10px_26px_-18px_rgba(20,32,43,.55)] backdrop-blur-[12px]";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(var(--spacing-rail)+16px)] z-[95] flex items-center justify-between px-[26px]">
      <div className={`${pill} pointer-events-auto h-[39px] px-4 text-[13.5px] font-medium`}>
        <span className="animate-blip h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_0_3px_#22c55e2e]" />
        {PROFILE.availability}
      </div>

      <nav className={`${pill} pointer-events-auto hidden h-[52px] gap-0.5 px-2 md:flex`}>
        {NAV.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className={`inline-flex h-9 items-center rounded-full px-[13px] text-[14.5px] font-medium transition-colors hover:text-brand ${
              active === n.href ? "text-brand" : "text-ink"
            }`}
          >
            {n.label}
          </a>
        ))}
        <a
          href="#contact"
          className="inline-flex h-[38px] items-center rounded-full bg-ink px-[17px] text-[14.5px] font-semibold text-white transition-colors hover:bg-brand"
        >
          Contact
        </a>
      </nav>

      <a
        href={`mailto:${EMAIL}`}
        className={`${pill} pointer-events-auto hidden h-[37px] px-[15px] font-mono text-[11.5px] transition-colors hover:text-brand lg:inline-flex`}
      >
        <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] fill-none stroke-ink-soft stroke-[1.6]">
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M3 7l9 6 9-6" />
        </svg>
        {EMAIL}
      </a>
    </div>
  );
}

/* ══════════ CURSORS ══════════ */
export function Cursors() {
  const you = useRef<HTMLDivElement | null>(null);
  const mate = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLSpanElement | null>(null);
  const fine = useMediaQuery("(pointer:fine)");

  useEffect(() => {
    if (!fine) return;
    document.body.classList.add("no-cursor");

    let tx = innerWidth * 0.62;
    let ty = innerHeight * 0.5;
    let x = tx;
    let y = ty;
    const HOT = "a,button,summary,[role=button]";

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as Element | null;
      const hot = t?.closest?.(HOT);
      const drag = t?.closest?.("[data-drag]");
      const talk = t?.closest?.("[data-talk]");
      you.current?.classList.toggle("cursor-hot", !!(hot || talk));
      if (nameRef.current)
        nameRef.current.textContent = talk
          ? "let's talk"
          : hot
            ? "click"
            : drag
              ? "drag"
              : "You";
    };
    addEventListener("pointermove", move, { passive: true });

    let raf = 0;
    const follow = () => {
      x += (tx - x) * 0.38;
      y += (ty - y) * 0.38;
      if (you.current)
        you.current.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);

    // ambient second cursor on the canvas
    let timer: ReturnType<typeof setTimeout>;
    if (!PROFILE.guestCursor) return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      document.body.classList.remove("no-cursor");
    };
    const wander = () => {
      if (mate.current) {
        const mx = 90 + Math.random() * (innerWidth - 240);
        const my = 120 + Math.random() * (innerHeight - 260);
        mate.current.style.transform = `translate3d(${mx}px,${my}px,0)`;
      }
      timer = setTimeout(wander, 2200 + Math.random() * 2600);
    };
    if (mate.current)
      mate.current.style.transform = `translate3d(${innerWidth * 0.28}px,${innerHeight * 0.62}px,0)`;
    timer = setTimeout(wander, 1400);

    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      document.body.classList.remove("no-cursor");
    };
  }, [fine]);

  if (!fine) return null;

  const chip =
    "absolute left-4 top-4 whitespace-nowrap rounded-[0_5px_5px_5px] px-2 py-[2px] font-mono text-[11px] font-bold text-white shadow-[0_6px_16px_-8px_rgba(20,32,43,.6)]";

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      <div ref={you} className="absolute left-0 top-0 h-7 w-[22px] [&.cursor-hot_span]:bg-brand">
        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] drop-shadow-[0_3px_6px_rgba(20,32,43,.28)]">
          <path d="M5 3l14 7-6 2-2 6z" fill="#0D99FF" stroke="#fff" strokeWidth="1.2" />
        </svg>
        <span ref={nameRef} className={`${chip} bg-blue transition-colors`}>You</span>
      </div>
      {PROFILE.guestCursor && <div
        ref={mate}
        className="absolute left-0 top-0 h-7 w-[22px] transition-transform duration-[2400ms] ease-[cubic-bezier(.32,.72,.28,1)]"
      >
        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] drop-shadow-[0_3px_6px_rgba(20,32,43,.28)]">
          <path d="M5 3l14 7-6 2-2 6z" fill="#F0531C" stroke="#fff" strokeWidth="1.2" />
        </svg>
        <span className={`${chip} bg-brand`}>{PROFILE.guestCursor}</span>
      </div>}
    </div>
  );
}

/* ══════════ TAB-TITLE TEASE ══════════ */
export function TitleTease() {
  useEffect(() => {
    const real = document.title;
    const away = [
      "hey, where are you going?",
      "ok, come back now.",
      "still here, still better.",
      "impossible to ignore, remember?",
    ];
    let i = 0;
    let id: ReturnType<typeof setInterval> | null = null;
    const blur = () => {
      i = 0;
      document.title = away[0];
      id = setInterval(() => {
        i = (i + 1) % away.length;
        document.title = away[i];
      }, 2400);
    };
    const focus = () => {
      if (id) clearInterval(id);
      document.title = real;
    };
    addEventListener("blur", blur);
    addEventListener("focus", focus);
    return () => {
      removeEventListener("blur", blur);
      removeEventListener("focus", focus);
      if (id) clearInterval(id);
      document.title = real;
    };
  }, []);
  return null;
}
