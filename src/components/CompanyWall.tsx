"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { COMPANIES, type Company } from "@/data/site";

/* ────────────────────────────────────────────────────────────────────
   THE LOGO WALL

   Hovering a tile kicks it upward and then lets go — from there it is a
   plain ballistic integration: gravity accelerates it down, and each
   time it reaches the floor the velocity flips and loses energy to
   restitution. That is why the bounces get shorter on their own; there
   is no keyframed "bounce" curve anywhere.

   Squash and stretch is driven off that same velocity rather than being
   timed to it. In the air the tile stretches along its direction of
   travel; on contact the impact speed loads a damped spring, which is
   what gives the squash its wobble as it recovers. Volume is roughly
   conserved — whatever one axis gains the other gives up.

   The contact shadow reads the tile's height, so it tightens and darkens
   as the tile lands. Without it the motion looks like scaling, not
   falling.
   ──────────────────────────────────────────────────────────────────── */

const G = 2900; // px/s² — heavier than earth, so it settles quickly
const IMPULSE = 780; // px/s upward, on hover
const RESTITUTION = 0.5; // energy kept per bounce
const SLEEP = 46; // below this impact speed it stops bouncing

// squash spring
const SQ_K = 940;
const SQ_C = 21;

type Body = {
  el: HTMLElement;
  shadow: HTMLElement;
  y: number; // px, 0 = resting, negative = airborne
  vy: number;
  sq: number; // 0 = neutral, 1 = fully squashed
  vsq: number;
};

