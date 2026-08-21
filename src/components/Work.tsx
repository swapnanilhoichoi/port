"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECTS, projectArt } from "@/data/site";
import { clamp } from "@/lib/hooks";

export default function Work() {
  const track = useRef<HTMLDivElement | null>(null);
  const rail = useRef<HTMLDivElement | null>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const [idx, setIdx] = useState(0);

  const drag = useRef({ on: false, startX: 0, startOff: 0, moved: 0, offset: 0 });
  const idxRef = useRef(0);

  const centerFor = useCallback((i: number) => {
    const it = items.current[i];
    if (!it) return 0;
    return -(it.offsetLeft + it.offsetWidth / 2);
  }, []);

  const paint = useCallback((offset: number, anim: boolean) => {
    const t = track.current;
    if (!t) return;
    t.style.transition = anim ? "transform .62s cubic-bezier(.22,.61,.36,1)" : "none";
    t.style.transform = `translateX(${offset}px)`;
  }, []);

  const go = useCallback(
    (i: number, anim = true) => {
      const next = clamp(i, 0, PROJECTS.length - 1);
      idxRef.current = next;
      setIdx(next);
      const off = centerFor(next);
      drag.current.offset = off;
      paint(off, anim);
    },
    [centerFor, paint],
  );

  // settle once fonts/layout are final
  // recentre without touching state — layout settles after fonts land
  const recentre = useCallback(() => {
    const off = centerFor(idxRef.current);
    drag.current.offset = off;
    paint(off, false);
  }, [centerFor, paint]);

  useEffect(() => {
    recentre();
    const t = setTimeout(recentre, 400);
    document.fonts?.ready.then(recentre).catch(() => {});
    addEventListener("resize", recentre);
    return () => {
      clearTimeout(t);
      removeEventListener("resize", recentre);
    };
  }, [recentre]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const r = rail.current;
      if (!r) return;
      const b = r.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight) return;
      if (e.key === "ArrowLeft") go(idxRef.current - 1);
      if (e.key === "ArrowRight") go(idxRef.current + 1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [go]);

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("a")) return;
    drag.current.on = true;
    drag.current.moved = 0;
    drag.current.startX = e.clientX;
    drag.current.startOff = drag.current.offset;
    rail.current?.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.on) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.abs(dx);
    d.offset = d.startOff + dx;
    paint(d.offset, false);
  };
  const onUp = () => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    let best = 0;
    let bestD = Infinity;
    PROJECTS.forEach((_, i) => {
      const dist = Math.abs(centerFor(i) - d.offset);
      if (dist < bestD) {
        bestD = dist;
        best = i;
      }
    });
    go(best);
  };

  return (
    <section id="work" className="relative z-[5] overflow-hidden pb-20 pt-14">
      <div
        ref={rail}
        className="relative h-[600px] cursor-grab active:cursor-grabbing max-md:h-[440px]"
        data-drag
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          ref={track}
          className="absolute left-1/2 top-0 flex h-full items-center gap-[34px]"
        >
          {PROJECTS.map((p, i) => {
            const on = i === idx;
            return (
              <article
                key={p.slug}
                ref={(el) => {
                  items.current[i] = el;
                }}
                className={`card relative w-[768px] flex-none rounded-[22px] p-6 transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,.61,.36,1)] max-md:w-[86vw] max-md:p-4 ${
                  on ? "scale-100 opacity-100" : "scale-90 opacity-55"
                }`}
              >
                <span
                  className={`absolute -left-2 -top-[30px] rounded-t-[5px] bg-blue px-2 py-[3px] font-mono text-[10px] font-bold text-white transition-opacity duration-400 ${
                    on ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {p.slug}
                </span>
                {on && (
                  <>
                    <i className="handle -left-[13px] -top-[13px]" />
                    <i className="handle -right-[13px] -top-[13px]" />
                    <i className="handle -bottom-[13px] -left-[13px]" />
                    <i className="handle -bottom-[13px] -right-[13px]" />
                    <span className="pointer-events-none absolute -inset-2 rounded-[26px] border-[1.4px] border-blue" />
                  </>
                )}

                <div className="relative aspect-[747/523] overflow-hidden rounded-[13px] bg-[#101A24]">
                  {p.shot ? (
                    /* real screenshot — fills the same slot the mockup occupied */
                    <Image
                      src={p.shot}
                      alt={`${p.name} — product screenshot`}
                      fill
                      sizes="(max-width: 768px) 86vw, 720px"
                      priority={i === 0}
                      draggable={false}
                      className="select-none object-cover"
                    />
                  ) : (
                    <>
                      <i className="absolute inset-0 block" style={{ background: projectArt(p) }} />
                      {/* stand-in site chrome */}
                      <div className="absolute inset-0 flex flex-col px-[34px] py-[26px] text-white max-md:px-4 max-md:py-3">
                        <div className="flex items-center gap-3">
                          <span className="h-[22px] w-[22px] rounded-[7px] bg-white/85" />
                          <span className="h-[7px] w-[46px] rounded bg-white/25" />
                          <span className="h-[7px] w-[46px] rounded bg-white/25" />
                          <span className="h-[7px] w-[46px] rounded bg-white/25" />
                          <span className="ml-auto h-6 w-[74px] rounded-[7px] bg-white/85" />
                        </div>
                        <div className="my-auto grid max-w-[62%] gap-[11px]">
                          <span className="h-[9px] w-24 rounded bg-white/35" />
                          <span className="block h-[26px] rounded-[7px] bg-white/90" />
                          <span className="block h-[26px] w-[58%] rounded-[7px] bg-white/90" />
                          <div className="mt-1.5 flex gap-2.5">
                            <span className="h-[30px] w-[104px] rounded-lg bg-white/90" />
                            <span className="h-[30px] w-[104px] rounded-lg shadow-[inset_0_0_0_1.6px_rgba(255,255,255,.4)]" />
                          </div>
                        </div>
                        <div className="mt-auto grid grid-cols-3 gap-3">
                          <div className="h-[72px] rounded-[10px] bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]" />
                          <div className="h-[72px] rounded-[10px] bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]" />
                          <div className="h-[72px] rounded-[10px] bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]" />
                        </div>
                      </div>
                    </>
                  )}
                  {p.href !== "#" && (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${p.name}`}
                      className="absolute right-3.5 top-3.5 grid h-[38px] w-[38px] place-items-center rounded-full bg-ink/70 text-base text-white backdrop-blur-[6px] transition hover:-translate-y-0.5 hover:bg-brand"
                    >
                      ↗
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 px-2.5 pb-0.5 pt-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-[11px] font-display text-[26px] font-bold tracking-[-0.02em] max-md:text-lg">
                      <b className="h-2 w-2 flex-none rounded-full bg-brand" />
                      {p.name}
                      {!p.live && p.href !== "#" && (
                        <span className="rounded bg-ink/8 px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.1em] text-ink-faint">
                          OFFLINE
                        </span>
                      )}
                    </div>
                    <p className="mt-1 max-w-[52ch] pl-[19px] text-[14.5px] leading-[1.45] text-ink-soft max-md:hidden">
                      {p.blurb}
                    </p>
                  </div>
                  <div className="flex gap-2 max-md:hidden">
                    {p.tags.map((t, ti) => (
                      <span
                        key={t}
                        className={`whitespace-nowrap rounded-full border px-[11px] py-[5px] font-mono text-[10px] font-bold tracking-[0.1em] ${
                          ti === 0
                            ? "border-brand/25 bg-brand/5 text-brand"
                            : "border-line-2 text-ink-soft"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-[34px] flex justify-center gap-2">
        {PROJECTS.map((p, i) => (
          <button
            key={p.slug}
            aria-label={`Go to ${p.name}`}
            onClick={() => go(i)}
            className={`h-1 rounded-[3px] transition-all duration-300 ${
              i === idx ? "w-[38px] bg-brand" : "w-[34px] bg-ink/15"
            }`}
          />
        ))}
      </div>

      <div className="mt-[22px] flex justify-center gap-3.5">
        <button
          aria-label="Previous project"
          onClick={() => go(idxRef.current - 1)}
          className="grid h-11 w-11 place-items-center rounded-full border border-line-2 bg-frame text-xl shadow-[0_12px_26px_-20px_rgba(20,32,43,.7)] transition hover:-translate-y-0.5 hover:bg-ink hover:text-white"
        >
          ‹
        </button>
        <button
          aria-label="Next project"
          onClick={() => go(idxRef.current + 1)}
          className="grid h-11 w-11 place-items-center rounded-full border border-line-2 bg-frame text-xl shadow-[0_12px_26px_-20px_rgba(20,32,43,.7)] transition hover:-translate-y-0.5 hover:bg-ink hover:text-white"
        >
          ›
        </button>
      </div>
    </section>
  );
}
