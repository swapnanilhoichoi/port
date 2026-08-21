"use client";

import { useEffect, useRef, useState } from "react";
import {
  ABOUT,
  CRAFT,
  CAPABILITIES,
  CAP_ICONS,
  FEATURED_REVIEW,
  METRICS,
  NOW,
} from "@/data/site";
import { clamp, useReveal } from "@/lib/hooks";
import SecHead from "@/components/SecHead";

function Counter({ to, suffix, dec = 0 }: { to: number; suffix: string; dec?: number }) {
  const ref = useRef<HTMLBaseElement | null>(null);
  const [v, setV] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const dur = 1400;
      const step = (now: number) => {
        if (done) return;
        const p = clamp((now - t0) / dur, 0, 1);
        setV(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step);
        else done = true;
      };
      raf = requestAnimationFrame(step);
      // background tabs pause rAF — make sure the number still lands
      setTimeout(() => {
        if (!done) {
          done = true;
          setV(to);
        }
      }, dur + 400);
    };
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting) {
            io.disconnect();
            run();
          }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      done = true;
    };
  }, [to]);

  return (
    <b
      ref={ref as React.Ref<HTMLElement>}
      className="font-display text-[40px] font-extrabold leading-none tracking-[-0.03em]"
    >
      {v.toFixed(dec)}
      <i className="ml-0.5 text-[0.62em] not-italic text-brand">{suffix}</i>
    </b>
  );
}

function Card({
  layer,
  label,
  className = "",
  children,
  dark = false,
}: {
  layer: string;
  label: string;
  className?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  const { attach, className: rv } = useReveal();
  return (
    <article
      ref={attach}
      data-layer={layer}
      className={`card layer-chip ${rv} ${dark ? "bg-ink text-white" : ""} ${className}`}
    >
      <span className={`lbl absolute right-4 top-3.5 ${dark ? "text-white/30" : ""}`}>
        {label}
      </span>
      {children}
    </article>
  );
}

export default function About() {

  return (
    <section id="about" className="relative z-[5] pb-25 pt-[90px]">
      <div className="mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        <SecHead hwText="a little about me" title="What's up" />

        <div className="grid grid-cols-12 items-start gap-[17px] max-lg:grid-cols-6">
          {/* ── statement ── */}
          <Card
            layer="studio"
            label="STATEMENT.TXT"
            className="col-span-7 row-span-2 p-[42px] max-lg:col-span-6 max-lg:row-auto max-md:p-6"
          >
            <div className="mb-2.5 h-[52px] font-display text-[70px] font-extrabold leading-none text-brand">
              “
            </div>
            <h3 className="mb-[22px] font-display text-[38px] font-extrabold leading-[1.12] tracking-[-0.025em] max-md:text-[28px]">
              {ABOUT.quote}
              <br />
              <em className="not-italic text-brand">{ABOUT.quoteHi}</em>
            </h3>
            <p className="mb-7 max-w-[44ch] text-[19px] leading-[1.55] text-ink-soft">
              {ABOUT.body.split(ABOUT.bodyBold)[0]}
              <b className="font-bold text-ink">{ABOUT.bodyBold}</b>
              {ABOUT.body.split(ABOUT.bodyBold)[1]}
            </p>
            <div className="flex items-center justify-between gap-3.5 border-t border-line pt-4 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-faint">
              <span>{ABOUT.footLeft}</span>
              <span className="inline-flex items-center gap-[7px] text-[#1FA85C]">
                <i className="animate-blip h-[7px] w-[7px] rounded-full bg-[#22C55E]" />
                {ABOUT.footRight}
              </span>
            </div>
          </Card>

          {/* ── metrics ── */}
          <Card
            layer="metrics"
            label="METRICS"
            dark
            className="col-span-5 px-[26px] py-6 max-lg:col-span-6"
          >
            {METRICS.map((m, i, arr) => (
              <div
                key={m.label}
                className={`flex items-baseline justify-between gap-5 py-4 ${
                  i < arr.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <Counter to={m.to} suffix={m.suffix} />
                <span className="whitespace-nowrap text-right font-mono text-[10px] font-bold tracking-[0.14em] text-white/40">
                  {m.label}
                </span>
              </div>
            ))}
          </Card>

          {/* ── capabilities ── */}
          <Card
            layer="skills"
            label="CAPABILITIES"
            className="col-span-5 p-[22px] max-lg:col-span-6"
          >
            <ul className="mt-3.5 flex flex-wrap gap-2.5">
              {CAPABILITIES.map((c) => (
                <li
                  key={c.label}
                  style={{ ["--ic" as string]: CAP_ICONS[c.icon] }}
                  className="cap inline-flex h-11 items-center gap-2 rounded-full border border-line-2 px-[18px] text-base font-medium text-ink-faint transition hover:-translate-y-0.5 hover:border-brand hover:text-brand"
                >
                  <span className="text-ink">{c.label}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* ── craft ── */}
          <Card
            layer="craft"
            label={CRAFT.label}
            dark
            className="col-span-4 overflow-hidden p-5 max-lg:col-span-6"
          >
            <div className="relative mt-6 rounded-xl border border-white/10 bg-[linear-gradient(160deg,#1B2A38,#131F2A)] px-5 pb-[26px] pt-[22px] outline outline-[1.3px] outline-offset-[3px] outline-blue">
              <i className="handle -left-[5px] -top-[5px]" />
              <i className="handle -right-[5px] -top-[5px]" />
              <i className="handle -bottom-[5px] -left-[5px]" />
              <i className="handle -bottom-[5px] -right-[5px]" />
              <div className="font-mono text-[9.5px] font-bold tracking-[0.2em] text-brand">
                {CRAFT.kicker}
              </div>
              <div className="my-2 mb-3.5 font-display text-[34px] font-extrabold leading-[1.02] tracking-[-0.03em]">
                {CRAFT.head}
                <br />
                <span className="text-brand">{CRAFT.headHi}</span>
              </div>
              <div className="inline-block rounded-lg bg-brand px-[18px] py-2 text-[13.5px] font-semibold text-white">
                {CRAFT.btn}
              </div>
              <span className="absolute -bottom-[22px] -right-px font-mono text-[9.5px] text-blue">
                {CRAFT.dim}
              </span>
            </div>
            <div className="mt-[34px] flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
              <span>{CRAFT.footLeft}</span>
              <span className="text-white/30">{CRAFT.footRight}</span>
            </div>
          </Card>

          {/* ── now playing ── */}
          <Card
            layer="now-playing"
            label={NOW.label}
            className="col-span-4 p-[22px] max-lg:col-span-6 [&>.lbl]:text-brand"
          >
            <div className="mb-4 mt-[34px] font-display text-[27px] font-bold tracking-[-0.02em]">
              {NOW.title}
            </div>
            <div className="flex flex-wrap gap-2">
              {NOW.tools.map((t) => (
                <span
                  key={t}
                  className="rounded-[7px] border border-line-2 px-3 py-1.5 font-mono text-[10.5px] font-bold tracking-[0.08em] text-ink-soft"
                >
                  {t}
                </span>
              ))}
            </div>
          </Card>

          {/* ── review ── */}
          <Card
            layer="review"
            label="REVIEW_07"
            className="col-span-4 p-[22px] max-lg:col-span-6"
          >
            <div className="mb-3 mt-[26px] tracking-[3px] text-brand">★★★★★</div>
            <p className="mb-5 text-[17px] leading-[1.5]">&quot;{FEATURED_REVIEW.quote}&quot;</p>
            <div className="font-mono text-[10px] font-bold tracking-[0.12em] text-ink-faint">
              {FEATURED_REVIEW.by}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
