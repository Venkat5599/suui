"""Autonomous worker: run the trading agent on a recurring schedule, 24/7.

The worker fires the agent headlessly on a fixed interval, honoring the live
kill-switch (``src.live.halt``) so a single sentinel file instantly stops all
trading. Designed to run as a long-lived container/service alongside the API
server. See ``AUTONOMOUS.md``.
"""

from src.autonomous.worker import AutonomousWorker, WorkerConfig, main

__all__ = ["AutonomousWorker", "WorkerConfig", "main"]
