"use client";

import { useEffect, useRef, type RefObject } from "react";

/*
 * Pauses every CSS and SVG (SMIL) animation inside an element while it is
 * off-screen, and resumes it when it scrolls back into view.
 *
 * Decorative backgrounds animate constantly; without this, every section keeps
 * redrawing even when nobody can see it, which drains phone batteries and makes
 * scrolling janky. The CSS half lives in globals.css ([data-paused]).
 */
export function usePauseOffscreen<T extends Element>(existing?: RefObject<T | null>) {
  const own = useRef<T>(null);
  const ref = existing ?? own;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const setPaused = (paused: boolean) => {
      el.toggleAttribute("data-paused", paused);
      const svgs = el instanceof SVGSVGElement ? [el] : Array.from(el.querySelectorAll("svg"));
      for (const svg of svgs) {
        if (paused) svg.pauseAnimations();
        else svg.unpauseAnimations();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { rootMargin: "0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return ref;
}
