import { motion } from "motion/react";
import { useMagnetic } from "@/lib/useMagnetic";

/**
 * A magnetic wrapper — drifts toward the cursor on hover, springs back on
 * leave. Wrap any CTA/link. Renders a <motion.div> (inline-flex) so it can hold
 * an <a> or <button> child.
 */
export function MagneticButton({
  children,
  className = "",
  strength = 0.4,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const { ref, x, y, onPointerMove, onPointerLeave } = useMagnetic(strength);
  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x, y }}
      className={`inline-flex ${className}`}
    >
      {children}
    </motion.div>
  );
}
