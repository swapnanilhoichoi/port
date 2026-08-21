"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v;

/**
 * Reveal-on-scroll. Returns a *callback* ref rather than a ref object so the
 * observer is wired up at attach time and nothing ref-ish leaks into render.
 */
export function useReveal(threshold = 0.08) {
  const [shown, setShown] = useState(false);

  const attach = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      if (!("IntersectionObserver" in window)) {
        setShown(true);
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              setShown(true);
              io.disconnect();
            }
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold },
      );
      io.observe(node);
      return () => io.disconnect();
    },
    [threshold],
  );

  return { attach, shown, className: shown ? "rv rv-in" : "rv" };
}

const noopSubscribe = () => () => {};

/** True only after hydration — for anything that would differ during SSR. */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** SSR-safe media query. Renders `false` on the server, real value after hydration. */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(query).matches,
    () => false,
  );
}

/** Scroll progress of the whole document, 0 → 1. */
export function useScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const upd = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? clamp(window.scrollY / max, 0, 1) : 0);
    };
    upd();
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    return () => {
      window.removeEventListener("scroll", upd);
      window.removeEventListener("resize", upd);
    };
  }, []);

  return p;
}
