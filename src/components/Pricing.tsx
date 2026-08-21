"use client";

import { useEffect, useRef, useState } from "react";
import { DESIGN_FEATURES, DEV_FEATURES, EMAIL, PLANS } from "@/data/site";
import { clamp, useReveal } from "@/lib/hooks";
import SecHead from "@/components/SecHead";

export default function Pricing() {
  const [dev, setDev] = useState(false);
  const [dragT, setDragT] = useState<number | null>(null); // live drag position, 0..1
  const lever = useRef<HTMLDivElement | null>(null);
  const knob = useRef<HTMLButtonElement | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startT = useRef(0);
  const { attach: cardRef, className: cardCls } = useReveal();

  const plan = dev ? PLANS.dev : PLANS.design;
  const t = dragT ?? (dev ? 1 : 0);

  // measured, not read during render — otherwise the knob never repositions
  // after a resize and the first paint uses a stale (zero) width
  const [range, setRange] = useState(0);
  useEffect(() => {
    const l = lever.current;
    const k = knob.current;
    if (!l || !k) return;
    const measure = () => setRange(Math.max(0, l.clientWidth - k.offsetWidth - 10));
    const ro = new ResizeObserver(measure);
    ro.observe(l);
    measure();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !range) return;
      setDragT(clamp(startT.current + (e.clientX - startX.current) / range, 0, 1));
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setDragT((cur) => {
        setDev((cur ?? 0) > 0.5);
        return null;
      });
    };
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
    };
  }, [range]);

  const onKnobDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    dragging.current = true;
    startX.current = e.clientX;
    startT.current = dev ? 1 : 0;
    setDragT(dev ? 1 : 0);
  };

  const onTrackClick = (e: React.MouseEvent) => {
    if (dragging.current) return;
    const l = lever.current;
    if (!l) return;
    setDev(e.clientX - l.getBoundingClientRect().left > l.clientWidth / 2);
  };

  const live = dragT !== null;

  return (
    <section id="pricing" className="relative z-[5] pb-[90px] pt-[70px]">
      <div className="mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        <SecHead
          hw="pricing"
          title="Pick your plan."
          highlight="plan."
          note="one flat price. pause or cancel whenever."
        />

        <div ref={cardRef} className={`card overflow-hidden pb-[30px] ${cardCls}`}>
          <span className="lbl absolute left-[22px] top-4 z-[3] text-white/55">pricing.fig</span>

          {/* price header */}
          <div className="flex flex-wrap items-start justify-between gap-[34px] bg-[radial-gradient(120%_130%_at_84%_-30%,rgba(255,255,255,.5),rgba(255,255,255,0)_55%),linear-gradient(150deg,#8FC6EC,#B8DCF3)] px-10 pb-[34px] pt-11 max-md:px-6">
            <div className="flex flex-wrap items-start gap-0.5">
              <span className="mt-3.5 font-display text-[38px] font-extrabold text-brand">$</span>
              <b className="font-display text-[clamp(58px,7vw,92px)] font-extrabold leading-[0.94] tracking-[-0.045em] tabular-nums">
                {plan.price}
              </b>
              <span className="mb-4 self-end pl-2 text-[17px] text-ink-soft">/month</span>
              <div className="mt-1.5 basis-full font-mono text-[10.5px] font-bold tracking-[0.14em] text-ink-soft">
                {plan.label} · BILLED MONTHLY{" "}
                <s className="ml-1 text-ink-faint">{plan.was}</s>
              </div>
            </div>

            <div className="ml-auto grid justify-items-end gap-3">
              <span className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-brand shadow-[0_10px_22px_-18px_rgba(20,32,43,.6)]">
                ✦ Founding rate, ends soon
              </span>
              <ul className="grid gap-[7px] text-right">
                <li className="text-[15px] before:mr-2 before:font-bold before:text-blue before:content-['✓']">
                  One request at a time
                </li>
                <li className="text-[15px] before:mr-2 before:font-bold before:text-brand before:content-['✓']">
                  <b className="font-bold">{plan.count}</b> included
                </li>
                <li className="text-[15px] before:mr-2 before:font-bold before:text-blue before:content-['✓']">
                  Avg 48 hour delivery
                </li>
              </ul>
              <div className="inline-flex items-center gap-2 rounded-full bg-white py-[7px] pl-[9px] pr-[15px] text-[13.5px] text-ink-soft shadow-[0_12px_26px_-20px_rgba(20,32,43,.6)]">
                <span className="mr-1 text-base">🧾</span>
                Fixed price. No hourly billing.
              </div>
            </div>
          </div>

          {/* lever */}
          <div className="px-10 pt-[26px] max-md:px-6">
            <div className="flex justify-between font-mono">
              <button
                onClick={() => setDev(false)}
                className={`grid gap-1 text-left text-[10.5px] font-bold tracking-[0.14em] transition-colors ${
                  dev ? "text-ink-faint" : "text-ink"
                }`}
              >
                {PLANS.design.label}
                <em
                  className={`font-display text-[22px] font-extrabold not-italic tracking-[-0.02em] transition-colors ${
                    dev ? "text-ink-faint" : "text-brand"
                  }`}
                >
                  ${PLANS.design.price}
                </em>
              </button>
              <button
                onClick={() => setDev(true)}
                className={`grid justify-items-end gap-1 text-right text-[10.5px] font-bold tracking-[0.14em] transition-colors ${
                  dev ? "text-ink" : "text-ink-faint"
                }`}
              >
                <span className="flex items-center gap-2">
                  {PLANS.dev.label}
                  <i className="rounded-[5px] bg-ink px-2 py-[3px] text-[9px] not-italic tracking-[0.12em] text-white">
                    MOST PICKED
                  </i>
                </span>
                <em
                  className={`font-display text-[22px] font-extrabold not-italic tracking-[-0.02em] transition-colors ${
                    dev ? "text-brand" : "text-ink-faint"
                  }`}
                >
                  ${PLANS.dev.price}
                </em>
              </button>
            </div>

            <div
              ref={lever}
              onClick={onTrackClick}
              className="relative my-3.5 h-[52px] cursor-pointer overflow-hidden rounded-[26px] border border-line-2 bg-[#EDF1F5]"
            >
              <div
                className={`absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#1B2836,#14202B)] ${
                  live ? "" : "transition-[width] duration-[350ms] ease-[cubic-bezier(.22,.61,.36,1)]"
                }`}
                style={{ width: `${50 + t * 50}%` }}
              />
              <button
                ref={knob}
                onPointerDown={onKnobDown}
                aria-label="Drag to switch plan"
                className={`absolute top-[5px] z-[2] grid h-10 w-[74px] cursor-grab place-items-center rounded-[20px] bg-white tracking-[6px] text-ink-soft shadow-[0_8px_20px_-10px_rgba(20,32,43,.6)] active:cursor-grabbing ${
                  live ? "" : "transition-[left] duration-[350ms] ease-[cubic-bezier(.22,.61,.36,1)]"
                }`}
                style={{ left: 5 + t * range }}
              >
                ‹›
              </button>
            </div>
            <div className="text-center font-mono text-[9.5px] font-bold tracking-[0.16em] text-ink-faint">
              SLIDE THE LEVER, OR TAP A SIDE
            </div>
          </div>

          {/* features */}
          <ul className="mt-[26px] grid grid-cols-3 gap-x-6 gap-y-3.5 px-10 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:px-6">
            {DESIGN_FEATURES.map((f) => (
              <li key={f} className="tick relative pl-[30px] text-[16.5px]">
                {f}
              </li>
            ))}
          </ul>

          {!dev && (
            <div className="mx-auto mt-[30px] w-max rounded-full bg-ink px-[18px] py-2.5 font-mono text-[10px] font-bold tracking-[0.14em] text-white">
              🔒 UNLOCKS WITH {PLANS.dev.label}
            </div>
          )}
          <ul
            className={`mt-[22px] grid grid-cols-3 gap-x-6 gap-y-3.5 px-10 transition-opacity duration-[350ms] max-lg:grid-cols-2 max-md:grid-cols-1 max-md:px-6 ${
              dev ? "opacity-100" : "opacity-40"
            }`}
          >
            {DEV_FEATURES.map((f) => (
              <li key={f} className="tick relative pl-[30px] text-[16.5px]">
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-[34px] flex flex-wrap items-center justify-center gap-5 px-10 max-md:px-6">
            <a href={`mailto:${EMAIL}`} className="btn-primary btn-lg">
              Start today <span className="arrow">→</span>
            </a>
            <span className="text-[14.5px] text-ink-soft">
              No contracts. Cancel or pause anytime.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
