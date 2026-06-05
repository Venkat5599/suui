import { useEffect, useRef } from "react";
import { motion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;

type NodeDef = {
  id: string;
  x: number; // relative 0..1
  y: number;
  r: number; // base radius px
  label: string;
  sub: string;
  accent: "white" | "cyan" | "emerald";
  depth: number; // parallax factor
};

const ACCENT: Record<NodeDef["accent"], string> = {
  white: "245,245,240",
  cyan: "34,211,238",
  emerald: "52,211,153",
};

const NODES: NodeDef[] = [
  { id: "agent", x: 0.15, y: 0.5, r: 16, label: "Agent", sub: "ReAct · backtest", accent: "white", depth: 1.0 },
  { id: "walrus", x: 0.5, y: 0.5, r: 20, label: "Walrus", sub: "manifest · SHA-256", accent: "cyan", depth: 0.7 },
  { id: "sui", x: 0.85, y: 0.26, r: 13, label: "Sui", sub: "Move", accent: "emerald", depth: 1.3 },
  { id: "mantle", x: 0.88, y: 0.5, r: 13, label: "Mantle", sub: "5003", accent: "cyan", depth: 1.3 },
  { id: "somnia", x: 0.85, y: 0.74, r: 13, label: "Somnia", sub: "50312", accent: "emerald", depth: 1.3 },
];

// Main signal flow edges (carry travelling packets).
const EDGES: [string, string][] = [
  ["agent", "walrus"],
  ["walrus", "sui"],
  ["walrus", "mantle"],
  ["walrus", "somnia"],
];

// Ambient constellation specks for depth.
const AMBIENT = Array.from({ length: 14 }, (_, i) => ({
  x: Math.random(),
  y: Math.random(),
  r: 1 + Math.random() * 1.6,
  phase: Math.random() * Math.PI * 2,
  speed: 0.3 + Math.random() * 0.5,
  depth: 0.4 + Math.random() * 0.8,
  seed: i,
}));

export function SignalGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Pause when off-screen.
    let visible = true;
    const io = new IntersectionObserver(
      (e) => { visible = e[0]?.isIntersecting ?? true; },
      { threshold: 0.01 },
    );
    io.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        active: true,
      };
    };
    const onLeave = () => { pointer.current.active = false; };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    const pos = (n: NodeDef, t: number) => {
      const px = (pointer.current.x - 0.5);
      const py = (pointer.current.y - 0.5);
      const par = pointer.current.active ? 18 * n.depth : 0;
      // idle bob + pointer parallax
      const bob = reduce ? 0 : Math.sin(t * 0.0006 + n.x * 8) * 6 * n.depth;
      return {
        x: n.x * W - px * par,
        y: n.y * H + bob - py * par,
      };
    };

    let raf = 0;
    let hovered: string | null = null;
    const start = performance.now();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      const t = now - start;
      ctx.clearRect(0, 0, W, H);

      const P: Record<string, { x: number; y: number }> = {};
      for (const n of NODES) P[n.id] = pos(n, t);

      // hover hit-test (nearest node within radius+10)
      hovered = null;
      if (pointer.current.active) {
        const mx = pointer.current.x * W;
        const my = pointer.current.y * H;
        for (const n of NODES) {
          const d = Math.hypot(P[n.id].x - mx, P[n.id].y - my);
          if (d < n.r + 14) { hovered = n.id; break; }
        }
      }

      // ambient specks + faint proximity lines
      ctx.save();
      for (const a of AMBIENT) {
        const px = (pointer.current.x - 0.5);
        const par = pointer.current.active ? 14 * a.depth : 0;
        const bob = reduce ? 0 : Math.sin(t * 0.0006 * a.speed + a.phase) * 8 * a.depth;
        const ax = a.x * W - px * par;
        const ay = a.y * H + bob;
        ctx.beginPath();
        ctx.arc(ax, ay, a.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245,245,240,0.18)";
        ctx.fill();
      }
      ctx.restore();

      // edges
      for (const [from, to] of EDGES) {
        const a = P[from];
        const b = P[to];
        const lit = hovered === from || hovered === to;
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, "rgba(245,245,240,0.05)");
        grad.addColorStop(0.5, lit ? "rgba(34,211,238,0.45)" : "rgba(245,245,240,0.16)");
        grad.addColorStop(1, "rgba(245,245,240,0.05)");
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        // gentle curve toward walrus hub
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = lit ? 1.6 : 1;
        ctx.stroke();

        // travelling packet
        if (!reduce) {
          const speed = 0.00018;
          const seed = (from.charCodeAt(0) + to.charCodeAt(1)) % 100;
          const tt = ((t * speed + seed / 100) % 1);
          const ease = tt < 0.5 ? 2 * tt * tt : 1 - Math.pow(-2 * tt + 2, 2) / 2;
          const px = a.x + (b.x - a.x) * ease;
          const py = a.y + (b.y - a.y) * ease;
          const glow = ctx.createRadialGradient(px, py, 0, px, py, 9);
          glow.addColorStop(0, "rgba(34,211,238,0.9)");
          glow.addColorStop(1, "rgba(34,211,238,0)");
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(245,245,240,0.95)";
          ctx.fill();
        }
      }

      // nodes
      for (const n of NODES) {
        const p = P[n.id];
        const c = ACCENT[n.accent];
        const lit = hovered === n.id;
        const pulse = reduce ? 0 : Math.sin(t * 0.002 + n.x * 6) * 1.5;
        const r = n.r + pulse + (lit ? 4 : 0);

        // glow halo
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.4);
        halo.addColorStop(0, `rgba(${c},${lit ? 0.4 : 0.22})`);
        halo.addColorStop(1, `rgba(${c},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3.4, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${c},${lit ? 0.7 : 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // core
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},0.95)`;
        ctx.fill();

        // labels
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(245,245,240,${lit ? 1 : 0.85})`;
        ctx.font = "600 14px 'Clash Display', system-ui, sans-serif";
        ctx.fillText(n.label, p.x, p.y + r + 22);
        ctx.fillStyle = "rgba(245,245,240,0.4)";
        ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillText(n.sub, p.x, p.y + r + 38);
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[58vh] min-h-[420px] w-full">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export function NetworkSection() {
  return (
    <section id="network" className="relative overflow-hidden border-t border-white/10 bg-[#0a0f12] py-24 lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[40vw] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.06] blur-[140px]" />
      <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-xl">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-300/80">
              The signal graph
            </p>
            <h2 className="font-display text-3xl font-medium leading-[1.08] tracking-tight text-[#f5f5f0] sm:text-5xl">
              One agent. One manifest. Three chains, live.
            </h2>
          </div>
          <p className="max-w-xs font-editorial text-sm leading-relaxed text-[#f5f5f0]/55">
            Every cycle the agent stores the run on Walrus, then anchors the same manifest on each chain.
            Hover the nodes.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1, ease: EASE }}
        className="relative mx-auto mt-4 max-w-[1280px] px-2"
      >
        <SignalGraph />
      </motion.div>
    </section>
  );
}
