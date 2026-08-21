"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/lib/hooks";
import { PROFILE } from "@/data/site";
import SecHead from "@/components/SecHead";

type Msg = {
  who: "you" | "om";
  name: string;
  time: string;
  text: string;
  file?: string;
  fileKind?: "fig" | "img";
  react?: string;
};

const THREAD: ({ sep: string } | Msg)[] = [
  { sep: "01 · SUBSCRIBE" },
  { who: "you", name: "You", time: "10:02", text: "brief sent. let's build 🚀" },
  { who: "om", name: PROFILE.short, time: "10:03", text: "on it 👋 what's the vision?" },
  { sep: "02 · SEND IT OVER" },
  { who: "you", name: "You", time: "10:31", text: "brief's in. probably overkill on detail", file: "homepage-brief.fig", fileKind: "fig" },
  { who: "om", name: PROFILE.short, time: "10:32", text: "never too much. first draft in 48h" },
  { sep: "03 · REFINE" },
  { who: "om", name: PROFILE.short, time: "Day 2", text: "here's take one 👀", file: "homepage-v1.png", fileKind: "img" },
  { who: "you", name: "You", time: "Day 2", text: "did you read my mind? bolder hero though", react: "🔥 2" },
  { who: "om", name: PROFILE.short, time: "Day 2", text: "on it. change anything, as often as you want" },
  { sep: "04 · SHIP IT" },
  { who: "om", name: PROFILE.short, time: "Day 3", text: "shipped ✨ go turn heads" },
];

function Avatar({ who }: { who: "you" | "om" }) {
  return who === "you" ? (
    <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-blue font-mono text-[11px] font-bold text-white">
      Y
    </span>
  ) : (
    <span className="om-mark h-[30px] w-[30px] flex-none rounded-[9px] bg-brand" />
  );
}

function Message({ m, i }: { m: Msg; i: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting) {
            io.disconnect();
            setTimeout(() => setShown(true), (i % 3) * 110);
          }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [i]);

  return (
    <div
      ref={ref}
      className={`my-3 flex gap-[11px] transition-[opacity,transform] duration-500 ${
        shown ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0"
      }`}
    >
      <Avatar who={m.who} />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-baseline gap-[9px]">
          <b className="text-[14.5px] font-bold">{m.name}</b>
          <time className="font-mono text-[10px] text-ink-faint">{m.time}</time>
        </div>
        <p className="text-[15.5px] leading-[1.5] text-ink-soft">{m.text}</p>
        {m.file && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-line-2 bg-soft px-3 py-[7px] font-mono text-[11px] text-ink-soft">
            <span
              className={`h-3.5 w-3 rounded-sm opacity-75 ${
                m.fileKind === "img" ? "bg-brand" : "bg-blue"
              }`}
            />
            {m.file}
          </div>
        )}
        {m.react && (
          <div className="mt-[7px] inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-white px-[9px] py-0.5 text-xs">
            {m.react}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Process() {
  const { attach: boxRef, className: boxCls } = useReveal();
  let mi = 0;

  return (
    <section id="process" className="relative z-[5] pb-[90px] pt-20">
      <div className="mx-auto w-full max-w-[1280px] px-[34px] max-md:px-5">
        <SecHead
          hw="process"
          title="No forms. No hoops. Just this."
          note="One thread, zero chaos. Here's how it goes."
        />

        <div
          ref={boxRef}
          className={`card mx-auto max-w-[800px] overflow-hidden ${boxCls}`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-line bg-[#FBFCFE] px-5 py-3.5">
            <div className="flex items-center gap-2 text-[15px] font-semibold">
              <b className="font-bold text-ink-faint">#</b> {PROFILE.short.toLowerCase()} × your-team
            </div>
            <div className="flex items-center gap-2.5 font-mono text-[10.5px]">
              <span className="flex">
                {["S", "Y"].map((a, i) => (
                  <i
                    key={a}
                    className={`grid h-6 w-6 place-items-center rounded-full border-2 border-white font-mono text-[10px] font-bold not-italic text-white ${
                      i === 0 ? "bg-brand" : i === 1 ? "-ml-2 bg-blue" : "-ml-2 bg-[#7C5CFF]"
                    }`}
                  >
                    {a}
                  </i>
                ))}
              </span>
              <span className="text-ink-soft">2 online</span>
            </div>
          </div>

          <div className="px-5 pb-6 pt-[18px]">
            {THREAD.map((row, i) =>
              "sep" in row ? (
                <div
                  key={`s${i}`}
                  className="mb-3.5 mt-[22px] flex items-center gap-3 font-mono text-[9.5px] font-bold tracking-[0.2em] text-brand before:h-px before:flex-1 before:bg-line before:content-[''] after:h-px after:flex-1 after:bg-line after:content-['']"
                >
                  {row.sep}
                </div>
              ) : (
                <Message key={`m${i}`} m={row} i={mi++} />
              ),
            )}
            <div className="my-3 flex gap-[11px]">
              <Avatar who="om" />
              <div className="flex items-center gap-1.5 py-3">
                {[0, 1, 2].map((d) => (
                  <i
                    key={d}
                    className="animate-typing h-1.5 w-1.5 rounded-full bg-ink-faint"
                    style={{ animationDelay: `${d * 0.16}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
