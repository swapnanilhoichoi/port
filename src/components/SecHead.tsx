"use client";

import { useCallback, useRef, useState } from "react";
import { SCRIBBLES } from "@/data/scribbles";
import { useReveal } from "@/lib/hooks";

/**
 * The handwritten eyebrow. The path carries pathLength="1", so drawing it on is
 * just stroke-dashoffset 1 → 0 — no measuring, no JS per frame. `.writing` is
 * added the first time it scrolls into view.
 */
function Scribble({ name, text }: { name?: string; text?: string }) {
  const art = name ? SCRIBBLES[name] : undefined;
  const [writing, setWriting] = useState(false);

  const attach = useCallback((node: HTMLSpanElement | null) => {
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setWriting(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setWriting(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.1 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  if (!art && !text) return null;

  // no traced artwork for this phrase — write it in the same hand instead
  if (!art) {
    return (
      <span ref={attach} className={`scribble ${writing ? "writing" : ""}`}>
        <span className="hw-text">{text}</span>
      </span>
    );
  }

  return (
    <span ref={attach} className={`scribble ${writing ? "writing" : ""}`}>
      <svg
        className="hw"
        viewBox={art.viewBox}
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          className="hw-ink"
          pathLength={1}
          d={art.d}
          stroke="#F0531C"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Splits text into .word > .ltr spans, keeping `|` as a line break marker. */
function split(text: string, highlight?: string) {
  const chunks: React.ReactNode[] = [];
  let key = 0;

  const emit = (part: string, isHi: boolean) => {
    part.split(/(\s+)/).forEach((tok) => {
      if (tok === "") return;
      if (/^\s+$/.test(tok)) {
        chunks.push(" ");
        return;
      }
      chunks.push(
        <span className={`word${isHi ? " o" : ""}`} key={key++}>
          {tok.split("").map((ch, i) => (
            <span className="ltr" key={i}>
              {ch}
            </span>
          ))}
        </span>,
      );
    });
  };

  text.split("|").forEach((line, li) => {
    if (li > 0) chunks.push(<br key={`br${key++}`} />);
    if (highlight && line.includes(highlight)) {
      const at = line.indexOf(highlight);
      emit(line.slice(0, at), false);
      emit(highlight, true);
      emit(line.slice(at + highlight.length), false);
    } else {
      emit(line, false);
    }
  });

  return chunks;
}

/**
 * Letters lift toward the cursor: strength falls off with distance
 * (t = 1 - d/R, eased by t²) and they tilt away from the pointer.
 */
function useMagneticLetters() {
  const raf = useRef(0);
  const pos = useRef({ x: 0, y: 0 });

  const onMove = useCallback((e: React.MouseEvent<HTMLHeadingElement>) => {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const h2 = e.currentTarget;
    pos.current = { x: e.clientX, y: e.clientY };
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const fs = parseFloat(getComputedStyle(h2).fontSize) || 40;
      const maxLift = Math.min(22, fs * 0.3);
      const R = fs * 2.6 + 70;
      const { x: mx, y: my } = pos.current;
      h2.querySelectorAll<HTMLElement>(".ltr").forEach((l) => {
        const r = l.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2);
        const dy = my - (r.top + r.height / 2);
        const d = Math.sqrt(dx * dx + dy * dy);
        const t = Math.max(0, 1 - d / R);
        const lift = t * t;
        l.style.transform =
          `translateY(${(-lift * maxLift).toFixed(1)}px) ` +
          `rotate(${((dx > 0 ? -1 : 1) * lift * 2).toFixed(2)}deg)`;
      });
    });
  }, []);

  const onLeave = useCallback((e: React.MouseEvent<HTMLHeadingElement>) => {
    const letters = e.currentTarget.querySelectorAll<HTMLElement>(".ltr");
    letters.forEach((l) => {
      l.style.transition = "transform .55s cubic-bezier(.34,1.56,.64,1)";
      l.style.transform = "";
    });
    setTimeout(() => letters.forEach((l) => (l.style.transition = "")), 560);
  }, []);

  return { onMouseMove: onMove, onMouseLeave: onLeave };
}

export default function SecHead({
  hw,
  hwText,
  title,
  highlight,
  note,
  className = "",
}: {
  /** key into SCRIBBLES; omit and pass hwText to write the phrase instead */
  hw?: string;
  /** eyebrow rendered as handwriting text when no traced stroke fits */
  hwText?: string;
  /** heading text; `|` marks a line break */
  title: string;
  /** substring painted in brand orange */
  highlight?: string;
  note?: string;
  className?: string;
}) {
  const { attach, className: rv } = useReveal();
  const magnet = useMagneticLetters();

  return (
    <div ref={attach} className={`sec-head ${rv} ${className}`}>
      <Scribble name={hw} text={hwText} />
      <h2 {...magnet}>{split(title, highlight)}</h2>
      {note && <span className="note">{note}</span>}
    </div>
  );
}
