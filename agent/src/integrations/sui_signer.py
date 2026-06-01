"""Optional Sui transaction signer for on-chain vault registration.

Isolated in its own module so the rest of the integration works without the
heavier ``pysui`` dependency. Importing this module without ``pysui`` installed
raises ``ImportError``, which :mod:`src.integrations.vault` catches to fall back
to Walrus-only publishing.

Submission still flows through the Tatum gateway: pysui builds + signs the
transaction, and the signed bytes are executed via our :class:`TatumSuiClient`
so the RPC traffic stays on Tatum's endpoint (as the hackathon requires).
"""

from __future__ import annotations

import os
from typing import Any

from src.integrations.sui.tatum_rpc import TatumSuiClient


def submit_publish_signal(
    *,
    sui: TatumSuiClient,
    package_id: str,
    blob_id: str,
    sha256: str,
    size: int,
) -> dict[str, Any]:
    """Build, sign, and execute ``signal_vault::publish_signal`` via Tatum RPC.

    Args:
        sui: Tatum Sui client used for gas-object lookup and final execution.
        package_id: Deployed ``signal_vault`` package id.
        blob_id: Walrus manifest blob id to pin on-chain.
        sha256: Hex SHA-256 of the manifest content.
        size: Manifest byte size.

    Returns:
        ``{"digest": ..., "object_id": ...}`` for the created vault entry.

    Raises:
        ImportError: If pysui is not installed (caller falls back).
        RuntimeError: On missing key or execution failure.
    """
    # Imported here so module import fails cleanly when pysui is absent.
    from pysui import SuiConfig, SyncClient  # type: ignore
    from pysui.sui.sui_txn import SyncTransaction  # type: ignore

    private_key = os.getenv("SUI_PRIVATE_KEY", "").strip()
    if not private_key:
        raise RuntimeError("SUI_PRIVATE_KEY not set; cannot sign on-chain registration")

    # Route pysui's RPC at the same Tatum endpoint the rest of the app uses.
    cfg = SuiConfig.user_config(rpc_url=sui.endpoint, prv_keys=[private_key])
    client = SyncClient(cfg)

    # 0x6 is the shared Clock object required by publish_signal's `&Clock` arg.
    txn = SyncTransaction(client=client)
    txn.move_call(
        target=f"{package_id}::signal_vault::publish_signal",
        arguments=[
            txn.pure(blob_id),
            txn.pure(sha256),
            txn.pure(int(size)),
            txn.object("0x6"),
        ],
        type_arguments=[],
    )
    result = txn.execute(gas_budget="10000000")
    if not result.is_ok():
        raise RuntimeError(f"Sui execution failed: {result.result_string}")

    effects = result.result_data
    digest = getattr(effects, "digest", None) or getattr(getattr(effects, "effects", None), "transaction_digest", None)
    object_id = _extract_created_object(effects)
    return {"digest": digest, "object_id": object_id}


def _extract_created_object(effects: Any) -> str | None:
    """Best-effort pull of the newly-created vault object id from tx effects."""
    try:
        changes = getattr(effects, "object_changes", None) or []
        for change in changes:
            change_type = getattr(change, "type", None) or (
                change.get("type") if isinstance(change, dict) else None
            )
            if change_type == "created":
                return getattr(change, "object_id", None) or (
                    change.get("objectId") if isinstance(change, dict) else None
                )
    except Exception:  # effects shape varies across pysui versions; non-fatal.
        return None
    return None