export default function CompanyWall() {
  const wrap = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const root = wrap.current;
    if (!root) return;
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;

    const bodies: Body[] = [];
    root.querySelectorAll<HTMLElement>("[data-tile]").forEach((tile) => {
      const el = tile.querySelector<HTMLElement>("[data-body]");
      const shadow = tile.querySelector<HTMLElement>("[data-shadow]");
      if (!el || !shadow) return;
      const b: Body = { el, shadow, y: 0, vy: 0, sq: 0, vsq: 0 };
      bodies.push(b);

      const kick = () => {
        // only re-kick once it has essentially settled, so hovering fast
        // doesn't pump it into orbit
        if (b.y > -3 && Math.abs(b.vy) < 60) b.vy = -IMPULSE;
      };
      tile.addEventListener("pointerenter", kick);
      tile.addEventListener("focus", kick);
      (b as Body & { off?: () => void }).off = () => {
        tile.removeEventListener("pointerenter", kick);
        tile.removeEventListener("focus", kick);
      };
    });

    let raf = 0;
    let last = 0;
    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame);
      if (!last) last = ts;
      // clamp dt so a backgrounded tab doesn't teleport anything
      const dt = Math.min(0.032, (ts - last) / 1000);
      last = ts;

      for (const b of bodies) {
        const moving = b.y !== 0 || b.vy !== 0 || b.sq !== 0 || b.vsq !== 0;
        if (!moving) continue;

        b.vy += G * dt;
        b.y += b.vy * dt;

        if (b.y >= 0) {
          b.y = 0;
          if (Math.abs(b.vy) > SLEEP) {
            // impact loads the squash spring, then the bounce
            b.vsq -= Math.min(1, Math.abs(b.vy) / 620) * 34;
            b.vy = -b.vy * RESTITUTION;
          } else {
            b.vy = 0;
          }
        }

        // damped spring back to neutral — this is the wobble
        b.vsq += (-SQ_K * b.sq - SQ_C * b.vsq) * dt;
        b.sq += b.vsq * dt;
        if (Math.abs(b.sq) < 0.0015 && Math.abs(b.vsq) < 0.02) {
          b.sq = 0;
          b.vsq = 0;
        }

        // airborne stretch along the direction of travel
        const air = Math.min(0.16, Math.abs(b.vy) / 5200);
        const sy = 1 - b.sq * 0.3 + air;
        const sx = 1 + b.sq * 0.24 - air * 0.62;

        b.el.style.transform =
          `translate3d(0,${b.y.toFixed(2)}px,0) scale(${sx.toFixed(4)},${sy.toFixed(4)})`;

        const lift = Math.min(1, -b.y / 150);
        b.shadow.style.transform = `scale(${(1 - lift * 0.42).toFixed(3)})`;
        b.shadow.style.opacity = (0.34 * (1 - lift * 0.66)).toFixed(3);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      for (const b of bodies) (b as Body & { off?: () => void }).off?.();
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setOpen((cur) => (cur === id ? null : id));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  const active = COMPANIES.find((c) => c.id === open) ?? null;

  return (
    <div className="mt-16">
      <p className="mb-9 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink-soft">
        teams I&apos;ve shipped for
        <span className="mx-2 text-ink-faint/50">·</span>
        <span className="text-brand">tap a logo for the work</span>
      </p>

      {/* pt gives the tiles headroom to actually leave the ground */}
      <div
        ref={wrap}
        className="flex flex-wrap items-end justify-center gap-x-6 gap-y-10 pt-[86px]"
      >
        {COMPANIES.map((c) => {
          const on = open === c.id;
          return (
            <button
              key={c.id}
              data-tile
              type="button"
              onClick={() => toggle(c.id)}
              aria-expanded={on}
              aria-controls="company-detail"
              className="group relative flex w-[164px] flex-col items-center outline-none max-md:w-[104px]"
            >
              {/* The tile and its floor. The shadow has to be a sibling of the
                  moving body and hang below the artwork — parked behind it,
                  the opaque logo hides it and the bounce loses its ground. */}
              <span className="relative block aspect-square w-full">
                <span
                  data-shadow
                  aria-hidden
                  className="pointer-events-none absolute -bottom-[9px] left-1/2 h-[16px] w-[64%] -translate-x-1/2 rounded-[50%] bg-ink/55 blur-[8px]"
                  style={{ opacity: 0.34 }}
                />
                <span
                  data-body
                  className="absolute inset-0 origin-bottom will-change-transform"
                >
                  {c.logo ? (
                    <Image
                      src={c.logo}
                      alt={`${c.name} logo`}
                      fill
                      sizes="(max-width: 768px) 104px, 164px"
                      draggable={false}
                      className="select-none object-contain"
                    />
                  ) : (
                    <GlassMark c={c} />
                  )}
                </span>
              </span>

              <span
                className={`mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
                  on ? "text-brand" : "text-ink-soft group-hover:text-ink"
                }`}
              >
                {c.name}
              </span>
              <span
                className={`mt-1.5 h-[3px] rounded-full bg-brand transition-all duration-300 ${
                  on ? "w-6 opacity-100" : "w-0 opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* details — grid-rows 0fr→1fr animates height without measuring it */}
      <div
        id="company-detail"
        className={`grid text-left transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.22,.61,.36,1)] ${
          active ? "mt-10 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {active && <Detail c={active} onClose={() => setOpen(null)} />}
        </div>
      </div>
    </div>
  );
}

/**
 * Glass tile for companies with no logo file. Tuned to sit beside the real
 * hoichoi render rather than beneath it: a thick bright edge, a coloured
 * refraction ring just inside it, and a wordmark with a short extrude.
 */
function GlassMark({ c }: { c: Company }) {
  return (
    <span
      className="absolute inset-0 grid place-items-center rounded-[24%] border-2 border-white/85 backdrop-blur-[3px]"
      style={{
        background:
          "linear-gradient(151deg,rgba(255,255,255,.78) 0%,rgba(255,255,255,.30) 34%," +
          "rgba(255,255,255,.10) 55%,rgba(255,255,255,.52) 100%)",
        boxShadow: `inset 0 3px 4px rgba(255,255,255,1),
                    inset 0 -5px 9px rgba(255,255,255,.75),
                    inset 5px 0 10px rgba(255,255,255,.5),
                    inset -5px 0 10px rgba(255,255,255,.5),
                    inset 0 0 0 3px ${c.tint}3D,
                    inset 0 0 14px 2px ${c.tint}26,
                    0 0 0 1px ${c.tint}26,
                    0 16px 28px -18px ${c.tint}88,
                    0 20px 34px -22px rgba(20,32,43,.6)`,
      }}
    >
      <span
        className="px-2 text-center text-[17px] font-extrabold leading-none tracking-[-0.025em] max-md:text-[13px]"
        style={{
          color: c.tint,
          textShadow: `0 1px 0 rgba(255,255,255,.9),
                       0 2px 0 ${c.tint}66,
                       0 3px 5px ${c.tint}55`,
        }}
      >
        {c.name}
      </span>
    </span>
  );
}

function Detail({ c, onClose }: { c: Company; onClose: () => void }) {
  const rows: [string, string][] = [
    ["ROLE", c.role],
    ["WHEN", c.period],
    ["WHERE", c.where],
  ];
  return (
    <div className="card mx-auto mt-0 max-w-[860px] rounded-[18px] p-7 max-md:p-5">
      <div className="flex items-start justify-between gap-5">
        <div className="flex flex-wrap gap-x-9 gap-y-3">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <div className="font-mono text-[9.5px] font-bold tracking-[0.14em] text-ink-faint">
                  {k}
                </div>
                <div className="mt-1 text-[15px] font-semibold text-ink">{v}</div>
              </div>
            ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="grid h-8 w-8 flex-none place-items-center rounded-full border border-line-2 text-sm text-ink-soft transition hover:bg-ink hover:text-white"
        >
          ✕
        </button>
      </div>

      <ul className="mt-6 grid gap-2.5">
        {c.points.map((p) => (
          <li key={p} className="flex gap-3 text-[15px] leading-[1.5] text-ink-soft">
            <b
              className="mt-[9px] h-[5px] w-[5px] flex-none rounded-full"
              style={{ background: c.tint }}
            />
            {p}
          </li>
        ))}
      </ul>

      {c.stack.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {c.stack.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line-2 px-[11px] py-[5px] font-mono text-[10px] font-bold tracking-[0.1em] text-ink-soft"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
