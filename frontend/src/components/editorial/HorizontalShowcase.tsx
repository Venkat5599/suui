import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const EASE = [0.23, 1, 0.32, 1] as const;

const CARDS = [
  { n: "A", title: "Natural-language backtests", body: "Describe it, the agent codes the signal engine and runs it across crypto, US/HK equities, and A-shares.", tag: "Research" },
  { n: "B", title: "Alpha Zoo", body: "Browse, benchmark, and export a living library of factor strategies with full metrics.", tag: "Library" },
  { n: "C", title: "Swarm teams", body: "Multi-agent committees — investment desk, quant desk — debate a thesis and decide together.", tag: "Agents" },
  { n: "D", title: "Trade-journal replay", body: "Drop any broker CSV. Tenki extracts your rules, backtests them, and attributes the PnL.", tag: "Shadow" },
  { n: "E", title: "On-chain signal vault", body: "Every strong result hashed to Walrus and anchored on Sui, Mantle, and Somnia — provable forever.", tag: "Proof" },
];

export function HorizontalShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(xRaw, { stiffness: 120, damping: 28, mass: 0.5 });

  return (
    // Tall section gives the pin its scroll length (~one viewport per ~1.5 cards).
    <section ref={sectionRef} className="relative h-[320vh] bg-[#0a0f12]">
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-[1180px] items-end justify-between px-5 sm:px-8 lg:px-12">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-300/80">
              What it does
            </p>
            <h2 className="font-display text-3xl font-medium leading-[1.05] tracking-tight text-[#f5f5f0] sm:text-5xl">
              One engine. Five surfaces.
            </h2>
          </div>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-[#f5f5f0]/35 sm:block">
            Scroll →
          </span>
        </div>

        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-6 px-5 sm:px-8 lg:px-12">
          {CARDS.map((c) => (
            <article
              key={c.n}
              className="group relative flex h-[58vh] w-[78vw] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c1216] p-8 sm:w-[46vw] lg:w-[34vw]"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
              <div className="flex items-start justify-between">
                <span className="ss-figures font-display text-[7rem] font-semibold leading-none text-white/[0.06] transition-colors duration-500 group-hover:text-cyan-300/20">
                  {c.n}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5f5f0]/50">
                  {c.tag}
                </span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-medium leading-tight text-[#f5f5f0] sm:text-3xl">
                  {c.title}
                </h3>
                <p className="mt-4 max-w-sm font-editorial text-[15px] leading-relaxed text-[#f5f5f0]/60">
                  {c.body}
                </p>
                <span className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1 group-hover:bg-cyan-300/15">
                  <ArrowUpRight className="h-4 w-4 text-[#f5f5f0]/70" strokeWidth={1.5} />
                </span>
              </div>
              <motion.span
                initial={false}
                className="absolute -bottom-px left-8 right-8 h-px scale-x-0 bg-gradient-to-r from-cyan-300/0 via-cyan-300/60 to-cyan-300/0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100"
                transition={{ duration: 0.5, ease: EASE }}
              />
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
