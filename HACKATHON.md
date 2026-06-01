# Vibe-Trading × Sui + Walrus — Signal Vault

Submission for **Tatum × Build on Sui with Walrus** (deadline **June 6, 17:00 UTC**).

## ✅ Live deployment (Sui testnet, via Tatum RPC)

The integration is **deployed and running autonomously 24/7**. A worker runs a
backtest on a schedule, publishes the run card to Walrus, and pins a
`SignalEntry` on Sui — every cycle, no human in the loop.

| Artifact | Value |
|----------|-------|
| `signal_vault` package | `0x0e4326568fb219c65f63457849c9878f06ac1c7f8f0c44795d0dc78e18565b87` |
| Example `SignalEntry` (auto-created by the worker) | `0x5f5abc083997479f8f64681652bef4410ef82b7e7726825275cea387b6c73897` |
| Walrus manifest blob | `gtzCAD5kneL5NhzHXG9W0O3Vh0EN6SzGMWiXlHQxS4Q` |
| Publisher wallet | `0x52f8614201a72767b03314be8a5d4911d549485f684140d42ddc2339cd4992e6` |
| RPC | `https://sui-testnet.gateway.tatum.io` (Tatum) |

Verify it yourself (reads route through Tatum):

```bash
# On-chain SignalEntry — its blob_id + sha256 match the Walrus manifest
curl -s -X POST https://sui-testnet.gateway.tatum.io \
  -H "Content-Type: application/json" -H "x-api-key: <YOUR_TATUM_KEY>" \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getObject","params":["0x5f5abc083997479f8f64681652bef4410ef82b7e7726825275cea387b6c73897",{"showContent":true}]}'

# The Walrus manifest blob it points to
curl -s https://aggregator.walrus-testnet.walrus.space/v1/blobs/gtzCAD5kneL5NhzHXG9W0O3Vh0EN6SzGMWiXlHQxS4Q
```

On SuiScan: https://suiscan.xyz/testnet/object/0x5f5abc083997479f8f64681652bef4410ef82b7e7726825275cea387b6c73897

## What it does

Vibe-Trading is an AI trading agent that generates signal engines and runs
backtests, producing a *trust-layer run card* for every run. This integration
makes those artifacts **decentralized, portable, and tamper-evident**:

1. **Walrus** stores the actual bytes — the backtest `run_card.json`, metrics,
   and the LLM-generated `strategy.py` source — as content-addressed blobs.
2. A small **manifest** blob indexes those blobs with their SHA-256 hashes.
3. **Sui** (reached through **Tatum's RPC gateway**) holds an on-chain
   `SignalEntry` object that pins the manifest's `blobId` + hash + size, owned
   by the publisher and discoverable via an emitted `SignalPublished` event.

Result: anyone can fetch a strategy/backtest from any Walrus aggregator and
prove — against the Sui record — that it is exactly what the author published.
Signals become shareable and tradeable on-chain without trusting a server.

## Why it's a meaningful integration (judging fit)

- **Walrus (30%)** — stores real, valuable app data (signal source + backtest
  evidence), not a token decoration. Content addressing + co-recorded SHA-256
  gives independent integrity.
- **Tatum (30%)** — all Sui RPC (chain identity, object reads, event queries,
  transaction submission) routes through `*.gateway.tatum.io`.
- **Technical quality (30%)** — dependency-light clients (httpx only for
  reads/storage), graceful degradation to Walrus-only when no signing key,
  end-to-end verification path.

## Architecture

```
agent/src/integrations/
  sui/tatum_rpc.py    TatumSuiClient — Sui JSON-RPC over Tatum gateway
  walrus/client.py    WalrusClient   — publisher PUT / aggregator GET + SHA-256
  vault.py            SignalVault     — publish / fetch / verify orchestration
  sui_signer.py       optional pysui signer (executes tx via Tatum endpoint)
agent/src/tools/walrus_vault_tool.py   agent + MCP tool: publish|fetch|verify|status
sui/signal_vault/                       Move package: SignalEntry + publish_signal
```

## Quick start

```bash
# 1. Install (Sui signing is optional)
pip install -e .          # core: Walrus + Tatum reads work immediately
pip install -e ".[sui]"   # add pysui for on-chain registration

# 2. Configure
cp .env.vault.example .env   # set TATUM_API_KEY (free at dashboard.tatum.io)

# 3. Verify connectivity (read-only, via Tatum)
python -c "import sys; sys.path.insert(0,'agent/src'); \
from src.tools.walrus_vault_tool import WalrusVaultTool; \
print(WalrusVaultTool().execute(action='status', network='mainnet'))"
```

### Agent / MCP usage

The `walrus_vault` tool is auto-registered. Actions:

| action  | args | effect |
|---------|------|--------|
| `status`  | `network?` | Prove Sui connectivity + show endpoints (via Tatum) |
| `publish` | `run_dir`, `register_on_chain?`, `network?` | Store a backtest run on Walrus; pin on Sui if signer available |
| `fetch`   | `manifest_blob_id` \| `blob_id` | Read a manifest / blob back from Walrus |
| `verify`  | `manifest_blob_id`, `expected_sha256?` | Re-hash every blob to confirm integrity |

## Deploy the Move package

```bash
cd sui/signal_vault
sui move build
sui client publish --gas-budget 100000000
# copy the published package id into SUI_VAULT_PACKAGE
```

`publish_signal(blob_id, sha256, size, &Clock)` creates a `SignalEntry`, emits
`SignalPublished`, and transfers the entry to the caller. Read fields back with
the public accessors or `SignalVault.verify_on_chain(object_id)`.

## End-to-end demo flow (for the video)

1. `walrus_vault status` → show live Sui chain id + checkpoint through Tatum.
2. Run any backtest → produces a run directory with `run_card.json`.
3. `walrus_vault publish run_dir=<dir>` → returns Walrus `blob_id`s + manifest.
4. Show the blob on a Walrus aggregator URL; show the `SignalEntry` on SuiScan.
5. `walrus_vault verify manifest_blob_id=<id>` → all blobs hash-match → `ok:true`.
