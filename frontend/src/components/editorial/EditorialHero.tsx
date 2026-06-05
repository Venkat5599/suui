import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { MagneticButton } from "./MagneticButton";

const EASE = [0.23, 1, 0.32, 1] as const;

function MaskLine({ children, delay = 0, play }: { children: React.ReactNode; delay?: number; play: boolean }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "110%" }}
        animate={play ? { y: "0%" } : { y: "110%" }}
        transition={{ duration: 1, ease: EASE, delay }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
}

export function EditorialHero({ ready = true }: { ready?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden px-5 pb-8 pt-28 sm:px-8 lg:px-12"
    >
      {/* glow orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-[42vw] w-[42vw] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[36vw] w-[36vw] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
      </div>

      {/* top meta row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-[#f5f5f0]/50"
      >
        <span>Art+Tech of Alpha</span>
        <span className="hidden sm:block">Sui · Mantle · Somnia</span>
        <span className="ss-figures">2026 Edition</span>
      </motion.div>

      {/* giant title */}
      <motion.div style={{ y, opacity }} className="py-[6vh]">
        <h1 className="font-display text-[15vw] font-semibold uppercase leading-[0.86] tracking-[-0.03em] text-[#f5f5f0] sm:text-[14vw] lg:text-[13vw]">
          <MaskLine play={ready} delay={0.05}>Autonomous</MaskLine>
          <MaskLine play={ready} delay={0.15}>
            <span className="italic text-cyan-300">quant</span>
          </MaskLine>
          <MaskLine play={ready} delay={0.25}>
            <span className="ss-figures">Pr0of</span>
          </MaskLine>
        </h1>
      </motion.div>

      {/* bottom row: intro + scroll cue */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="max-w-md font-editorial text-[15px] leading-relaxed text-[#f5f5f0]/65"
        >
          Describe a strategy in plain English. Tenki engineers the signal,
          backtests it, and anchors every result on three chains — tamper-evident,
          portable, and verifiable. No trusted server. No human in the loop.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <MagneticButton strength={0.5}>
            <a
              href="#ch-01"
              className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-[#f5f5f0]/60"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 transition-colors duration-300 group-hover:border-cyan-300/60">
                <ArrowDown
                  className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-1"
                  strokeWidth={1.5}
                />
              </span>
              Explore the report
            </a>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
