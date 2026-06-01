"""Optional on-chain signer for vault registration via the Sui CLI.

Isolated so the rest of the integration works without a signing path. The
worker container mounts the host ``sui`` binary (read-only) plus the wallet
config; this module shells out to ``sui client call`` to create a
``SignalEntry`` on-chain. Using the CLI keeps signing deterministic and avoids
SDK version drift.

Prerequisites (all optional — absence triggers Walrus-only fallback):
  - ``sui`` binary on PATH or at ``SUI_CLI_BIN``
  - wallet config at ``SUI_CLIENT_CONFIG`` (or the default ~/.sui location)
  - ``SUI_VAULT_PACKAGE`` set to the deployed package id

Raises ``ImportError`` when the CLI is unavailable so
:mod:`src.integrations.vault` falls back to Walrus-only publishing.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from typing import Any

from src.integrations.sui.tatum_rpc import TatumSuiClient

# 0x6 is the shared Clock object required by publish_signal's `&Clock` arg.
_CLOCK_OBJECT = "0x6"
_GAS_BUDGET = "100000000"
_CALL_TIMEOUT = 120


def _resolve_cli() -> str:
    """Return the sui CLI path, or raise ImportError if not found."""
    candidate = os.getenv("SUI_CLI_BIN", "sui").strip() or "sui"
    found = shutil.which(candidate) or (candidate if os.path.exists(candidate) else None)
    if not found:
        raise ImportError(f"sui CLI not found ({candidate}); on-chain signing unavailable")
    return found


def submit_publish_signal(
    *,
    sui: TatumSuiClient,  # kept for signature compatibility; reads stay on Tatum
    package_id: str,
    blob_id: str,
    sha256: str,
    size: int,
) -> dict[str, Any]:
    """Create a SignalEntry on-chain via ``sui client call``.

    Args:
        sui: Tatum client (unused here; app reads/verify still route via Tatum).
        package_id: Deployed ``signal_vault`` package id.
        blob_id: Walrus manifest blob id to pin on-chain.
        sha256: Hex SHA-256 of the manifest content.
        size: Manifest byte size.

    Returns:
        ``{"digest": ..., "object_id": ...}`` for the created SignalEntry.

    Raises:
        ImportError: sui CLI unavailable (caller falls back to Walrus-only).
        RuntimeError: On a failed transaction.
    """
    cli = _resolve_cli()
    cmd = [cli, "client"]
    config = os.getenv("SUI_CLIENT_CONFIG", "").strip()
    if config:
        cmd += ["--client.config", config]
    cmd += [
        "call",
        "--package", package_id,
        "--module", "signal_vault",
        "--function", "publish_signal",
        "--args", blob_id, sha256, str(int(size)), _CLOCK_OBJECT,
        "--gas-budget", _GAS_BUDGET,
        "--json",
    ]

    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=_CALL_TIMEOUT)
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise RuntimeError(f"sui client call failed to run: {exc}") from exc

    if proc.returncode != 0:
        raise RuntimeError(f"sui client call returned {proc.returncode}: {(proc.stderr or proc.stdout)[-400:]}")

    try:
        data = json.loads(proc.stdout)
    except ValueError as exc:
        raise RuntimeError(f"sui client call produced non-JSON: {proc.stdout[-300:]}") from exc

    digest = data.get("digest") or (data.get("effects") or {}).get("transactionDigest")
    return {"digest": digest, "object_id": _extract_signal_entry(data, package_id)}


def _extract_signal_entry(data: dict[str, Any], package_id: str) -> str | None:
    """Pull the created SignalEntry object id from tx objectChanges."""
    short_pkg = package_id[2:] if package_id.startswith("0x") else package_id
    for change in data.get("objectChanges", []) or []:
        if change.get("type") != "created":
            continue
        obj_type = change.get("objectType", "")
        if "signal_vault::SignalEntry" in obj_type and short_pkg in obj_type.replace("0x", ""):
            return change.get("objectId")
    # Fallback: first created object that isn't a coin/UpgradeCap.
    for change in data.get("objectChanges", []) or []:
        if change.get("type") == "created" and "SignalEntry" in change.get("objectType", ""):
            return change.get("objectId")
    return None
