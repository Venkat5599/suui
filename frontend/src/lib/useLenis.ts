import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Awwwards-style smooth scroll. Mirrors the arttechreport.com Lenis config
 * (lerp 0.2, reduced wheel multiplier, vertical gesture orientation).
 *
 * Respects prefers-reduced-motion: when set, we skip Lenis entirely so the
 * page uses native (instant) scrolling — required for motion-sensitive users.
 * The instance is fully torn down on unmount so dashboard routes keep native
 * scroll behaviour.
 */
export function useLenis(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.9,
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [enabled]);
}
