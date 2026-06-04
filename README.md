<p align="center">
  <img src="https://img.shields.io/badge/🤖-Tenki-22d3ee?style=for-the-badge&labelColor=0a0f12" alt="Tenki" />
</p>

<h1 align="center">Tenki</h1>

<p align="center">
  <strong>Autonomous AI Quant Agent with Tamper-Evident, Multi-Chain Signal Proof</strong>
</p>

<p align="center">
  Read the market's hidden mechanism — natural-language finance research, backtesting,
  and a 24/7 agent that anchors every result on <strong>Sui</strong>, <strong>Mantle</strong>, and <strong>Somnia</strong>.
</p>

<p align="center">
  <a href="https://ten-ki.live">
    <img src="https://img.shields.io/badge/🔴_LIVE-ten--ki.live-22d3ee?style=for-the-badge" alt="Live app" />
  </a>
  <img src="https://img.shields.io/badge/⛓️_3_Chains-Sui_·_Mantle_·_Somnia-00FF88?style=for-the-badge" alt="Three chains" />
  <img src="https://img.shields.io/badge/Python_·_LangChain-363636?style=for-the-badge&logo=python" alt="Python" />
</p>

---

## 📋 Overview

**Tenki** is an autonomous AI quant agent. Describe a strategy in plain English and it generates
a signal engine, runs a backtest, and produces a *trust-layer run card* for every run. A 24/7
worker then makes those artifacts **decentralized, portable, and tamper-evident**:

1. **Walrus** stores the actual bytes — `run_card.json`, metrics, and the LLM-generated `strategy.py` — as content-addressed blobs.
2. A small **manifest** blob indexes them with their SHA-256 hashes.
3. **Three chains** (Sui via Tatum, Mantle Sepolia, Somnia Shannon) each pin the manifest's `blobId` + hash + size as an on-chain `SignalEntry`.

Anyone can fetch a strategy/backtest from any Walrus aggregator and prove — against the on-chain
record — that it is exactly what the agent published. **No trusted server. No human in the loop.**

### The agent *decides* — it doesn't just schedule

Each cycle the worker runs as an agent: it runs a backtest, reads what it has already published
on-chain, reasons about whether the new result clears a quality bar *and* is novel, and only then
publishes. Otherwise it declines and explains why. That is agent-native behavior.

---

## ⛓️ Live On-Chain Proof

One autonomous cycle anchored the **same Walrus manifest on all three chains**. Verify it yourself:

**Walrus manifest blob:** `bTw4KKMbfl_NDDq5N41Huc_NO5S8RKoM6B3Cap3WBbU`

