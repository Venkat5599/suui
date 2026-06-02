import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  LineChart,
  ShieldCheck,
  Boxes,
  Zap,
  Layers,
  TerminalSquare,
  Network,
  Github,
  ChevronDown,
} from "lucide-react";
import SilkWaves from "@/components/silk-waves";

/**
 * Vibe-Trading marketing landing page.
 * Ported from the ai-saas template design language (dark + indigo, blur-in hero,
 * sectioned layout) and rebuilt natively for the Vite app, enhanced with the
 * React Bits Pro SilkWaves WebGL hero background. All copy in English.
 */

const ACCENT = "#6366F1";
const SILK_COLORS = ["#03040A", "#0b0f2a", "#1b2150", "#2a2f7a", "#4a45b8", "#6366F1"];

const fadeUp = {
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 lg:px-8 ${className}`}>{children}</div>;
}

// ── Header ──────────────────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/10 bg-[#03040A]/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-500 text-sm font-bold text-white">天</span>
          Tenki <span className="text-white/50">天機</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#how" className="transition hover:text-white">How it works</a>
          <a href="#onchain" className="transition hover:text-white">On-chain</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
        </nav>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#03040A] transition hover:opacity-90"
        >
          Launch App <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Container>
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-dvh w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <SilkWaves colors={SILK_COLORS} speed={0.7} scale={2} opacity={0.9} className="h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#03040A] to-transparent" />
      </div>

      <Container className="flex min-h-dvh flex-col items-start justify-center gap-7 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur"
        >
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
          Natural-language quant research, on-chain proof
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Read the market&apos;s
          <span className="block">
            hidden <em className="italic text-indigo-300">mechanism</em>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
        >
          Describe a strategy in plain English. The agent backtests it, analyzes the result, and
          anchors every signal on-chain — across Mantle, Sui, and Somnia. No code required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-wrap items-center gap-3"
        >
          <Link
            to="/agent"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            Start backtesting <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
          >
            Open dashboard
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}

// ── Stats strip ─────────────────────────────────────────────────────────────
const STATS = [
  { value: "3", label: "Chains anchored", sub: "Mantle · Sui · Somnia" },
  { value: "45+", label: "Models routed", sub: "via OpenCode Zen" },
  { value: "100%", label: "On-chain provable", sub: "every signal hashed" },
  { value: "0", label: "Lines of code", sub: "natural language only" },
];

function Stats() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <Container className="grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
        {STATS.map((s) => (
          <motion.div key={s.label} {...fadeUp} className="text-center">
            <div className="text-3xl font-semibold text-white sm:text-4xl" style={{ color: ACCENT }}>
              {s.value}
            </div>
            <div className="mt-1 text-sm font-medium text-white/80">{s.label}</div>
            <div className="text-xs text-white/40">{s.sub}</div>
          </motion.div>
        ))}
      </Container>
    </section>
  );
}

// ── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Bot, title: "Agentic research loop", body: "A multi-step agent plans, runs tools, and reasons — backtest, analyze, decide, publish — in one autonomous pass." },
  { icon: LineChart, title: "Real backtesting", body: "Crypto, US equities, and A-share engines with Sharpe, drawdown, benchmark and excess-return metrics." },
  { icon: Layers, title: "Alpha Zoo", body: "Browse, benchmark, and compare a library of factor strategies, then export a manifest for any of them." },
  { icon: Network, title: "On-chain signal vault", body: "Every published backtest is hashed to Walrus and anchored across Mantle, Sui, and Somnia — tamper-evident forever." },
  { icon: ShieldCheck, title: "Paper-safe by default", body: "Runs in paper mode with a live HALT switch. No real orders unless you explicitly opt in." },
  { icon: TerminalSquare, title: "Any model, OpenAI-compatible", body: "Routes through OpenCode Zen — swap between 45+ models with a single setting, no app changes." },
];

function Features() {
  return (
    <section id="features" className="py-24">
      <Container>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Capabilities</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-white sm:text-4xl">
            A professional agent team, on tap
          </h2>
          <p className="mt-4 text-white/55">
            Everything you need to go from a sentence to a provable, on-chain trading signal.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: (i % 3) * 0.08 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-indigo-500/40 hover:bg-white/[0.04]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300 transition group-hover:bg-indigo-500/25">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── How it works ────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Describe", body: "Type a strategy in plain English — \"backtest a MACD crossover on BTC/USDT, 30 days.\"" },
  { n: "02", title: "Agent runs", body: "The agent backtests, computes metrics, and reasons about whether the result is worth keeping." },
  { n: "03", title: "Anchor", body: "Strong signals are hashed to Walrus and published on-chain across three networks — provable forever." },
];

function HowItWorks() {
  return (
    <section id="how" className="border-t border-white/10 py-24">
      <Container>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Workflow</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-white sm:text-4xl">
            From a sentence to a signal
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-7">
              <div className="text-5xl font-semibold text-white/10">{s.n}</div>
              <h3 className="mt-3 text-xl font-medium text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── On-chain section ────────────────────────────────────────────────────────
const CHAINS = [
  { name: "Mantle Sepolia", role: "SignalVault (EVM)" },
  { name: "Sui Testnet", role: "signal_vault (Move)" },
  { name: "Somnia Shannon", role: "SignalVault (EVM)" },
];

function OnChain() {
  return (
    <section id="onchain" className="py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div {...fadeUp}>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Proof, not promises</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Every signal, anchored across three chains
          </h2>
          <p className="mt-4 text-white/55">
            Backtest manifests are stored on Walrus and registered on-chain with their SHA-256.
            Anyone can fetch the manifest and verify it matches what was committed — no trust required.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Boxes className="h-5 w-5 text-indigo-400" />
            <span className="text-sm text-white/70">Content-addressed · tamper-evident · publicly verifiable</span>
          </div>
        </motion.div>
        <motion.div {...fadeUp} className="space-y-3">
          {CHAINS.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <div>
                <div className="font-medium text-white">{c.name}</div>
                <div className="text-xs text-white/45">{c.role}</div>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">Live</span>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

// ── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Do I need to write code?", a: "No. You describe strategies in plain English and the agent handles the backtest, analysis, and on-chain publishing." },
  { q: "Does it place real trades?", a: "It runs in paper mode by default with a live HALT switch. Real orders only happen if you explicitly enable live mode." },
  { q: "What does \"on-chain\" actually mean here?", a: "Each published backtest is hashed and registered on Mantle, Sui, and Somnia, with the data stored on Walrus — so any result is independently verifiable." },
  { q: "Which AI model powers it?", a: "It routes through an OpenAI-compatible gateway (OpenCode Zen) so you can pick from 45+ models with one setting." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-white/10 py-24">
      <Container className="max-w-3xl">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">FAQ</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-white sm:text-4xl">Questions, answered</h2>
        </motion.div>
        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-medium text-white">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-white/40 transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="pb-5 text-sm leading-relaxed text-white/55">{f.a}</p>}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── CTA + Footer ────────────────────────────────────────────────────────────
function BottomCTA() {
  return (
    <section className="py-24">
      <Container>
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 via-white/[0.02] to-transparent px-8 py-16 text-center"
        >
          <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-tight text-white sm:text-4xl">
            Bring your strategy. The agent does the rest.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/55">
            Open the app, type a thesis, and watch it become a provable on-chain signal.
          </p>
          <Link
            to="/agent"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-500 px-7 py-3 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            Launch Vibe-Trading <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-500 text-xs font-bold text-white">天</span>
          Tenki 天機
        </div>
        <p className="text-xs text-white/35">Paper-mode research tool. Not financial advice.</p>
        <a href="https://github.com/Venkat5599/Vibe-Trading" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white">
          <Github className="h-4 w-4" /> GitHub
        </a>
      </Container>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-[#03040A] text-white antialiased">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <OnChain />
        <Faq />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}

export default Landing;
