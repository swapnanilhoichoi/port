"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SERVICES } from "@/data/site";
import { clamp } from "@/lib/hooks";
import SecHead from "@/components/SecHead";

/**
 * Pinned horizontal pan: the story block is as tall as the track has to travel,
 * the pin sticks for that whole run, and vertical scroll drives translateX.
 */
export default function Services() {
  const story = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const pan = useRef(0);

  const update = useCallback(() => {
    const s = story.current;
    const t = track.current;
    if (!s || !t) return;
    const travelled = clamp(-s.getBoundingClientRect().top, 0, pan.current);
    t.style.transform = `translate3d(${-travelled}px,0,0)`;

    const mid = innerWidth / 2;
    let best = 0;
    let bestD = Infinity;
    Array.from(t.children).forEach((c, i) => {
      const b = (c as HTMLElement).getBoundingClientRect();
      const d = Math.abs(b.left + b.width / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  const measure = useCallback(() => {
    const s = story.current;
    const t = track.current;
    if (!s || !t) return;
    pan.current = Math.max(0, t.scrollWidth - innerWidth);
    s.style.height = `${pan.current + innerHeight}px`;
    update();
  }, [update]);

  useEffect(() => {
    measure();
    addEventListener("scroll", update, { passive: true });
    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(measure, 160);
    };
    addEventListener("resize", onResize);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", onResize);
      clearTimeout(rt);
    };
  }, [measure, update]);

  // re-measure after an accordion finishes animating
  useEffect(() => {
    const t = setTimeout(measure, 520);
    return () => clearTimeout(t);
  }, [open, measure]);

  return (
    <section id="services" className="relative z-[5] pt-20">
      <div className="mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        <SecHead
          hw="services"
          title="What we make"
          note="Three services, one canvas. Scroll sideways to pan."
        />
      </div>

      <div ref={story} className="relative">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div ref={track} className="flex w-max gap-[15vw] px-[7.5vw] will-change-transform">
            {SERVICES.map((s, i) => {
              const isOpen = open === s.n;
              return (
                <article
                  key={s.n}
                  className="card relative w-[min(1224px,85vw)] flex-none rounded-[20px] px-[46px] pb-10 pt-[46px] max-md:px-6 max-md:pt-8"
                >
                  <span
                    className={`lbl absolute -top-6 left-0 text-brand transition-opacity ${
                      active === i ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {s.layer}
                  </span>
                  {active === i && (
                    <span className="pointer-events-none absolute -inset-[9px] rounded-[26px] border-[1.4px] border-brand" />
                  )}

                  <div className="flex items-start gap-11 max-lg:flex-col max-lg:gap-7">
                    <div className="min-w-0 flex-none basis-[40%] max-lg:basis-auto">
                      <div className="grid h-14 w-[62px] place-items-center rounded-[14px] bg-grid font-display text-[26px] font-extrabold text-ink-soft">
                        {s.n}
                      </div>
                      <h3 className="mt-[22px] font-display text-[clamp(34px,3.6vw,52px)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                        {s.title}
                      </h3>
                      <p className="font-display text-[clamp(34px,3.6vw,52px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-brand">
                        {s.lead}
                      </p>
                      <p className="mt-5 max-w-[34ch] text-[19px] leading-[1.5] text-ink-soft">
                        {s.desc}
                      </p>
                    </div>

                    {/* fake browser: concept vs result */}
                    <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-line-2 bg-[#F4F6F8] shadow-[0_20px_44px_-30px_rgba(20,32,43,.6)] max-lg:w-full">
                      <div className="flex items-center gap-1.5 bg-[#EDF0F3] px-3 py-[9px]">
                        <span className="traffic h-[11px] w-[44px] flex-none" />
                        <span className="ml-2 h-[11px] flex-1 rounded-md bg-[#DDE3E8]" />
                      </div>
                      <div className="grid h-[308px] grid-cols-2 max-md:h-[200px]">
                        {(["Concept", "Result"] as const).map((pane, pi) => (
                          <div
                            key={pane}
                            className={`flex flex-col gap-2.5 p-4 text-white ${
                              pi === 0
                                ? "bg-[linear-gradient(160deg,#2B2B2B,#1A1A1A)]"
                                : "bg-[linear-gradient(160deg,#2A1A18,#141B24)]"
                            }`}
                          >
                            <em className="text-center font-serif text-[15px] italic opacity-85">
                              / {pane} /
                            </em>
                            <span className="h-2 w-[70%] rounded bg-white/10" />
                            <span className="h-2 w-[48%] rounded bg-white/10" />
                            <span
                              className={`flex-1 rounded-[7px] ${
                                pi === 0
                                  ? "bg-white/5"
                                  : "bg-[linear-gradient(150deg,rgba(240,83,28,.15),rgba(13,153,255,.12))]"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setOpen(isOpen ? null : s.n)}
                    aria-expanded={isOpen}
                    className="chev mt-8 inline-flex items-center gap-3.5 rounded-[11px] border-[1.4px] border-brand bg-white py-3.5 pl-[22px] pr-4 font-mono text-xs font-bold tracking-[0.14em] text-brand transition hover:bg-brand/5"
                  >
                    SEE PROCESS + DELIVERABLES
                  </button>

                  <div
                    className={`grid grid-cols-2 gap-10 overflow-hidden transition-[max-height,padding,opacity] duration-500 ease-[cubic-bezier(.22,.61,.36,1)] max-lg:grid-cols-1 max-lg:gap-6 ${
                      isOpen
                        ? "mt-[26px] max-h-[min(300px,32vh)] overflow-y-auto border-t border-line pt-[26px] opacity-100"
                        : "max-h-0 pt-0 opacity-0"
                    }`}
                  >
                    <div>
                      <h4 className="lbl mb-3.5">THE WORK</h4>
                      <p className="text-[17.5px] leading-[1.55] text-ink-soft">{s.work}</p>
                    </div>
                    <div>
                      <h4 className="lbl mb-3.5">DELIVERABLES</h4>
                      <ul className="flex flex-wrap gap-2.5">
                        {s.deliverables.map((d) => (
                          <li
                            key={d}
                            className="rounded-[9px] bg-soft px-4 py-[11px] text-[15.5px] font-medium"
                          >
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
