"""Autonomous trading-agent worker loop.

Runs the Vibe-Trading agent headlessly on a fixed interval so strategies keep
running 24/7 without a human at the keyboard. Each cycle:

  1. Honor the kill switch — if ``<runtime_root>/live/HALT`` exists, skip the
     cycle (no agent run, no orders) and keep looping. This reuses the exact
     sentinel the live order tools check, so one ``vibe-trading live halt`` (or
     ``touch`` of the file) instantly stops autonomous trading even mid-run.
  2. Invoke the agent in a subprocess (``vibe-trading run -p <prompt> --json``)
     so a crash, hang, or OOM in one cycle cannot wedge the loop. A per-cycle
     timeout bounds runaway runs.
  3. Optionally publish the produced run directory to the Walrus Signal Vault
     (Sui + Tatum), making each autonomous decision verifiable on-chain.
  4. Append a structured record to ``<runtime_root>/autonomous/cycles.jsonl``
     and refresh ``<runtime_root>/autonomous/heartbeat.json``.

Safety posture: paper mode is the default. Live trading is only reachable when
``VIBE_AUTO_ALLOW_LIVE=1`` AND a connector mandate is already committed — the
worker never commits a mandate or bypasses the order guard itself.

Configuration (all via env):

    VIBE_AUTO_INTERVAL        Seconds between cycle *starts* (default 900).
    VIBE_AUTO_PROMPT          Inline prompt for each cycle.
    VIBE_AUTO_PROMPT_FILE     File whose contents are the prompt (overrides INLINE).
    VIBE_AUTO_MAX_ITER        Agent max iterations per cycle (default 30).
    VIBE_AUTO_CYCLE_TIMEOUT   Hard per-cycle timeout in seconds (default 1200).
    VIBE_AUTO_PUBLISH_VAULT   "1" to publish each run to the Walrus vault.
    VIBE_AUTO_ALLOW_LIVE      "1" to permit live runs (default paper-only).
    VIBE_AUTO_MAX_CYCLES      Stop after N cycles (default 0 = forever; for tests).
"""

from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from src.config.paths import get_runtime_root
from src.live.halt import halt_flag_set, read_halt

_DEFAULT_INTERVAL = 900
_DEFAULT_MAX_ITER = 30
_DEFAULT_CYCLE_TIMEOUT = 1200


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name, "").strip()
    return int(raw) if raw.isdigit() else default


