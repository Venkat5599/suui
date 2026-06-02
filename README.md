<h1 align="center">Tenki 天機</h1>

<p align="center">
  <b>Read the market's hidden mechanism.</b><br/>
  An autonomous AI quant-research agent that turns a plain-English idea into a
  backtested, reasoned, and on-chain-provable trading signal.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11%2B-3776AB?style=flat&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat" alt="FastAPI">
  <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Chains-Mantle%20%C2%B7%20Sui%20%C2%B7%20Somnia-111?style=flat" alt="Chains">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat" alt="License"></a>
</p>

<p align="center">
  <a href="https://ten-ki.live"><b>🌐 ten-ki.live</b></a> &nbsp;·&nbsp;
  <a href="#-what-it-is">What it is</a> &nbsp;·&nbsp;
  <a href="#-features">Features</a> &nbsp;·&nbsp;
  <a href="#-on-chain-signal-vault">Signal Vault</a> &nbsp;·&nbsp;
  <a href="#-architecture">Architecture</a> &nbsp;·&nbsp;
  <a href="#-quick-start">Quick start</a>
</p>

---

## 🎯 What it is

**Tenki** is an autonomous trading-research agent. You describe a strategy in plain
English — *"backtest a MACD crossover on BTC-USDT over the last 30 days"* — and the
agent does the rest: it plans, fetches market data, writes and runs the backtest,
reasons about the result, and (when the signal is good enough) anchors a
tamper-evident proof of it on-chain. No code required.

It is built for the moment between an idea and a decision: turning a sentence into a
**provable, reproducible** research artifact instead of a throwaway notebook cell.

```
Describe  →  Agent runs (backtest · analyze · decide)  →  Anchor on-chain
```

## ✨ Features

- **Agentic research loop** — a multi-step agent plans, calls tools, and reasons in
  one autonomous pass (ReAct-style), streaming its thinking live.
- **Real backtesting** — Crypto, US/HK equities, and China A-share engines with
  Sharpe, drawdown, benchmark, and excess-return metrics. Automatic data-source
  fallback keeps fetches working across regions.
- **Alpha Zoo** — 450+ pre-built quant alphas (Qlib 158, Kakushadze 101, GTJA 191,
  academic anomalies). Browse formulas and source, or score a whole zoo on a
  universe via the bench runner (IC / IR, bucketed alive / reversed / dead).
- **On-chain signal vault** — every published backtest is hashed to Walrus and
  registered across **Mantle, Sui, and Somnia** — content-addressed and publicly
  verifiable.
- **Swarm teams** — multi-agent committees (investment committee, quant desk) that
  debate and decide together.
- **Trade-journal analyzer + Shadow Account** — parse a broker CSV, extract your
  trading rules, backtest your own pattern, and attribute the PnL delta between
  what you did and what your rules say you should have.
- **Correlation Matrix** — cross-asset daily-returns correlation, including the
  native tokens of the anchor chains (MNT · SUI · SOMI).
- **Any model, with auto-fallback** — routes through an OpenAI-compatible gateway
  and transparently fails over to a backup provider, so a run never stops midway.
- **Paper-safe by default** — runs in paper mode with a live HALT switch. Real
  orders only happen behind an explicit broker connector + committed mandate.

## 🔗 On-chain signal vault

Backtest run cards are stored on **Walrus** decentralized storage. A content-addressed
pointer — the Walrus blob id plus the SHA-256 of its content — is registered on-chain
so anyone can fetch the manifest from any aggregator and prove it matches what the
agent committed. The chain holds the tamper-evident, ownership-bearing pointer;
Walrus holds the bytes.

