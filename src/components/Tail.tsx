"use client";

import { useEffect, useRef, useState } from "react";
import { CTA, EMAIL, FAQS, FOOTER, PROFILE } from "@/data/site";
import SecHead from "@/components/SecHead";
import CompanyWall from "@/components/CompanyWall";
import FooterOrbs from "@/components/FooterOrbs";
import LiquidWordmark from "@/components/LiquidWordmark";
import ScrambleLink from "@/components/Scramble";

/** Studio-local time in IST, independent of the visitor's timezone. */
function useStudioClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      const ist = new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000);
      setT(`${pad(ist.getHours())}:${pad(ist.getMinutes())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/* ══════════ CTA ══════════ */
export function Cta() {
  const time = useStudioClock();

  return (
    <section id="contact" className="relative z-[5] pb-[90px] pt-20 text-center">
      <div className="mx-auto w-full max-w-[1280px] px-[34px]">
        <SecHead hw="cta" title={CTA.title} highlight={CTA.titleHi} note={CTA.note} />
        <p className="mx-auto mb-1 max-w-[46ch] text-xl leading-[1.55] text-ink-soft">
          It&apos;s{" "}
          <span className="font-bold tabular-nums text-ink">{time || "--:--"}</span> {CTA.lead}
        </p>
        <div className="mt-[26px] flex flex-wrap justify-center gap-3">
          <a href={`mailto:${EMAIL}`} className="btn-primary">
            {CTA.primary} <span className="arrow">→</span>
          </a>
          <a href="#pricing" className="btn-ghost">
            {CTA.secondary}
          </a>
        </div>

        <CompanyWall />
      </div>
    </section>
  );
}

/* ══════════ FAQ ══════════ */
export function Faq() {
  const [open, setOpen] = useState(FAQS[0].n);

  return (
    <section id="faq" className="relative z-[5] pb-[90px] pt-[70px]">
      <div className="mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        <SecHead
          hw="faq"
          title="The nosy section"
          note="everything you'd grill us on a call, minus the call."
        />

        <div className="mx-auto grid max-w-[960px] gap-3.5">
          {FAQS.map((f) => {
            const isOpen = open === f.n;
            return (
              <div key={f.n} className="card overflow-hidden">
                <h3>
                  <button
                    onClick={() => setOpen(isOpen ? "" : f.n)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${f.n}`}
                    className="relative flex w-full items-center gap-4 py-[26px] pl-[26px] pr-[62px] text-left"
                  >
                    <span className="lbl absolute left-[26px] top-2.5">{f.frame}</span>
                    <b className="pt-0.5 font-mono text-xs font-bold text-brand">{f.n}</b>
                    <span className="font-display text-[21px] font-bold leading-[1.3] tracking-[-0.015em] max-md:text-[17px]">
                      {f.q}
                    </span>
                    <i
                      className={`absolute right-[22px] top-1/2 h-[30px] w-[30px] -translate-y-1/2 rounded-full border transition-colors ${
                        isOpen ? "border-brand bg-brand" : "border-line-2"
                      }`}
                    >
                      <span
                        className={`absolute left-1/2 top-1/2 h-[1.8px] w-3 -translate-x-1/2 -translate-y-1/2 ${
                          isOpen ? "bg-white" : "bg-ink"
                        }`}
                      />
                      <span
                        className={`absolute left-1/2 top-1/2 h-3 w-[1.8px] -translate-x-1/2 -translate-y-1/2 bg-ink transition-[transform,opacity] duration-300 ${
                          isOpen ? "rotate-90 opacity-0" : ""
                        }`}
                      />
                    </i>
                  </button>
                </h3>
                <div
                  id={`faq-${f.n}`}
                  hidden={!isOpen}
                  className="relative pb-7 pl-16 pr-[26px] max-md:pl-6"
                >
                  <span className="lbl mb-2.5 block">ANSWER</span>
                  <p className="max-w-[70ch] text-[17.5px] leading-[1.6] text-ink-soft">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════ THE POINTLESS BUTTON ══════════ */
type Poke = { id: number; x: number; y: number; vx: number; vy: number; r: number; dr: number };

