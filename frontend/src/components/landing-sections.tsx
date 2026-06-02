import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";

/** Extra Tenki landing sections (monochrome): How it works, Chains, Pricing. */

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

// ── How it works ────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Describe", body: "Type a strategy in plain English — \"backtest a MACD crossover on BTC/USDT, last 30 days.\" No code, no config." },
  { n: "02", title: "Agent runs", body: "Tenki plans, pulls market data, runs the backtest, computes Sharpe / drawdown / benchmark, and reasons about the result." },
  { n: "03", title: "Anchor on-chain", body: "Strong signals are hashed to Walrus and registered across Mantle, Sui, and Somnia — tamper-evident and publicly verifiable." },
];

export function HowItWorks() {
  return (
    <section id="how" className="w-full bg-[#fafafa] py-24 lg:py-32 dark:bg-neutral-900">
      <Wrap>
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-500">Workflow</p>
          <h2 className="text-3xl font-normal tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            From a sentence to a signal
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.1 }}
              className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950"
            >
              <div className="text-5xl font-semibold text-neutral-200 dark:text-neutral-700">{s.n}</div>
              <h3 className="mt-4 text-xl font-medium text-neutral-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

// ── Chains ──────────────────────────────────────────────────────────────────
const CHAINS = [
  { name: "Mantle Sepolia", role: "SignalVault (EVM · Solidity)", note: "Primary anchor chain" },
  { name: "Sui Testnet", role: "signal_vault (Move package)", note: "Walrus-native storage" },
  { name: "Somnia Shannon", role: "SignalVault (EVM · Solidity)", note: "High-throughput L1" },
];

export function Chains() {
  return (
    <section id="onchain" className="w-full bg-white py-24 lg:py-32 dark:bg-neutral-950">
      <Wrap className="grid items-center gap-14 lg:grid-cols-2">
        <motion.div {...fadeUp}>
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-500">On-chain</p>
          <h2 className="text-3xl font-normal tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            Every signal, anchored across three chains
          </h2>
          <p className="mt-5 max-w-md text-neutral-500 dark:text-neutral-400">
            Backtest manifests are stored on Walrus decentralized storage and registered on-chain with their
            SHA-256 hash. Anyone can fetch the manifest from any aggregator and prove it matches what Tenki
            committed — the chain holds the tamper-evident, ownership-bearing pointer.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="rounded-full border border-black/10 px-3 py-1 dark:border-white/15">Content-addressed</span>
            <span className="rounded-full border border-black/10 px-3 py-1 dark:border-white/15">Tamper-evident</span>
            <span className="rounded-full border border-black/10 px-3 py-1 dark:border-white/15">Publicly verifiable</span>
          </div>
        </motion.div>
        <motion.div {...fadeUp} className="space-y-3">
          {CHAINS.map((c, i) => (
            <motion.div
              key={c.name}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="flex items-center justify-between rounded-2xl border border-black/5 bg-[#fafafa] px-6 py-5 dark:border-white/10 dark:bg-neutral-900"
            >
              <div>
                <div className="text-base font-medium text-neutral-900 dark:text-white">{c.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{c.role}</div>
                <div className="mt-1 text-[11px] text-neutral-400">{c.note}</div>
              </div>
              <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-900">
                Live
              </span>
            </motion.div>
          ))}
        </motion.div>
      </Wrap>
    </section>
  );
}

// ── Pricing (coming soon) ───────────────────────────────────────────────────
const PLANS = [
  {
    name: "Research",
    price: "Free",
    sub: "Available now",
    features: ["Natural-language backtests", "Crypto · US · A-share data", "Alpha Zoo + swarm teams", "Paper mode"],
    cta: "Launch app",
    available: true,
  },
  {
    name: "On-chain",
    price: "Free",
    sub: "Testnet · available now",
    features: ["Everything in Research", "Walrus signal vault", "Mantle · Sui · Somnia anchors", "Provable manifests"],
    cta: "Launch app",
    available: true,
    highlight: true,
  },
  {
    name: "Live Trading",
    price: "Coming soon",
    sub: "Mainnet + real brokers",
    features: ["Everything in On-chain", "IBKR / Robinhood connectors", "Mandate + HALT controls", "Mainnet anchoring"],
    cta: "Coming soon",
    available: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="w-full bg-[#fafafa] py-24 lg:py-32 dark:bg-neutral-900">
      <Wrap>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-500">Pricing</p>
          <h2 className="text-3xl font-normal tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            Free for the demo. Live trading coming soon.
          </h2>
        </motion.div>
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                p.highlight
                  ? "border-neutral-900 bg-white shadow-lg dark:border-white dark:bg-neutral-950"
                  : "border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-950"
              } ${!p.available ? "opacity-80" : ""}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-medium text-white dark:bg-white dark:text-neutral-900">
                  Most popular
                </span>
              )}
              <div className="text-sm font-medium text-neutral-500">{p.name}</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">{p.price}</div>
              <div className="mt-1 text-xs text-neutral-400">{p.sub}</div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <Check className="h-4 w-4 shrink-0 text-neutral-900 dark:text-white" /> {f}
                  </li>
                ))}
              </ul>
              {p.available ? (
                <a
                  href="/dashboard"
                  className="mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="mt-8 inline-flex w-full cursor-default items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-neutral-400 dark:border-white/15">
                  {p.cta}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
