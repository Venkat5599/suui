import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const GLYPHS = "ABCDEF0123456789abcdef:·×/";

/**
 * Cryptographic decode effect — the text resolves left-to-right out of random
 * hex glyphs, like a hash settling on-chain. Fires once when scrolled into view
 * (or immediately when `trigger` is "mount"). Respects reduced motion.
 */
export function ScrambleText({
  text,
  className,
  speed = 28,
  trigger = "view",
}: {
  text: string;
  className?: string;
  speed?: number;
  trigger?: "view" | "mount";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [out, setOut] = useState(reduce ? text : "");
  const raf = useRef(0);

  useEffect(() => {
    if (reduce) {
      setOut(text);
      return;
    }
    const go = trigger === "mount" || inView;
    if (!go) return;

    let frame = 0;
    const total = text.length;
    const tick = () => {
      const revealed = Math.floor(frame / 2); // chars locked in
      let s = "";
      for (let i = 0; i < total; i++) {
        if (text[i] === " ") {
          s += " ";
        } else if (i < revealed) {
          s += text[i];
        } else {
          s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setOut(s);
      frame++;
      if (revealed <= total) {
        raf.current = window.setTimeout(() => {
          raf.current = requestAnimationFrame(tick);
        }, 1000 / speed) as unknown as number;
      }
    };
    tick();
    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(raf.current);
    };
  }, [inView, reduce, text, speed, trigger]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {out || " "}
    </span>
  );
}
