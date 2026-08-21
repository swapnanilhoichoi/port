"use client";

import { EXPERIENCE, NOTES } from "@/data/site";
import { useReveal } from "@/lib/hooks";
import SecHead from "@/components/SecHead";

function ExpCard({ v, i }: { v: (typeof EXPERIENCE)[number]; i: number }) {
  const { attach, className } = useReveal();

  return (
    <article
      ref={attach}
      className={`relative aspect-[405/525] overflow-hidden rounded-[18px] bg-ink shadow-card ${className}`}
      style={{ transitionDelay: `${i * 80}ms` }}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,hsl(${v.hue} 26% 34%),hsl(${v.hue} 30% 14%))`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,16,22,0)_42%,rgba(10,16,22,.88)_86%)]" />
      </div>

      <span className="absolute left-4 top-4 z-[3] inline-flex items-center gap-[9px] rounded-full bg-ink/60 py-[7px] pl-[7px] pr-3.5 font-mono text-[10.5px] font-bold tracking-[0.14em] text-white backdrop-blur-[8px]">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-brand text-[10px]">
          {i + 1}
        </span>
        {v.period}
      </span>

      <span className="absolute right-4 top-4 z-[3] inline-flex items-center gap-[7px] rounded-full bg-ink/60 px-3 py-[7px] font-mono text-[10.5px] font-bold tracking-[0.14em] text-white backdrop-blur-[8px]">
<span className="text-xs text-[#4ADE80]">✓</span> {v.badge}
      </span>

      <div className="absolute inset-x-5 bottom-[62px] z-[3] grid grid-cols-2 grid-rows-[auto_auto] gap-x-4 border-t border-white/20 pt-3.5 text-white">
        <b className="font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em]">
          {v.stats[0][0]}
          <i className="ml-0.5 text-[0.52em] font-bold not-italic">{v.stats[0][1]}</i>
        </b>
        <b className="border-l border-white/20 pl-[18px] font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em]">
          {v.stats[1][0]}
          <i className="ml-0.5 text-[0.52em] font-bold not-italic">{v.stats[1][1]}</i>
        </b>
        <span className="mt-0.5 font-mono text-[9.5px] font-bold tracking-[0.12em] text-white/55">
          {v.stats[0][2]}
        </span>
        <span className="mt-0.5 border-l border-white/20 pl-[18px] font-mono text-[9.5px] font-bold tracking-[0.12em] text-white/55">
          {v.stats[1][2]}
        </span>
      </div>

      <div className="absolute inset-x-5 bottom-5 z-[3] flex items-center gap-[9px] text-white">
        <b className="text-[17px] font-bold after:ml-[9px] after:text-brand after:content-['•']">
          {v.name}
        </b>
        <span className="text-[15px] text-white/75">{v.role}</span>
        <em className="ml-auto font-mono text-[9.5px] font-bold not-italic tracking-[0.12em] text-white/55">
          {v.org}
        </em>
      </div>
    </article>
  );
}

export default function Testimonials() {

  return (
    <section id="reviews" className="relative z-[5] pb-[90px] pt-[70px]">
      <div className="mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        <SecHead
          hwText="the receipts"
          title="Where I've shipped"
          highlight="shipped"
          note="five engineering teams, four countries."
        />

        <div className="grid grid-cols-3 gap-[17px] max-lg:grid-cols-1">
          {EXPERIENCE.map((v, i) => (
            <ExpCard key={i} v={v} i={i} />
          ))}
        </div>

        <div className="mt-[17px] grid grid-cols-3 gap-[17px] max-lg:grid-cols-1">
          {NOTES.map((n, i) => (
            <Note key={i} n={n} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Note({ n, i }: { n: (typeof NOTES)[number]; i: number }) {
  const { attach, className } = useReveal();
  return (
    <article
      ref={attach}
      style={{ transitionDelay: `${i * 80}ms` }}
      className={`rounded-2xl border border-line bg-[#EAF2FA] p-5 ${className}`}
    >
      <div className="mb-3 flex items-center gap-[9px]">
        <span className="grid h-[22px] w-[22px] place-items-center rounded-md bg-brand font-mono text-[10px] font-bold text-white">
          {n.name.charAt(0)}
        </span>
        <b className="text-[15.5px] font-bold">{n.name}</b>
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          {n.role}
        </span>
        <time className="ml-auto font-mono text-[10px] text-ink-faint">{n.time}</time>
      </div>
      <p className="mb-4 text-[15.5px] leading-[1.55] text-ink-soft">{n.text}</p>
      <div className="flex items-center gap-2.5 text-[12.5px] text-ink-faint">
        <span>♥ {n.hearts}</span>
        <span>👍 {n.thumbs}</span>
        <em className="ml-auto font-mono text-[9.5px] font-bold not-italic tracking-[0.1em] text-[#1FA85C]">
          {n.tag}
        </em>
      </div>
    </article>
  );
}
