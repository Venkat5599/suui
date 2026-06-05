import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useInView,
  animate,
  useReducedMotion,
} from "motion/react";

/* ──────────────────────────────────────────────────────────────────────────
 * 1. ScrollProgress — thin cyan bar pinned to the top, scaleX = scroll %.
 * ────────────────────────────────────────────────────────────────────────── */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-300"
    />
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 2. BlendCursor — Awwwards-style mix-blend-difference cursor. A white disc
 *    that follows the pointer with spring lag and grows when hovering links
 *    or anything marked [data-cursor]. mix-blend-difference makes it invert
 *    whatever it sits over. Desktop + fine pointer only; off for reduced
 *    motion and touch.
 * ────────────────────────────────────────────────────────────────────────── */
export function BlendCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.4 });

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      setActive(Boolean(el?.closest("a, button, [data-cursor]")));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ left: sx, top: sy }}
      className="pointer-events-none fixed z-[90] hidden -translate-x-1/2 -translate-y-1/2 md:block"
    >
      <motion.span
        animate={{ scale: active ? 2.6 : 1, opacity: active ? 0.9 : 0.75 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="block h-4 w-4 rounded-full bg-white mix-blend-difference"
      />
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3. Counter — counts a leading number up from 0 when it scrolls into view,
 *    preserving any suffix/prefix (e.g. "45+", "100%", "SHA-256" → static).
 * ────────────────────────────────────────────────────────────────────────── */
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (target === null || reduce) {
      setDisplay(value);
      return;
    }
    if (!inView) {
      setDisplay(`0${suffix}`);
      return;
    }
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => setDisplay(`${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, target, suffix, value, reduce]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