def _env_bool(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


@dataclass(slots=True)
class WorkerConfig:
    """Resolved worker configuration."""

    interval: int = _DEFAULT_INTERVAL
    prompt: str = ""
    max_iter: int = _DEFAULT_MAX_ITER
    cycle_timeout: int = _DEFAULT_CYCLE_TIMEOUT
    publish_vault: bool = False
    allow_live: bool = False
    max_cycles: int = 0  # 0 = run forever

    @classmethod
    def from_env(cls) -> "WorkerConfig":
        """Build config from environment variables."""
        prompt = os.getenv("VIBE_AUTO_PROMPT", "").strip()
        prompt_file = os.getenv("VIBE_AUTO_PROMPT_FILE", "").strip()
        if prompt_file:
            p = Path(prompt_file)
            if p.is_file():
                prompt = p.read_text(encoding="utf-8").strip()
        return cls(
            interval=_env_int("VIBE_AUTO_INTERVAL", _DEFAULT_INTERVAL),
            prompt=prompt,
            max_iter=_env_int("VIBE_AUTO_MAX_ITER", _DEFAULT_MAX_ITER),
            cycle_timeout=_env_int("VIBE_AUTO_CYCLE_TIMEOUT", _DEFAULT_CYCLE_TIMEOUT),
            publish_vault=_env_bool("VIBE_AUTO_PUBLISH_VAULT"),
            allow_live=_env_bool("VIBE_AUTO_ALLOW_LIVE"),
            max_cycles=_env_int("VIBE_AUTO_MAX_CYCLES", 0),
        )


class AutonomousWorker:
    """Recurring headless agent runner with kill-switch + vault publishing."""

    def __init__(self, config: WorkerConfig | None = None) -> None:
        self.config = config or WorkerConfig.from_env()
        self._stop = False
        self._cycle = 0
        self.state_dir = get_runtime_root() / "autonomous"
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.cycles_log = self.state_dir / "cycles.jsonl"
        self.heartbeat = self.state_dir / "heartbeat.json"

    # -- lifecycle ---------------------------------------------------------

    def install_signal_handlers(self) -> None:
        """Stop cleanly on SIGTERM/SIGINT (so ``docker stop`` is graceful)."""

        def _handler(signum: int, _frame: Any) -> None:
            self._log_event("signal", {"signum": signum})
            self._stop = True

        for sig in (signal.SIGTERM, signal.SIGINT):
            try:
                signal.signal(sig, _handler)
            except (ValueError, OSError):
                pass  # not in main thread (e.g. tests); non-fatal.

    def run(self) -> int:
        """Run the worker loop until stopped. Returns a process exit code."""
        if not self.config.prompt:
            self._log_event(
                "fatal",
                {"error": "No prompt configured. Set VIBE_AUTO_PROMPT or VIBE_AUTO_PROMPT_FILE."},
            )
            return 2

        self.install_signal_handlers()
        self._log_event(
            "start",
            {
                "interval": self.config.interval,
                "max_iter": self.config.max_iter,
                "publish_vault": self.config.publish_vault,
                "allow_live": self.config.allow_live,
                "mode": "live" if self.config.allow_live else "paper",
            },
        )

        while not self._stop:
            cycle_start = time.monotonic()
            self._cycle += 1
            self._run_one_cycle()

            if self.config.max_cycles and self._cycle >= self.config.max_cycles:
                self._log_event("stop", {"reason": "max_cycles reached", "cycles": self._cycle})
                break

            # Sleep the remainder of the interval, waking early on stop.
            self._sleep_until_next(cycle_start)

        self._log_event("stop", {"reason": "signalled" if self._stop else "loop_end", "cycles": self._cycle})
        return 0

    # -- one cycle ---------------------------------------------------------

    def _run_one_cycle(self) -> None:
        """Execute a single agent cycle, honoring the kill switch."""
        if halt_flag_set():
            info = read_halt() or {}
            self._write_heartbeat(state="halted")
            self._log_event("halted", {"cycle": self._cycle, "halt": info})
            return

        self._write_heartbeat(state="running")
        started = _utc_now_iso()
        result = self._invoke_agent()
        record = {
            "cycle": self._cycle,
            "started_at": started,
            "finished_at": _utc_now_iso(),
            "status": result.get("status"),
            "run_id": result.get("run_id"),
            "run_dir": result.get("run_dir"),
        }

        if self.config.publish_vault and result.get("run_dir"):
            record["vault"] = self._publish_to_vault(result["run_dir"])

        self._log_event("cycle", record)
        self._write_heartbeat(state="idle", last=record)

    def _invoke_agent(self) -> dict[str, Any]:
        """Run the agent headlessly in a subprocess, return its JSON result."""
        cmd = [
            sys.executable,
            "-m",
            "cli",
            "run",
            "-p",
            self.config.prompt,
            "--json",
            "--max-iter",
            str(self.config.max_iter),
        ]
        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.config.cycle_timeout,
                cwd=str(Path(__file__).resolve().parents[2]),  # agent/ dir holds the cli package
            )
        except subprocess.TimeoutExpired:
            return {"status": "timeout", "error": f"cycle exceeded {self.config.cycle_timeout}s"}
        except OSError as exc:
            return {"status": "error", "error": f"failed to launch agent: {exc}"}

        return self._parse_agent_output(proc.stdout, proc.stderr, proc.returncode)

    @staticmethod
    def _parse_agent_output(stdout: str, stderr: str, returncode: int) -> dict[str, Any]:
        """Pull the JSON result object from agent stdout (last JSON line wins)."""
        for line in reversed(stdout.strip().splitlines()):
            line = line.strip()
            if line.startswith("{") and line.endswith("}"):
                try:
                    return json.loads(line)
                except ValueError:
                    continue
        return {
            "status": "error" if returncode else "unknown",
            "error": (stderr or stdout)[-500:].strip() or "no JSON result emitted",
        }

    def _publish_to_vault(self, run_dir: str) -> dict[str, Any]:
        """Publish a completed run directory to the Walrus Signal Vault."""
        try:
            from src.integrations.vault import SignalVault

            entry = SignalVault().publish_run(run_dir, register_on_chain=True)
            return {
                "ok": True,
                "manifest_blob_id": entry.manifest_blob_id,
                "on_chain": bool(entry.sui_tx_digest),
                "sui_object_id": entry.sui_object_id,
            }
        except Exception as exc:  # vault is best-effort; never kill the loop.
            return {"ok": False, "error": f"{type(exc).__name__}: {exc}"}

    # -- timing / state ----------------------------------------------------

    def _sleep_until_next(self, cycle_start: float) -> None:
        """Sleep until the next interval boundary, in short waking steps."""
        deadline = cycle_start + self.config.interval
        while not self._stop and time.monotonic() < deadline:
            time.sleep(min(2.0, max(0.0, deadline - time.monotonic())))

    def _write_heartbeat(self, *, state: str, last: dict[str, Any] | None = None) -> None:
        payload = {
            "updated_at": _utc_now_iso(),
            "state": state,
            "cycle": self._cycle,
            "pid": os.getpid(),
            "mode": "live" if self.config.allow_live else "paper",
        }
        if last is not None:
            payload["last_cycle"] = last
        try:
            self.heartbeat.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        except OSError:
            pass

    def _log_event(self, event: str, data: dict[str, Any]) -> None:
        line = json.dumps({"ts": _utc_now_iso(), "event": event, **data}, ensure_ascii=False)
        try:
            with self.cycles_log.open("a", encoding="utf-8") as fh:
                fh.write(line + "\n")
                fh.flush()
                os.fsync(fh.fileno())
        except OSError:
            pass
        # Also surface to stdout for container logs.
        print(f"[autonomous] {line}", flush=True)


def main(argv: list[str] | None = None) -> int:
    """Console entrypoint: ``vibe-trading-worker``."""
    return AutonomousWorker(WorkerConfig.from_env()).run()


if __name__ == "__main__":
    raise SystemExit(main())
