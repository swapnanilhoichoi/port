"use client";

import { useReveal } from "@/lib/hooks";
import { DIFFERENCE, PROFILE } from "@/data/site";
import SecHead from "@/components/SecHead";


export default function Difference() {
  const { attach: winRef, className: winCls } = useReveal();

  return (
    <section id="why" className="relative z-[5] pb-[90px] pt-[70px]">
      <div className="mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        <SecHead hw="why" title="same brief.|different freelancer." />

        <div ref={winRef} className={winCls}>
          {/* window title bar */}
          <div className="relative mt-[34px] flex items-center gap-3.5 rounded-t-2xl border border-line bg-frame px-5 py-3.5 shadow-card">
            <span className="traffic h-[11px] w-[44px] flex-none" />
            <span className="lbl flex-1">the-difference.fig</span>
            <span className="font-mono text-[10.5px] text-ink-faint">100%</span>
            <span className="flex">
              <i className="grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-brand font-mono text-[9px] font-bold not-italic text-white">
                V
              </i>
              <i className="-ml-2 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-blue font-mono text-[9px] font-bold not-italic text-white">
                M
              </i>
            </span>
          </div>

          {/* canvas */}
          <div className="grid grid-cols-[1fr_64px_1fr] items-center border border-t-0 border-line bg-frame px-[34px] py-10 shadow-card max-lg:grid-cols-1 max-lg:gap-6 max-md:px-5">
            <div className="rounded-[14px] border border-line bg-[#F7F8FA] px-[26px] py-6 opacity-70">
              <div className="mb-[18px] flex items-center justify-between gap-3.5">
                <b className="text-[17px] font-bold text-ink-soft">most freelancers</b>
                <span className="rounded-[5px] bg-ink/5 px-[9px] py-1 font-mono text-[9.5px] font-bold tracking-[0.12em] text-ink-faint">
                  LOCKED
                </span>
              </div>
              <ul className="grid gap-3.5">
                {DIFFERENCE.them.map((t) => (
                  <li
                    key={t}
                    className="tick-off relative pl-7 text-base leading-[1.45] text-ink-soft"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-ink font-mono text-[11px] font-bold tracking-[0.06em] text-white">
              VS
            </div>

            <div className="relative rounded-[14px] border border-line-2 bg-white px-[26px] py-6 shadow-[0_22px_48px_-34px_rgba(20,32,43,.65)] outline outline-[1.4px] outline-offset-2 outline-blue">
              <div className="absolute -top-6 left-[-2px] rounded-t-[5px] bg-blue px-[9px] py-[3px] font-mono text-[10px] font-bold text-white">
                {PROFILE.short} · selected
              </div>
              <i className="handle -left-[5px] -top-[5px]" />
              <i className="handle -right-[5px] -top-[5px]" />
              <i className="handle -bottom-[5px] -left-[5px]" />
              <i className="handle -bottom-[5px] -right-[5px]" />

              <div className="mb-[18px] flex items-center justify-between gap-3.5">
                <b className="flex items-center gap-[9px] text-[17px] font-bold">
                  <span className="om-mark h-[22px] w-[22px] rounded-md bg-brand" />
                  {PROFILE.short}
                </b>
                <span className="rounded-[5px] bg-blue px-[9px] py-1 font-mono text-[9.5px] font-bold tracking-[0.12em] text-white">
                  EDITING
                </span>
              </div>
              <ul className="grid gap-3.5">
                {DIFFERENCE.me.map((t) => (
                  <li key={t} className="tick-on relative pl-7 text-base leading-[1.45]">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-[22px] rounded-[9px] bg-blue py-[11px] text-center text-[14.5px] font-semibold text-white">
                {DIFFERENCE.pick}
              </div>
            </div>
          </div>

          {/* footer bar */}
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-b-2xl border border-t-0 border-line bg-frame px-[34px] py-[22px] shadow-card max-md:px-5">
            <p className="text-lg font-medium">{DIFFERENCE.foot}</p>
            <a href="#work" className="btn-primary">
              see the work <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
