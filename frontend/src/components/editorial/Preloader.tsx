import { useEffect, useState } from "react";
import { AnimatePresence, motion, animate, useReducedMotion } from "motion/react";

const EASE = [0.76, 0, 0.24, 1] as const;
const WORDS = ["Autonomous", "自律", "Quant", "クオンツ", "Proof", "天気"];

/**
 * Awwwards-style intro preloader: a counter ticks 0→100 while a rotating
 * multilingual wordmark plays, then the curtain splits and lifts to reveal the
 * page. Calls `onDone` when the reveal completes. Skipped entirely for reduced
 * motion (fires `onDone` on the next frame).
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const [word, setWord] = useState(0);
  const [lift, setLift] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (reduce) {
      const id = requestAnimationFrame(onDone);
      return () => cancelAnimationFrame(id);
    }

    const wordTimer = setInterval(() => setWord((w) => (w + 1) % WORDS.length), 240);
    const controls = animate(0, 100, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        clearInterval(wordTimer);
        setLift(true);
        // Curtain lift animation runs ~1s; hand control back after it clears,
        // then fully unmount so the overlay can't intercept any clicks.
        window.setTimeout(() => {
          onDone();
          setGone(true);
        }, 1050);
      },
    });

    return () => {
      controls.stop();
      clearInterval(wordTimer);
    };
  }, [reduce, onDone]);

  if (reduce || gone) return null;

  return (
    <AnimatePresence>
      {!lift ? (
        <motion.div
          key="loader"
          exit={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0f12]"
        >
          {/* rotating multilingual wordmark */}
          <div className="relative h-[1.4em] w-[14ch] overflow-hidden text-center">
            <AnimatePresence>
              <motion.div
                key={word}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-110%" }}
                transition={{ duration: 0.24, ease: EASE }}
                className="absolute inset-x-0 top-0 font-display text-2xl font-medium text-[#f5f5f0]/80 sm:text-3xl"
              >
                {WORDS[word]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* counter, bottom-right */}
          <div className="ss-figures absolute bottom-8 right-8 font-display text-[16vw] font-semibold leading-none tracking-tight text-[#f5f5f0] sm:text-[12vw] lg:text-[9vw]">
            {String(count).padStart(3, "0")}
          </div>
          <div className="absolute bottom-10 left-8 font-mono text-[11px] uppercase tracking-[0.3em] text-[#f5f5f0]/40">
            Tenki — Art+Tech of Alpha
          </div>
        </motion.div>
      ) : (
        // Curtain: two panels split vertically and lift away.
        <motion.div key="curtain" className="pointer-events-none fixed inset-0 z-[100] flex">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 0 }}
              animate={{ y: "-100%" }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
              className="h-full w-1/2 bg-[#0a0f12]"
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
