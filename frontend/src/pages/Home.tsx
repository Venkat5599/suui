import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Bot,
  BarChart3,
  Zap,
  UserCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  Network,
} from "lucide-react";
import { Counter } from "@/components/editorial/AwwwardsMotion";

const EASE = [0.23, 1, 0.32, 1] as const;

const FEATURES = [
  { icon: Bot, title: "AI Agent", desc: "Natural-language strategy generation with ReAct reasoning." },
  { icon: BarChart3, title: "Built-in Backtest", desc: "3 data sources — A-shares, US/HK, and Crypto — with full metrics." },
  { icon: Zap, title: "Real-time Streaming", desc: "Watch the agent think, call tools, and iterate live." },
  { icon: UserCircle2, title: "Strategy Replay", desc: "Trade-journal analyzer + Shadow Account — extract rules, backtest, attribute PnL." },
  { icon: Layers, title: "Alpha Zoo", desc: "Browse, benchmark, and export a library of factor strategies." },
  { icon: Network, title: "On-chain Vault", desc: "Anchor every signal across Mantle, Sui, and Somnia — provable forever." },
  { icon: ShieldCheck, title: "Paper-safe", desc: "Runs in paper mode with a live HALT switch by default." },
  { icon: Sparkles, title: "Swarm Teams", desc: "Multi-agent committees debate and decide together." },
];

const STATS = [
  { value: "3", label: "Chains anchored" },
  { value: "45+", label: "Models routed" },
  { value: "77", label: "Finance skills" },
  { value: "100%", label: "On-chain provable" },
];

const QUICK = [
  { label: "MACD on BTC", prompt: "Backtest a MACD crossover on BTC-USDT 1h over the last 30 days and report Sharpe and max drawdown" },
  { label: "Risk-parity portfolio", prompt: "Backtest a risk-parity portfolio of 000001.SZ, BTC-USDT, and AAPL for 2024, compare against equal-weight" },
  { label: "Factor alpha model", prompt: "Build a multi-factor alpha model using momentum and volatility on CSI 300, backtest 2024" },
];

export function Home() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-y-auto">
      {/* Ambient glow wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[-160px] h-[480px] w-[760px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, hsl(var(--primary)/0.16) 0%, transparent 70%)" }}
        />
        <div className="absolute left-[18%] top-[40px] h-[260px] w-[260px] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute right-[16%] top-[80px] h-[240px] w-[240px] rounded-full bg-emerald-500/[0.08] blur-[100px]" />
        {/* faint grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right,currentColor 1px,transparent 1px),linear-gradient(to bottom,currentColor 1px,transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, #000, transparent)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            Autonomous quant research · on-chain proof
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-7 font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
          >
            AI-powered{" "}
            <span className="italic text-cyan-500 dark:text-cyan-300">quant</span>
            <br />
            strategy research
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
            className="mx-auto mt-6 max-w-xl font-editorial text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Describe a trading strategy in plain English. The agent generates code, runs backtests,
            and anchors the result on-chain — all in real time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/agent"
              className="group inline-flex items-center gap-2.5 rounded-full bg-primary py-3 pl-6 pr-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform duration-200 active:scale-[0.97]"
            >
              Start research
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/10 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </Link>
            <Link
              to="/alpha-zoo"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium transition-colors duration-300 hover:border-primary/40 hover:bg-muted"
            >
              Explore Alpha Zoo
            </Link>
          </motion.div>

          {/* Quick-start chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">Try</span>
            {QUICK.map((q) => (
              <button
                key={q.label}
                onClick={() => navigate(`/agent?prompt=${encodeURIComponent(q.prompt)}`)}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground transition-colors duration-300 hover:border-cyan-500/40 hover:text-foreground"
              >
                {q.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Stats — double-bezel rail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto mt-20 max-w-3xl rounded-[2rem] border border-border bg-card/40 p-1.5 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[calc(2rem-0.375rem)] sm:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }}
                className="bg-card/60 px-4 py-7 text-center"
              >
                <Counter
                  value={s.value}
                  className="ss-figures block font-display text-4xl font-semibold tracking-tight sm:text-5xl"
                />
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature grid — double-bezel cards */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: EASE, delay: (i % 4) * 0.07 }}
              className="group rounded-[1.5rem] border border-border bg-card/40 p-1.5 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1"
            >
              <div className="relative h-full overflow-hidden rounded-[calc(1.5rem-0.375rem)] border border-border/60 bg-card p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 font-display text-base font-medium">{title}</h3>
                <p className="mt-1.5 font-editorial text-sm leading-relaxed text-muted-foreground">{desc}</p>
                <span className="absolute -bottom-px left-6 right-6 h-px scale-x-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
