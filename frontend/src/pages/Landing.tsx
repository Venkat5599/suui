import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowDown,
  Paperclip,
  Lightbulb,
  LineChart,
  Sparkles,
  Mic,
  Bot,
  ShieldCheck,
  Layers,
  Network,
  TerminalSquare,
  Zap,
  Boxes,
  Check,
  ChevronDown,
  Github,
} from "lucide-react";

/**
 * Tenki 天機 landing page — faithful port of the KRAFT ai-saas template look
 * (light theme, lavender-gradient hero, signature chat-input card), rebuilt
 * natively for the Vite app and themed to Tenki. All copy in English.
 */

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
        scrolled ? "border-b border-black/5 bg-white/70 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <Container className="flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-900">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">天</span>
          Tenki <span className="font-normal text-gray-400">天機</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-gray-600 md:flex">
          <a href="#features" className="transition hover:text-gray-900">Features</a>
          <a href="#how" className="transition hover:text-gray-900">How it works</a>
          <a href="#onchain" className="transition hover:text-gray-900">On-chain</a>
          <a href="#pricing" className="transition hover:text-gray-900">Pricing</a>
        </nav>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Launch App <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Container>
    </header>
  );
}

// ── Hero with signature chat-input card ─────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const send = () => {
    const q = prompt.trim();
    navigate(q ? `/agent?prompt=${encodeURIComponent(q)}` : "/agent");
  };

  const chip = (label: string, Icon: typeof LineChart, value: string) => (
    <button
      type="button"
      onClick={() => setPrompt(value)}
      className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm text-gray-500 shadow-sm ring-1 ring-black/5 transition hover:text-gray-800 hover:ring-black/10"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  );

  return (
    <section className="relative min-h-dvh w-full overflow-hidden">
      {/* Vivid lavender mesh + animated blobs (KRAFT-style, light theme) */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 12%, rgba(99,102,241,0.55) 0%, rgba(124,58,237,0.32) 38%, rgba(199,210,254,0.18) 62%, rgba(255,255,255,0) 80%), #ffffff",
        }}
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute z-0 h-[36rem] w-[36rem] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.55), transparent 60%)", top: "2rem", left: "8%" }}
        animate={{ x: [0, 80, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute z-0 h-[32rem] w-[32rem] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.50), transparent 60%)", top: "1rem", right: "6%" }}
        animate={{ x: [0, -70, 0], y: [0, 60, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      {/* Fade the wash into white toward the chat box for legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 bg-gradient-to-b from-transparent to-white" aria-hidden="true" />

      <Container className="flex min-h-dvh max-w-4xl flex-col items-start justify-center gap-8 pt-28">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-4xl font-medium leading-[1.05] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="block">Trade with AI —</span>
          <span className="block">
            read the <em className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text not-italic font-semibold text-transparent italic">hidden mechanism</em>
          </span>
        </motion.h1>

        {/* Chat-input card */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full"
        >
          <div
            className="relative rounded-[2rem] border border-black/5 bg-[#f8f8fa] p-3"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 4px 16px rgba(124,58,237,0.10)" }}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask Tenki anything…  e.g. Backtest a MACD crossover on BTC-USDT, last 30 days"
              className="mx-4 my-3 min-h-14 w-[calc(100%-2rem)] resize-none bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
              rows={2}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" aria-label="Attach" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-black/5 transition hover:text-gray-600">
                  <Paperclip className="h-4 w-4" />
                </button>
                {chip("Reasoning", Lightbulb, "")}
                {chip("Backtest", LineChart, "Backtest a MACD crossover on BTC-USDT 1h over the last 30 days and report Sharpe and max drawdown")}
                {chip("Research", Sparkles, "Build a multi-factor alpha model using momentum and volatility, backtest 2024")}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" aria-label="Voice" className="hidden h-11 w-11 place-items-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-black/5 transition hover:text-gray-700 sm:grid">
                  <Mic className="h-4 w-4" />
                </button>
                <button type="button" onClick={send} aria-label="Send" className="grid h-11 w-11 place-items-center rounded-full bg-gray-900 text-white transition hover:bg-gray-800">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-gray-500">
            Tenki runs in paper mode. Research only — not financial advice.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex w-full items-end justify-between pt-4"
        >
          <p className="max-w-sm text-sm text-gray-500">
            Describe a strategy in plain English. Tenki backtests it, reasons about the result, and anchors every signal on-chain.
          </p>
          <ArrowDown className="h-10 w-10 text-gray-400" strokeWidth={1} />
        </motion.div>
      </Container>
    </section>
  );
}

// ── Trusted-by strip ────────────────────────────────────────────────────────
const MARKETS = ["Mantle", "Sui", "Somnia", "Binance", "OKX", "yfinance"];
function TrustedBy() {
  return (
    <section className="border-y border-black/5 bg-white">
      <Container className="flex flex-col items-center gap-6 py-10">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Data &amp; chains powering Tenki</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {MARKETS.map((m) => (
            <span key={m} className="text-lg font-semibold tracking-tight text-gray-400">{m}</span>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── Stats ───────────────────────────────────────────────────────────────────
const STATS = [
  { value: "3", label: "Chains anchored", sub: "Mantle · Sui · Somnia" },
  { value: "45+", label: "Models routed", sub: "OpenCode + auto-fallback" },
  { value: "100%", label: "On-chain provable", sub: "every signal hashed" },
  { value: "0", label: "Lines of code", sub: "natural language only" },
];
function Stats() {
  return (
    <section className="bg-white py-20">
      <Container className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((s) => (
          <motion.div key={s.label} {...fadeUp} className="text-center">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-4xl font-semibold text-transparent">{s.value}</div>
            <div className="mt-1 text-sm font-medium text-gray-800">{s.label}</div>
            <div className="text-xs text-gray-400">{s.sub}</div>
          </motion.div>
        ))}
      </Container>
    </section>
  );
}

// ── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Bot, title: "Agentic research loop", body: "A multi-step agent plans, runs tools, and reasons — backtest, analyze, decide, publish — in one autonomous pass." },
  { icon: LineChart, title: "Real backtesting", body: "Crypto, US equities, and A-share engines with Sharpe, drawdown, benchmark, and excess-return metrics." },
  { icon: Layers, title: "Alpha Zoo", body: "Browse, benchmark, and compare a library of factor strategies, then export a manifest for any of them." },
  { icon: Network, title: "On-chain signal vault", body: "Every published backtest is hashed to Walrus and anchored across Mantle, Sui, and Somnia — tamper-evident forever." },
  { icon: ShieldCheck, title: "Paper-safe by default", body: "Runs in paper mode with a live HALT switch. No real orders unless you explicitly opt in." },
  { icon: TerminalSquare, title: "Any model, auto-fallback", body: "Routes through an OpenAI-compatible gateway with automatic failover — never stops mid-run." },
];
function Features() {
  return (
    <section id="features" className="bg-[#fafafb] py-24">
      <Container>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-500">Capabilities</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">A professional agent team, on tap</h2>
          <p className="mt-4 text-gray-500">Everything you need to go from a sentence to a provable, on-chain trading signal.</p>
        </motion.div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: (i % 3) * 0.08 }}
              className="group rounded-3xl border border-black/5 bg-white p-7 shadow-sm transition hover:shadow-md"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-500 transition group-hover:bg-indigo-100">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.body}</p>
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
  { n: "02", title: "Agent runs", body: "Tenki backtests, computes metrics, and reasons about whether the result is worth keeping." },
  { n: "03", title: "Anchor", body: "Strong signals are hashed to Walrus and published on-chain across three networks — provable forever." },
];
function HowItWorks() {
  return (
    <section id="how" className="bg-white py-24">
      <Container>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-500">Workflow</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">From a sentence to a signal</h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="rounded-3xl border border-black/5 bg-[#fafafb] p-8">
              <div className="text-5xl font-semibold text-gray-200">{s.n}</div>
              <h3 className="mt-3 text-xl font-medium text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── On-chain ────────────────────────────────────────────────────────────────
const CHAINS = [
  { name: "Mantle Sepolia", role: "SignalVault (EVM)" },
  { name: "Sui Testnet", role: "signal_vault (Move)" },
  { name: "Somnia Shannon", role: "SignalVault (EVM)" },
];
function OnChain() {
  return (
    <section id="onchain" className="bg-[#fafafb] py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div {...fadeUp}>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-500">Proof, not promises</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">Every signal, anchored across three chains</h2>
          <p className="mt-4 text-gray-500">
            Backtest manifests are stored on Walrus and registered on-chain with their SHA-256. Anyone can fetch the
            manifest and verify it matches what was committed — no trust required.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
            <Boxes className="h-5 w-5 text-indigo-500" />
            Content-addressed · tamper-evident · publicly verifiable
          </div>
        </motion.div>
        <motion.div {...fadeUp} className="space-y-3">
          {CHAINS.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm">
              <div>
                <div className="font-medium text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-400">{c.role}</div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">Live</span>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

// ── Pricing ─────────────────────────────────────────────────────────────────
const PLANS = [
  { name: "Research", price: "Free", sub: "Everything for the demo", features: ["Natural-language backtests", "Crypto · US · A-share data", "Alpha Zoo + swarm teams", "Paper mode"], cta: "Start free", highlight: false },
  { name: "On-chain", price: "$0", sub: "Testnet anchoring included", features: ["Everything in Research", "Walrus signal vault", "Mantle · Sui · Somnia anchors", "Provable manifests"], cta: "Launch app", highlight: true },
  { name: "Live", price: "Soon", sub: "Real broker connectors", features: ["Everything in On-chain", "IBKR / Robinhood bridge", "Mandate + HALT controls", "Read-only by default"], cta: "Join waitlist", highlight: false },
];
function Pricing() {
  return (
    <section id="pricing" className="bg-white py-24">
      <Container>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-500">Pricing</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">Start free. Stay free for the demo.</h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <motion.div
              key={p.name}
              {...fadeUp}
              className={`rounded-3xl border p-8 ${p.highlight ? "border-indigo-200 bg-gradient-to-b from-indigo-50 to-white shadow-md ring-1 ring-indigo-100" : "border-black/5 bg-white shadow-sm"}`}
            >
              <div className="text-sm font-medium text-gray-500">{p.name}</div>
              <div className="mt-2 text-4xl font-semibold tracking-tight text-gray-900">{p.price}</div>
              <div className="mt-1 text-xs text-gray-400">{p.sub}</div>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 shrink-0 text-indigo-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/dashboard"
                className={`mt-7 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-medium transition ${p.highlight ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
              >
                {p.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Do I need to write code?", a: "No. You describe strategies in plain English and the agent handles the backtest, analysis, and on-chain publishing." },
  { q: "Does it place real trades?", a: "It runs in paper mode by default with a live HALT switch. Real orders only happen if you explicitly enable a broker connector." },
  { q: "What does \"on-chain\" actually mean here?", a: "Each published backtest is hashed and registered on Mantle, Sui, and Somnia, with the data stored on Walrus — so any result is independently verifiable." },
  { q: "Which AI model powers it?", a: "It routes through an OpenAI-compatible gateway with automatic failover, so it never stops mid-run." },
];
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-[#fafafb] py-24">
      <Container className="max-w-3xl">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-500">FAQ</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">Questions, answered</h2>
        </motion.div>
        <div className="mt-12 divide-y divide-black/5 rounded-3xl border border-black/5 bg-white px-6 shadow-sm">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                <span className="font-medium text-gray-900">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="pb-5 text-sm leading-relaxed text-gray-500">{f.a}</p>}
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
    <section className="bg-white py-24">
      <Container>
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[2.5rem] px-8 py-20 text-center text-white"
          style={{ background: "radial-gradient(120% 120% at 50% 0%, #6366F1 0%, #4338CA 60%, #312E81 100%)" }}
        >
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
            <Zap className="h-3.5 w-3.5" /> Natural-language quant research, on-chain proof
          </div>
          <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">Bring your strategy. Tenki does the rest.</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">Open the app, type a thesis, and watch it become a provable on-chain signal.</p>
          <Link to="/agent" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100">
            Launch Tenki 天機 <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white py-10">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">天</span>
          Tenki 天機
        </div>
        <p className="text-xs text-gray-400">Paper-mode research tool. Not financial advice.</p>
        <a href="https://github.com/Venkat5599/Tenki" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900">
          <Github className="h-4 w-4" /> GitHub
        </a>
      </Container>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <Header />
      <main>
        <Hero />
        <TrustedBy />
        <Stats />
        <Features />
        <HowItWorks />
        <OnChain />
        <Pricing />
        <Faq />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}

export default Landing;