| Chain | Contract | Address / Package | Role |
|---|---|---|---|
| **Mantle Sepolia** (5003) | `SignalVault` (Solidity) | [`0x36Da3c6EeF7A92e6060b68688573B7f31Bf3B57B`](https://explorer.sepolia.mantle.xyz/address/0x36Da3c6EeF7A92e6060b68688573B7f31Bf3B57B) | EVM anchor |
| **Somnia Shannon** (50312) | `SignalVault` (Solidity) | [`0x36Da3c6EeF7A92e6060b68688573B7f31Bf3B57B`](https://shannon-explorer.somnia.network/address/0x36Da3c6EeF7A92e6060b68688573B7f31Bf3B57B) | high-throughput EVM anchor |
| **Sui** testnet | `signal_vault` (Move) | [`0x0e4326568fb219c65f63457849c9878f06ac1c7f8f0c44795d0dc78e18565b87`](https://testnet.suivision.xyz/package/0x0e4326568fb219c65f63457849c9878f06ac1c7f8f0c44795d0dc78e18565b87) | Walrus-native registration via Tatum RPC |

> Mantle and Somnia share the same address because the contract is deployed from the
> same key at the same nonce on each chain (deterministic CREATE).

The agent reads its own on-chain history and **autonomously decides** whether each
new signal is novel and good enough to publish — it does not blindly anchor
everything.

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React 19 (Vite) SPA  ·  landing + dashboard                 │
│  agent chat · Alpha Zoo · correlation · settings · Clerk auth│
└───────────────┬─────────────────────────────────────────────┘
                │  OpenAI-compatible / SSE
┌───────────────▼─────────────────────────────────────────────┐
│  FastAPI server                                              │
│  agent loop · backtest engines · alpha bench · sessions      │
│  on-chain publisher (Walrus + Mantle/Sui/Somnia)             │
└───────────────┬─────────────────────────────────────────────┘
                │
   LLM gateway (primary + auto-fallback)   ·   market data loaders
```

- **Frontend** — React 19 + Vite + Tailwind, Clerk for per-user auth.
- **Backend** — Python 3.11 + FastAPI; the agent, backtest engines, alpha zoo, and
  the on-chain publisher.
- **Deploy** — Docker Compose (API + worker), served behind nginx with TLS.

## 🚀 Quick start

```bash
# 1. Clone
git clone https://github.com/Venkat5599/Tenki.git
cd Tenki

# 2. Configure — copy the example env and set an LLM key
cp agent/.env.example agent/.env
#   set LANGCHAIN_PROVIDER / LANGCHAIN_MODEL_NAME / the matching *_API_KEY
#   (any OpenAI-compatible provider works)

# 3. Run the full stack
docker compose up -d --build
#   app → http://localhost:8899
```

For local dev without Docker:

```bash
# Backend
cd agent && python -m venv .venv && source .venv/bin/activate
pip install -e ".[evm]"
vibe-trading serve --host 0.0.0.0 --port 8899

# Frontend
cd frontend && npm install && npm run dev
```

### Useful env

| Variable | Purpose |
|---|---|
| `LANGCHAIN_PROVIDER` / `LANGCHAIN_MODEL_NAME` | primary LLM |
| `LLM_FALLBACK_API_KEY` / `_BASE_URL` / `_MODEL` | automatic fallback provider |
| `EVM_PRIVATE_KEY`, `MANTLE_VAULT_ADDRESS`, `SOMNIA_VAULT_ADDRESS` | EVM anchoring |
| `SUI_VAULT_PACKAGE`, `SUI_PRIVATE_KEY`, `TATUM_API_KEY` | Sui + Walrus anchoring |
| `CCXT_EXCHANGE` | crypto data exchange (default `gate`) |

## 🧪 Example prompts

```
Backtest a MACD crossover on BTC-USDT 1h over the last 30 days, report Sharpe and drawdown
Backtest a risk-parity portfolio of 000001.SZ, BTC-USDT, and AAPL for 2024 vs equal-weight
Build a multi-factor alpha model using momentum and volatility on CSI 300, backtest 2024
[Swarm Team Mode] Use the investment_committee preset to decide long vs short on NVDA
Analyze the trade journal I just uploaded and tell me which bias hurts my PnL most
```

## 📁 Project structure

```
agent/        Python — FastAPI server, agent loop, backtest engines, alpha zoo
frontend/     React 19 (Vite) — landing + dashboard
evm/          SignalVault Solidity contract (Mantle / Somnia)
sui/          signal_vault Move package (Sui)
docker-compose.yml
```

## 📜 License & credits

MIT. Tenki builds on the open-source
extended with the on-chain signal vault (Walrus + Mantle/Sui/Somnia), the alpha
bench runner, per-user auth, and the Tenki product layer.

> Research tool. Paper-mode by default. **Not financial advice.**