export function DropFun() {
  const stage = useRef<HTMLDivElement | null>(null);
  const btn = useRef<HTMLButtonElement | null>(null);
  const [pokes, setPokes] = useState<Poke[]>([]);
  const bodies = useRef<Poke[]>([]);
  const raf = useRef(0);
  const seq = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const step = () => {
    const h = stage.current?.clientHeight ?? 400;
    const floor = h - 120;
    bodies.current = bodies.current
      .map((p) => {
        let { x, y, vx, vy, r } = p;
        vy += 0.42;
        x += vx;
        y += vy;
        r += p.dr;
        if (y > floor) {
          y = floor;
          vy *= -0.46;
          vx *= 0.8;
        }
        return { ...p, x, y, vx, vy, r };
      })
      .slice(-40);
    setPokes([...bodies.current]);
    if (bodies.current.length) raf.current = requestAnimationFrame(step);
  };

  const poke = () => {
    const s = stage.current;
    const b = btn.current;
    if (!s || !b) return;
    const br = b.getBoundingClientRect();
    const sr = s.getBoundingClientRect();
    bodies.current.push({
      id: seq.current++,
      x: br.left - sr.left + br.width / 2 - 17,
      y: br.top - sr.top,
      vx: (Math.random() - 0.5) * 9,
      vy: -(7 + Math.random() * 6),
      r: 0,
      dr: (Math.random() - 0.5) * 16,
    });
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(step);
  };

  return (
    <section className="relative z-[5] overflow-hidden pb-[110px] pt-[90px] text-center">
      <div className="mx-auto w-full max-w-[1280px] px-[34px]">
        <SecHead
          hwText="i was told to add this"
          title="This button does|absolutely nothing"
          highlight="nothing"
          className="!mb-6"
        />
        <p className="mb-[26px] text-[19px] text-ink-soft">
          Don&apos;t poke it. It gets loud.
        </p>
        <button ref={btn} onClick={poke} className="btn-primary btn-lg">
          Poke it anyway <span>▾</span>
        </button>
      </div>
      <div ref={stage} className="pointer-events-none absolute inset-0 z-[2]">
        {pokes.map((p) => (
          <i
            key={p.id}
            className="om-mark absolute h-[34px] w-[34px] rounded-[11px] bg-brand"
            style={{ transform: `translate(${p.x}px,${p.y}px) rotate(${p.r}deg)` }}
          />
        ))}
      </div>
    </section>
  );
}

