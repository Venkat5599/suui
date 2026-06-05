import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;

type Chapter = {
  id: string;
  n: string;
  kicker: string;
  figure: string;
  figureSub: string;
  title: React.ReactNode;
  body: string;
  quote: string;
  accent: string; // tailwind text color class for the figure
};

const CHAPTERS: Chapter[] = [
  {
    id: "ch-01",
    n: "01",
    kicker: "Describe",
    figure: "1",
    figureSub: "sentence in",
    title: (
      <>
        From a sentence
        <br />
        to a <span className="italic text-cyan-300">signal</span>
      </>
    ),
    body: "Type a strategy in plain English — \"backtest a MACD + RSI crossover on BTC-USDT 1h over 90 days.\" Tenki plans, pulls market data, and generates the signal engine. No code, no config, no notebook.",
    quote: "Read the market's hidden mechanism — in the language you already think in.",
    accent: "text-cyan-300",
  },
  {
    id: "ch-02",
    n: "02",
    kicker: "Decide",
    figure: "0",
    figureSub: "humans in the loop",
    title: (
      <>
        The agent <span className="italic">decides</span>
        <br />
        — it doesn't just schedule
      </>
    ),
    body: "Each cycle it runs the backtest, reads what it already published on-chain, and reasons about whether the new result clears a quality bar and is novel. Only then does it publish. Otherwise it declines — and explains why.",
    quote: "As the noise drops, the builders and the truly motivated signal remain.",
    accent: "text-emerald-300",
  },
  {
    id: "ch-03",
    n: "03",
    kicker: "Anchor",
    figure: "3",
    figureSub: "chains, one manifest",
    title: (
      <>
        One manifest,
        <br />
        anchored <span className="italic text-cyan-300">everywhere</span>
      </>
    ),
    body: "The backtest's bytes live on Walrus as content-addressed blobs. A manifest indexes them by SHA-256, and Sui, Mantle, and Somnia each pin that manifest's blobId + hash + size as an on-chain SignalEntry.",
    quote: "The chain holds the tamper-evident pointer; Walrus holds the bytes.",
    accent: "text-cyan-300",
  },
  {
    id: "ch-04",
    n: "04",
    kicker: "Prove",
    figure: "SHA-256",
    figureSub: "co-recorded on-chain",
    title: (
      <>
        Tamper-evident
        <br />
        by <span className="italic text-emerald-300">construction</span>
      </>
    ),
    body: "Anyone can fetch the strategy and backtest from any Walrus aggregator and prove — against the on-chain record — that it is exactly what the agent published. Re-hash the blob, compare to the chain. Match or it didn't happen.",
    quote: "No trusted server. Verify it yourself, from any aggregator, forever.",
    accent: "text-emerald-300",
  },
  {
    id: "ch-05",
    n: "05",
    kicker: "Run",
    figure: "24/7",
    figureSub: "autonomous worker",
    title: (
      <>
        Always on,
        <br />
        always <span className="italic text-cyan-300">accountable</span>
      </>
    ),
    body: "A headless worker runs strategies around the clock, honouring a one-file HALT kill switch and a committed-mandate guard before any live order. Paper mode by default. Every decision is logged, hashed, and provable.",
    quote: "The journey has just begun — and every step of it is on the record.",
    accent: "text-cyan-300",
  },
];

function ChapterPanel({
  chapter,
  index,
  total,
  progress,
}: {
  chapter: Chapter;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const isLast = index === total - 1;
  const start = index / total;
  const end = (index + 1) / total;
  // Outgoing panels shrink + dim as the next one slides up over them.
  const scale = useTransform(progress, [start, end], [1, isLast ? 1 : 0.93]);
  const opacity = useTransform(progress, [start, end], [1, isLast ? 1 : 0.35]);
  const blur = useTransform(progress, [start, end], ["blur(0px)", isLast ? "blur(0px)" : "blur(4px)"]);

  return (
    <div id={chapter.id} className="sticky top-0 h-[100dvh]">
      <motion.div
        style={{ scale, opacity, filter: blur }}
        className="relative flex h-full w-full origin-top items-center overflow-hidden rounded-t-[2.5rem] border-t border-white/10 bg-[#0c1216] px-5 sm:px-8 lg:px-12"
      >
        {/* concentric grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* left: figure */}
          <div>
            <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-[#f5f5f0]/45">
              <span className={chapter.accent}>{chapter.n}</span>
              <span className="h-px w-10 bg-white/15" />
              {chapter.kicker}
            </div>
            <div
              className={`ss-figures font-display text-[22vw] font-semibold leading-[0.8] tracking-tight sm:text-[16vw] lg:text-[11vw] ${chapter.accent}`}
            >
              {chapter.figure}
            </div>
            <div className="mt-3 font-editorial text-sm text-[#f5f5f0]/50">{chapter.figureSub}</div>
          </div>

          {/* right: copy */}
          <motion.div
            className="lg:pl-10"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-120px" }}
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 30, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } }}
              transition={{ duration: 0.8, ease: EASE }}
              className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-[#f5f5f0] sm:text-5xl lg:text-[3.6rem]"
            >
              {chapter.title}
            </motion.h2>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mt-7 max-w-lg font-editorial text-[15px] leading-relaxed text-[#f5f5f0]/65"
            >
              {chapter.body}
            </motion.p>
            <motion.blockquote
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, ease: EASE }}
              className="mt-8 max-w-md border-l border-white/15 pl-5 font-editorial text-[15px] italic leading-relaxed text-[#f5f5f0]/80"
            >
              “{chapter.quote}”
            </motion.blockquote>
          </motion.div>
        </div>

        {/* index ticker bottom-right */}
        <div className="absolute bottom-6 right-6 font-mono text-[11px] tracking-[0.2em] text-[#f5f5f0]/30 sm:right-12">
          <span className="ss-figures">{chapter.n}</span> / {String(total).padStart(2, "0")}
        </div>
      </motion.div>
    </div>
  );
}

export function ChapterStack() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section className="relative" id="chapters">
      {/* section intro */}
      <div className="mx-auto max-w-[1180px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-300/80">
            Key findings
          </p>
          <h2 className="max-w-3xl font-display text-3xl font-medium leading-[1.08] tracking-tight text-[#f5f5f0] sm:text-5xl">
            Five chapters on how a quant agent earns trust without asking for it.
          </h2>
        </motion.div>
      </div>

      <div ref={ref}>
        {CHAPTERS.map((c, i) => (
          <ChapterPanel
            key={c.id}
            chapter={c}
            index={i}
            total={CHAPTERS.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
