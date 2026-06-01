# Running the trading agent 24/7

The autonomous worker (`vibe-trading-worker`) runs the agent headlessly on a
fixed interval so strategies keep executing without a human at the keyboard.
It's a long-lived service — run it on an always-on host (your VM) via Docker.

## How it works

Each cycle the worker:

1. **Checks the kill switch.** If `<runtime_root>/live/HALT` exists, the cycle
   is skipped entirely — no agent run, no orders — and the loop keeps ticking.
   This is the *same* sentinel the live order tools check, so one halt stops
   autonomous trading instantly, even mid-run.
2. **Runs the agent in a subprocess** (`vibe-trading run -p <prompt> --json`),
   bounded by a per-cycle timeout so a hung run can't wedge the loop.
3. **Optionally publishes** the run to the Walrus Signal Vault (Sui + Tatum),
   making each autonomous decision verifiable on-chain.
4. **Logs** a structured record to `<runtime_root>/autonomous/cycles.jsonl` and
   refreshes `<runtime_root>/autonomous/heartbeat.json`.

`runtime_root` defaults to `~/.vibe-trading` (inside the container:
`/home/vibe/.vibe-trading`, mounted as the shared `vibe-runtime` volume).

## Safety

- **Paper by default.** Live trading requires `VIBE_AUTO_ALLOW_LIVE=1` *and* an
  already-committed connector mandate. The worker never commits a mandate,
  never bypasses the order guard, and never clears a halt.
- **Instant stop:** `docker compose exec vibe-trading vibe-trading live halt`
  (or `touch /home/vibe/.vibe-trading/live/HALT`) halts the next cycle.
- **Graceful shutdown:** `docker compose stop worker` sends SIGTERM; the worker
  finishes its sleep and exits cleanly.

## Configure

Set these in `agent/.env` (or the shell that runs compose):

| Var | Default | Meaning |
|-----|---------|---------|
| `VIBE_AUTO_PROMPT` | — | Inline prompt run every cycle |
| `VIBE_AUTO_PROMPT_FILE` | — | File whose contents are the prompt (overrides inline) |
| `VIBE_AUTO_INTERVAL` | `900` | Seconds between cycle starts |
| `VIBE_AUTO_MAX_ITER` | `30` | Agent max iterations per cycle |
| `VIBE_AUTO_CYCLE_TIMEOUT` | `1200` | Hard per-cycle timeout (s) |
| `VIBE_AUTO_PUBLISH_VAULT` | `0` | `1` → publish each run to Walrus/Sui vault |
| `VIBE_AUTO_ALLOW_LIVE` | `0` | `1` → permit live runs (paper otherwise) |

Example `.env`:

```
VIBE_AUTO_PROMPT=Scan BTC/USDT and ETH/USDT 1h. If my MACD+RSI strategy signals, paper-trade it and report.
VIBE_AUTO_INTERVAL=900
VIBE_AUTO_PUBLISH_VAULT=1
```

## Run it on the VM

```bash
git clone https://github.com/Venkat5599/suui.git && cd suui
cp .env.vault.example agent/.env   # add LLM key + TATUM_API_KEY + the VIBE_AUTO_* vars

# Build once, then run API + worker 24/7 (auto-restart on crash/reboot)
docker compose up -d --build vibe-trading worker

# Watch the loop
docker compose logs -f worker

# Stop / resume autonomous trading without killing the container:
docker compose exec vibe-trading vibe-trading live halt
docker compose exec vibe-trading vibe-trading live resume
```

`restart: unless-stopped` brings both services back after a crash or VM reboot,
so "24/7" survives the host restarting. For reboot persistence ensure the
Docker daemon is enabled at boot (`sudo systemctl enable docker`).

## Observe

```bash
# last cycle + worker state
docker compose exec worker cat /home/vibe/.vibe-trading/autonomous/heartbeat.json
# full cycle history
docker compose exec worker cat /home/vibe/.vibe-trading/autonomous/cycles.jsonl
```