/* ══════════ FOOTER ══════════ */
export function Footer() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const time = useStudioClock();
  const [copied, setCopied] = useState<"ok" | "warn" | null>(null);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const draw = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(r.width));
      const H = Math.max(1, Math.round(r.height));
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.14)";
      for (let y = 18; y < H; y += 26)
        for (let x = 18; x < W; x += 26) ctx.fillRect(x, y, 1.6, 1.6);
    };
    draw();
    let t: ReturnType<typeof setTimeout>;
    const on = () => {
      clearTimeout(t);
      t = setTimeout(draw, 200);
    };
    addEventListener("resize", on);
    return () => {
      removeEventListener("resize", on);
      clearTimeout(t);
    };
  }, []);

  // never leave the click unanswered: async API → execCommand → tell the user
  const copy = async () => {
    const flash = (state: "ok" | "warn") => {
      setCopied(state);
      setTimeout(() => setCopied(null), 1800);
    };
    try {
      await navigator.clipboard.writeText(EMAIL);
      flash("ok");
      return;
    } catch {
      /* the async clipboard API is blocked without a user gesture */
    }
    const ta = document.createElement("textarea");
    ta.value = EMAIL;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    flash(ok ? "ok" : "warn");
  };

  // a link that goes nowhere is worse than no link: drop unset hrefs
  const cols = FOOTER.cols.map((c) => ({
    ...c,
    links: c.links.filter((l) => l.href && l.href !== "#"),
  }));

  const rule = "border-t border-white/10";

  return (
    <footer className="relative z-[5] mt-5 overflow-hidden rounded-t-[30px] bg-black text-white">
      <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-50" aria-hidden />

      <div className="relative z-[2] mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        {/* ── identity ── */}
        <div className="flex items-center justify-between gap-6 py-[30px]">
          <div className="flex items-center gap-3">
            <i className="om-mark-dark h-[26px] w-[26px] flex-none rounded-lg bg-white" />
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6E8AA0]">
              {PROFILE.name}
              <span className="mx-2 text-white/20">/</span>
              {PROFILE.role}
            </span>
          </div>
          <button
            onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="grid h-11 w-11 flex-none place-items-center rounded-full border border-white/15 bg-[#121212] text-[17px] transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand"
          >
            ↑
          </button>
        </div>

        {/* ── the ask ── */}
        <div className={`${rule} pb-12 pt-14 max-md:pt-10`}>
          <p className="mb-5 font-mono text-[11.5px] font-bold uppercase tracking-[0.18em] text-brand">
            {FOOTER.lead}
          </p>

          <a
            href={`mailto:${EMAIL}`}
            className="group flex w-full items-center gap-5 font-deco text-[clamp(26px,5vw,72px)] font-normal leading-[1.08] tracking-[-0.005em] text-white transition-colors hover:text-brand max-md:break-all"
          >
            <span>{EMAIL}</span>
            <span className="flex-none text-[0.3em] text-brand transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
              ↗
            </span>
          </a>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href={`mailto:${EMAIL}`} className="btn-primary btn-lg">
              {FOOTER.cta} <span className="arrow">→</span>
            </a>
            <button
              onClick={copy}
              className="inline-flex h-[52px] items-center gap-2.5 rounded-[9px] border border-white/15 px-[22px] font-mono text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#D6E3EC] transition hover:border-white/40 hover:text-white"
            >
              {copied === "ok" ? (
                <>
                  <span className="text-[#4ADE80]">✓</span> Copied
                </>
              ) : copied === "warn" ? (
                <span className="text-[#FFC857]">Press ⌘C</span>
              ) : (
                <>Copy address</>
              )}
            </button>
            <span className="inline-flex items-center gap-2 font-mono text-[11.5px] text-[#8FA8BC]">
              <i className="animate-blip h-2 w-2 rounded-full bg-[#22C55E]" />
              {PROFILE.availability}
            </span>
          </div>
        </div>

        {/* ── navigation + facts, on a real grid ── */}
        <div className={`${rule} grid grid-cols-12 gap-x-[34px] gap-y-10 py-12 max-lg:grid-cols-2 max-sm:grid-cols-1`}>
          {cols.map((c) => (
            <nav key={c.h} className="col-span-3 max-lg:col-span-1">
              <h5 className="mb-5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6E8AA0]">
                {c.h}
              </h5>
              <ul className="grid gap-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <ScrambleLink
                      label={l.label}
                      href={l.href}
                      external={l.href.startsWith("http")}
                      className="inline-block font-mono text-[15px] tracking-[0.02em] text-[#D6E3EC] transition-colors hover:text-brand"
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-6 max-lg:col-span-2 max-sm:col-span-1">
            <h5 className="mb-5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6E8AA0]">
              DETAILS
            </h5>
            <dl className="grid grid-cols-2 gap-x-[34px] gap-y-4 max-sm:grid-cols-1">
              {FOOTER.facts.map((f) => (
                <div key={f.k} className="border-l border-white/10 pl-4">
                  <dt className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#6E8AA0]">
                    {f.k}
                  </dt>
                  <dd className="mt-1 text-[16.5px] text-[#D6E3EC]">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* ── legal ── */}
      <div className="relative z-[3] mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        <div className={`${rule} flex flex-wrap items-center justify-between gap-4 py-5 font-mono text-[10.5px] text-[#6E8AA0]`}>
          <span className="lbl text-[#6E8AA0]">{FOOTER.fileLabel}</span>
          <span className="inline-flex items-center gap-2">
            <i className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            {PROFILE.location} · {time || "--:--"} IST
          </span>
          <span>{FOOTER.copyright}</span>
        </div>
      </div>

      {/* ── wordmark, orbiting ── */}
      <div className="relative z-[2] mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        {/* the padding is the cluster's headroom — the orbs sit above and
            across the letters, since anything below them gets clipped */}
        <div className="relative pt-[clamp(92px,14vw,208px)]">
          <FooterOrbs />
          <div className="relative z-[1] -mb-[0.16em] mt-2" data-wm>
            <LiquidWordmark />
          </div>
        </div>
      </div>
    </footer>
  );
}