| Chain | Contract / Object | Explorer |
|-------|-------------------|----------|
| **Sui** (testnet, via Tatum RPC) | `SignalEntry` `0x758465055fc675598d72d255882521d0f26b0e2836f4f215407cbd7e5290f518` | [SuiScan](https://suiscan.xyz/testnet/object/0x758465055fc675598d72d255882521d0f26b0e2836f4f215407cbd7e5290f518) |
| **Mantle Sepolia** (chain 5003) | `SignalVault` `0xD6786AD160648A4C7e232e77394A5FEa2a37Cf14` | [Explorer](https://explorer.sepolia.mantle.xyz/address/0xD6786AD160648A4C7e232e77394A5FEa2a37Cf14) |
| **Somnia Shannon** (chain 50312) | `SignalVault` `0xf61CBfe72aA03a12A64122b0aDA0B19CE57ad80D` | [Explorer](https://shannon-explorer.somnia.network/address/0xf61CBfe72aA03a12A64122b0aDA0B19CE57ad80D) |

Publisher (EVM): `0x4Bb251A97A9b7e9c235f2ce7e2a3922bBb49Ace7` · Publisher (Sui): `0x0ecf280e25ba8dc55499a9b8a0a9ba73eb04c93ec355619f8bd8a1f85ea89836`

### Verify the blob ↔ chain match

```bash
# 1. Fetch the manifest bytes from any Walrus aggregator (content-addressed)
curl -s https://aggregator.walrus-testnet.walrus.space/v1/blobs/bTw4KKMbfl_NDDq5N41Huc_NO5S8RKoM6B3Cap3WBbU

# 2. Read the on-chain SignalEntry on Sui (routes through Tatum's RPC gateway)
curl -s -X POST https://sui-testnet.gateway.tatum.io \
  -H "Content-Type: application/json" -H "x-api-key: <YOUR_TATUM_KEY>" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getObject","params":["0x758465055fc675598d72d255882521d0f26b0e2836f4f215407cbd7e5290f518",{"showContent":true}]}'

# The blob_id + sha256 + size on every chain match the Walrus manifest above.
```

---

## 🚀 What It Does

- **Natural-language quant** — "Backtest a MACD+RSI strategy on BTC-USDT 1h for 90 days" → strategy code + run card + metrics (Sharpe, return, drawdown).
- **Multi-market** — A-shares, crypto (OKX), US/HK equities (yfinance). Minute-to-daily timeframes.
- **Swarm teams** — multi-agent presets (investment committee, quant desk) that debate and decide.
- **Trade-journal analysis** — parse any broker CSV; diagnose behavioral biases.
- **Decentralized proof** — every run is stored on Walrus and anchored on three chains, tamper-evident and portable.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         USER (natural language)                         │
│                  "Backtest MACD+RSI on BTC-USDT 1h, 90d"                │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Tenki Agent  (LangChain · FastAPI)                     │
│   backtest tool → strategy.py + run_card.json + metrics  →  run dir      │
└────────────────────────────────────────────────────────────────────────┘
                                   │   (24/7 autonomous worker)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Signal Vault  (vault.py)                          │
│   1. PUT bytes → Walrus blobs   2. manifest blob (indexes + SHA-256)    │
└────────────────────────────────────────────────────────────────────────┘
              │                       │                       │
              ▼                       ▼                       ▼
   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
   │   SUI (via Tatum)  │  │   MANTLE Sepolia   │  │   SOMNIA Shannon   │
   │  signal_vault Move │  │  SignalVault.sol   │  │  SignalVault.sol   │
   │  publish_signal()  │  │  publishSignal()   │  │  publishSignal()   │
   └────────────────────┘  └────────────────────┘  └────────────────────┘
        one manifest  ·  three chains  ·  every cycle  ·  no human
```

---

## 🌐 Multi-Chain Anchoring

The same Walrus manifest is anchored natively on three chains every cycle — one engine, three
on-chain registries, fully verifiable.

| Chain | Role | Status |
|-------|------|--------|
| **Sui** (via Tatum RPC) | Move `signal_vault` — content-addressed proof + `SignalPublished` events | ✅ live + verified |
| **Mantle Sepolia** | `SignalVault.sol` — EVM registry for AI trading signals | ✅ live + verified |
| **Somnia Shannon** | `SignalVault.sol` — agent-native on-chain anchoring | ✅ live + verified |

Meaningful Walrus storage (signal source + backtest evidence, not decoration), Tatum Sui RPC for
reads/anchoring, and the same autonomous engine anchoring natively on each chain.

---

## 🛠️ Deployment Information

### Live EVM contracts (`SignalVault.sol`, Solidity 0.8.24)

| Network | Chain ID | Contract | RPC |
|---------|----------|----------|-----|
| Mantle Sepolia | 5003 | `0xD6786AD160648A4C7e232e77394A5FEa2a37Cf14` | `https://rpc.sepolia.mantle.xyz` |
| Somnia Shannon | 50312 | `0xf61CBfe72aA03a12A64122b0aDA0B19CE57ad80D` | `https://dream-rpc.somnia.network` |

### Sui (Move `signal_vault`)

| Item | Value |
|------|-------|
| Package | `0x0e4326568fb219c65f63457849c9878f06ac1c7f8f0c44795d0dc78e18565b87` |
| RPC | `https://sui-testnet.gateway.tatum.io` (Tatum) |

---

## 💻 Quick Start

```bash
# 1. Clone
git clone https://github.com/Venkat5599/AuditFlow.git
cd AuditFlow

# 2. Configure (LLM key required; chain keys optional)
cp agent/.env.example agent/.env
cp .env.vault.example .env          # TATUM_API_KEY for Sui reads/anchoring

# 3. Run the full stack (API + agent)
docker compose up -d                # API on :8899, serves the built frontend

# 4. (optional) Frontend dev server
docker compose --profile frontend up -d   # Vite on :5899
```

### Run the autonomous 24/7 worker

```bash
# In agent/.env:
#   VIBE_AUTO_PROMPT=Backtest a MACD+RSI crossover strategy on BTC-USDT 1h over 90 days...
#   VIBE_AUTO_PUBLISH_VAULT=1
#   VIBE_EVM_TARGETS=mantle,somnia
#   MANTLE_VAULT_ADDRESS=0x...   SOMNIA_VAULT_ADDRESS=0x...   EVM_PRIVATE_KEY=0x...
docker compose up -d worker
```

Every cycle the worker backtests, stores on Walrus, and anchors on every configured chain.

### Deploy the EVM contract yourself

```bash
cd evm/signal_vault
forge create src/SignalVault.sol:SignalVault \
  --rpc-url https://rpc.sepolia.mantle.xyz \
  --private-key 0x<KEY> --broadcast --legacy
```

---

## 🛠️ Tech Stack

- **Agent:** Python, LangChain, FastAPI, SSE streaming
- **Frontend:** React, Vite, TailwindCSS, Clerk auth
- **Storage:** Walrus decentralized blobs (content-addressed + SHA-256)
- **Chains:** Sui (Move, via Tatum RPC), Mantle & Somnia (Solidity, web3.py)
- **Infra:** Docker Compose, Caddy (auto-HTTPS), single-VPS deploy

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| **Live App** | https://ten-ki.live |
| **Walrus manifest** | https://aggregator.walrus-testnet.walrus.space/v1/blobs/bTw4KKMbfl_NDDq5N41Huc_NO5S8RKoM6B3Cap3WBbU |
| **Sui SignalEntry** | https://suiscan.xyz/testnet/object/0x758465055fc675598d72d255882521d0f26b0e2836f4f215407cbd7e5290f518 |
| **Mantle contract** | https://explorer.sepolia.mantle.xyz/address/0xD6786AD160648A4C7e232e77394A5FEa2a37Cf14 |
| **Somnia contract** | https://shannon-explorer.somnia.network/address/0xf61CBfe72aA03a12A64122b0aDA0B19CE57ad80D |

---

<div align="center">

## One autonomous agent. Three chains. Tamper-evident proof.

**Sui · Mantle · Somnia**

</div>
