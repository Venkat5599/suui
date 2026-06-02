import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  BarChart3,
  Zap,
  UserCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  Network,
} from "lucide-react";

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
      {/* Subtle top wash */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px]"
        style={{ background: "radial-gradient(80% 100% at 50% 0%, hsl(var(--primary)/0.10) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5" /> Autonomous quant research · on-chain proof
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            AI-powered quant
            <br />
            strategy research
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Describe a trading strategy in plain English. The agent generates code, runs backtests,
            and anchors the result on-chain — all in real time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/agent"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Start research <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/alpha-zoo"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium transition hover:bg-muted"
            >
              Explore Alpha Zoo
            </Link>
          </motion.div>

          {/* Quick-start chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {QUICK.map((q) => (
              <button
                key={q.label}
                onClick={() => navigate(`/agent?prompt=${encodeURIComponent(q.prompt)}`)}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="text-center"
            >
              <div className="text-3xl font-bold tracking-tight">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
