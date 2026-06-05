import { useRef } from "react";
import { useSpring, type MotionValue } from "motion/react";

/**
 * Awwwards-style magnetic element. The node is pulled toward the cursor while
 * hovered and springs back on leave. Returns a ref plus x/y MotionValues to
 * bind to a motion element's `style`. Pointer-fine only (no-op on touch).
 *
 * @param strength how far the element drifts toward the pointer (0–1)
 */
export function useMagnetic(strength = 0.35): {
  ref: React.RefObject<HTMLDivElement | null>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useSpring(0, { stiffness: 250, damping: 18, mass: 0.5 });
  const y = useSpring(0, { stiffness: 250, damping: 18, mass: 0.5 });

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, x, y, onPointerMove, onPointerLeave };
}
