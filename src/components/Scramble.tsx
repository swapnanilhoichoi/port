"use client";

import { useCallback, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/_";

/**
 * Decode-on-hover text. Each character locks in left to right while the ones
 * ahead of it keep cycling, so the label resolves rather than just swapping.
 */
export function useScramble(text: string) {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  const t0 = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    setOut(text);
  }, [text]);

  const start = useCallback(() => {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    cancelAnimationFrame(raf.current);
    t0.current = performance.now();
    const DUR = 90 * text.length + 160;

    const step = (now: number) => {
      const p = Math.min(1, (now - t0.current) / DUR);
      const locked = p * text.length;
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") {
          s += " ";
        } else if (i < locked) {
          s += ch;
        } else {
          s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
      }
      setOut(s);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else {
        raf.current = 0;
        setOut(text);
      }
    };
    raf.current = requestAnimationFrame(step);
  }, [text]);

  return { out, start, stop };
}

export default function ScrambleLink({
  label,
  href,
  external,
  className = "",
}: {
  label: string;
  href: string;
  external?: boolean;
  className?: string;
}) {
  const { out, start, stop } = useScramble(label);
  return (
    <a
      href={href}
      onPointerEnter={start}
      onPointerLeave={stop}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {/* monospace keeps the width fixed while the glyphs cycle */}
      <span aria-hidden>{out}</span>
      <span className="sr-only">{label}</span>
    </a>
  );
}
