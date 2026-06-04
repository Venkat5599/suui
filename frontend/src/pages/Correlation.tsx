import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { CorrelationMatrix } from "@/components/charts/CorrelationMatrix";
import { authHeadersAsync } from "@/lib/apiAuth";

const WINDOWS = [30, 60, 90, 180, 365] as const;

const PRESETS = [
  { label: "Tenki chains (MNT·SUI·SOMI)", codes: "MNT-USDT,SUI-USDT,SOMI-USDT" },
  { label: "Chains vs majors", codes: "MNT-USDT,SUI-USDT,SOMI-USDT,BTC-USDT,ETH-USDT" },
  { label: "Crypto + equities", codes: "BTC-USDT,ETH-USDT,SPY,AAPL" },
  { label: "L1 majors", codes: "BTC-USDT,ETH-USDT,SUI-USDT,SOL-USDT" },
] as const;

export function Correlation() {
  const [codes, setCodes] = useState("BTC-USDT,ETH-USDT,SPY,AAPL");
  const [days, setDays] = useState<number>(90);
  const [method, setMethod] = useState<"pearson" | "spearman">("pearson");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [labels, setLabels] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<number[][]>([]);

  const compute = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await request<{ labels: string[]; matrix: number[][] }>(
        `/correlation?codes=${encodeURIComponent(codes)}&days=${days}&method=${method}`
      );
      setLabels(result.labels);
      setMatrix(result.matrix);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to compute correlation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6 lg:p-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <BarChart3 className="h-4 w-4" /> Cross-asset analytics
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Correlation Matrix</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Measure how assets move together. Pick a basket — including the Tenki chains
          (MNT · SUI · SOMI) — choose a window and method, then compute a daily-returns
          correlation heatmap.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Asset codes</label>
          <input
            type="text"
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
            placeholder="BTC-USDT,ETH-USDT,SPY"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-mono outline-none transition focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated ticker symbols, e.g. BTC-USDT,ETH-USDT,AAPL,SPY
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setCodes(p.codes)}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Window (days)</label>
            <div className="flex gap-1.5">
              {WINDOWS.map((w) => (
                <button
                  key={w}
                  onClick={() => setDays(w)}
                  className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                    days === w
                      ? "bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary"
                  }`}
                >
                  {w}d
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Method</label>
            <div className="flex gap-1.5">
              {(["pearson", "spearman"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 rounded text-sm border transition-colors capitalize ${
                    method === m
                      ? "bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={compute}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 self-start rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Computing…" : "Compute correlation"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-danger border border-danger/30 rounded p-3 bg-danger/5">
          {error}
        </div>
      )}

      {/* Chart */}
      {labels.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            {method === "pearson" ? "Pearson" : "Spearman"} correlation · {days}-day window
          </h2>
          <CorrelationMatrix labels={labels} matrix={matrix} height={520} />
        </div>
      )}
    </div>
  );
}

// Minimal request helper — includes the API auth header so it works behind auth.
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(await authHeadersAsync()), ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      const raw = body.detail ?? body.message ?? detail;
      detail = Array.isArray(raw)
        ? raw.map((e) => (typeof e === "string" ? e : e?.msg || JSON.stringify(e))).join("; ")
        : typeof raw === "object" && raw !== null
          ? (raw as { msg?: string }).msg || JSON.stringify(raw)
          : String(raw);
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}