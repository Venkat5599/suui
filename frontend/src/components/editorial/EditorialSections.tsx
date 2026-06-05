import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationFrame,
  wrap,
} from "motion/react";
import { ArrowUpRight, Copy, Check } from "lucide-react";
import { useRef, useState } from "react";
import { Counter } from "./AwwwardsMotion";
import { MagneticButton } from "./MagneticButton";
import { ScrambleText } from "./ScrambleText";

const EASE = [0.23, 1, 0.32, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: EASE },
};

// ── Marquee ──────────────────────────────────────────────────────────────────
const MARQUEE = [
  "Natural-language quant",
  "Walrus storage",
  "Sui · Move",
  "Mantle Sepolia",
  "Somnia Shannon",
  "SHA-256 verified",
  "24/7 autonomous",
  "Paper-mode safe",
];

export function Marquee({ baseVelocity = -3 }: { baseVelocity?: number }) {
  // Scroll-velocity reactive: the strip drifts at a base speed, but speeds up,
  // slows, and reverses direction based on how fast the user scrolls, with a
  // subtle skew on fast scroll. Classic Awwwards "ParallaxText".
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(smoothVelocity, [-2000, 0, 2000], [-4, 0, 4], { clamp: true });

  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const items = [...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#0a0f12] py-5">
      <motion.div
        style={{ skewX: skew }}
        className="flex [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
      >
        <motion.div style={{ x }} className="flex flex-nowrap whitespace-nowrap">
          {items.map((t, i) => (
            <span key={i} className="flex items-center gap-10 pr-10 font-display text-2xl font-medium text-[#f5f5f0]/35">
              {t}
              <span className="text-cyan-300/60">✳</span>
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Methodology / stat strip (report-style) ──────────────────────────────────
const STATS = [
  { v: "3", label: "Live chains anchoring every cycle", sub: "Sui · Mantle · Somnia" },
  { v: "100%", label: "Content-addressed, re-hashable proof", sub: "Walrus + SHA-256" },
  { v: "0", label: "Trusted servers in the verify path", sub: "Fetch from any aggregator" },
  { v: "1", label: "File HALT kill switch over live trading", sub: "Paper mode by default" },
];

export function StatStrip() {
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <motion.div {...fadeUp} className="mb-14 max-w-2xl">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-300/80">
          Methodology
        </p>
        <h2 className="font-display text-3xl font-medium leading-[1.08] tracking-tight text-[#f5f5f0] sm:text-4xl">
          Trust isn't claimed. It's reconstructed from public bytes.
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
            className="group bg-[#0c1216] p-7 transition-colors duration-500 hover:bg-[#0e151a]"
          >
            <Counter
              value={s.v}
              className="ss-figures block font-display text-6xl font-semibold tracking-tight text-[#f5f5f0]"
            />
            <div className="mt-4 font-editorial text-sm leading-snug text-[#f5f5f0]/70">{s.label}</div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#f5f5f0]/35">
              {s.sub}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── On-chain verify block (real Tenki artifacts) ─────────────────────────────
const MANIFEST = "bTw4KKMbfl_NDDq5N41Huc_NO5S8RKoM6B3Cap3WBbU";
const CHAINS = [
  {
    chain: "Sui",
    meta: "testnet · via Tatum RPC",
    label: "SignalEntry",
    id: "0x758465055fc675598d72d255882521d0f26b0e2836f4f215407cbd7e5290f518",
    href: "https://suiscan.xyz/testnet/object/0x758465055fc675598d72d255882521d0f26b0e2836f4f215407cbd7e5290f518",
  },
  {
    chain: "Mantle Sepolia",
    meta: "chain 5003 · EVM",
    label: "SignalVault",
    id: "0xD6786AD160648A4C7e232e77394A5FEa2a37Cf14",
    href: "https://explorer.sepolia.mantle.xyz/address/0xD6786AD160648A4C7e232e77394A5FEa2a37Cf14",
  },
  {
    chain: "Somnia Shannon",
    meta: "chain 50312 · EVM",
    label: "SignalVault",
    id: "0xf61CBfe72aA03a12A64122b0aDA0B19CE57ad80D",
    href: "https://shannon-explorer.somnia.network/address/0xf61CBfe72aA03a12A64122b0aDA0B19CE57ad80D",
  },
];

function short(id: string) {
  return id.length > 18 ? `${id.slice(0, 10)}…${id.slice(-8)}` : id;
}

export function VerifyBlock() {
  const [copied, setCopied] = useState(false);
  const copyManifest = () => {
    navigator.clipboard?.writeText(MANIFEST);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section id="verify" className="relative border-t border-white/10 bg-[#0a0f12]">
      <div className="mx-auto max-w-[1180px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <motion.div {...fadeUp} className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-300/80">
              Live on-chain proof
            </p>
            <h2 className="font-display text-3xl font-medium leading-[1.08] tracking-tight text-[#f5f5f0] sm:text-5xl">
              One manifest. Three chains. Verify it yourself.
            </h2>
          </div>
          <button
            onClick={copyManifest}
            className="group inline-flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 py-2.5 pl-5 pr-2.5 font-mono text-[12px] text-[#f5f5f0]/80 transition-colors duration-300 hover:border-cyan-300/40"
          >
            <ScrambleText text={short(MANIFEST)} className="ss-figures" speed={34} />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
            </span>
          </button>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-3">
          {CHAINS.map((c, i) => (
            <motion.a
              key={c.chain}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0c1216] p-7 transition-colors duration-500 hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-xl font-medium text-[#f5f5f0]">{c.chain}</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#f5f5f0]/40">
                    {c.meta}
                  </div>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-cyan-300/15">
                  <ArrowUpRight className="h-4 w-4 text-[#f5f5f0]/70" strokeWidth={1.5} />
                </span>
              </div>
              <div className="mt-10">
                <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-emerald-300/70">
                  {c.label}
                </div>
                <ScrambleText
                  text={c.id}
                  speed={50}
                  className="mt-2 block break-all font-mono text-[12px] leading-relaxed text-[#f5f5f0]/55"
                />
              </div>
              <span className="absolute -bottom-px left-7 right-7 h-px scale-x-0 bg-gradient-to-r from-cyan-300/0 via-cyan-300/60 to-cyan-300/0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Closing CTA ──────────────────────────────────────────────────────────────
export function ClosingCTA() {
  return (
    <section className="relative overflow-hidden px-5 py-32 sm:px-8 lg:px-12 lg:py-44">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[50vw] w-[50vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>
      <div className="mx-auto max-w-[1180px] text-center">
        <motion.p
          {...fadeUp}
          className="mb-8 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/80"
        >
          #wearestillearly
        </motion.p>
        <motion.h2
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.08 }}
          className="mx-auto max-w-4xl font-display text-[12vw] font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-[#f5f5f0] sm:text-[9vw] lg:text-[7.5vw]"
        >
          One agent.
          <br />
          <span className="italic text-cyan-300">Three chains.</span>
        </motion.h2>
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.16 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <MagneticButton strength={0.5}>
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-3 rounded-full bg-[#f5f5f0] py-4 pl-7 pr-3 font-semibold text-[#0a0f12] transition-transform duration-200 active:scale-[0.97]"
            >
              Launch the app
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </a>
          </MagneticButton>
          <a
            href="https://ten-ki.live"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 font-medium text-[#f5f5f0]/80 transition-colors duration-300 hover:border-white/30"
          >
            ten-ki.live
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ── Credits footer ───────────────────────────────────────────────────────────
export function CreditsFooter() {
  const cols = [
    { h: "Product", items: ["Backtest", "Alpha Zoo", "Swarm teams", "Live runner"] },
    { h: "On-chain", items: ["Walrus vault", "Sui · Move", "Mantle Sepolia", "Somnia Shannon"] },
    { h: "Links", items: ["ten-ki.live", "Walrus manifest", "SuiScan", "GitHub"] },
  ];
  return (
    <footer className="border-t border-white/10 bg-[#0a0f12] px-5 pb-12 pt-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-2xl font-semibold text-[#f5f5f0]">
              tenki<span className="text-cyan-300">.</span>
            </div>
            <p className="mt-4 max-w-xs font-editorial text-sm leading-relaxed text-[#f5f5f0]/50">
              Autonomous AI quant agent with tamper-evident, multi-chain signal proof.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#f5f5f0]/40">
                {c.h}
              </div>
              <ul className="space-y-3">
                {c.items.map((it) => (
                  <li key={it}>
                    <a
                      href="#top"
                      className="font-editorial text-sm text-[#f5f5f0]/70 transition-colors duration-200 hover:text-cyan-300"
                    >
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-[#f5f5f0]/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Tenki — Art+Tech of Alpha</span>
          <span className="ss-figures">Sui · Mantle · Somnia · Walrus</span>
        </div>
      </div>
    </footer>
  );
}
