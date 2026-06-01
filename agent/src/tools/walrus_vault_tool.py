"""Walrus Vault tool: publish / fetch / verify trust-layer artifacts on Sui.

Lets the agent anchor a backtest run card or signal-engine source to Walrus
decentralized storage and pin a tamper-evident pointer on the Sui blockchain
(through Tatum's RPC gateway). Auto-discovered and registered like every other
tool in this package.
"""

from __future__ import annotations

import json
from typing import Any

from src.agent.tools import BaseTool
from src.integrations.vault import SignalVault
from src.integrations.walrus.client import WalrusError
from src.integrations.sui.tatum_rpc import SuiRpcError


class WalrusVaultTool(BaseTool):
    """Store and verify trading artifacts on Walrus + Sui via Tatum RPC."""

    name = "walrus_vault"
    description = (
        "Anchor trust-layer trading artifacts to decentralized storage. "
        "publish: upload a backtest run directory's artifacts to Walrus and pin "
        "a tamper-evident pointer on Sui (via Tatum RPC). "
        "fetch: read a stored manifest or blob back from Walrus by id. "
        "verify: re-hash every stored blob to confirm nothing was altered. "
        "discover: read what is ALREADY published on-chain (Sui events + EVM counts) "
        "so you can judge whether a new signal is novel before publishing. "
        "status: check Sui chain connectivity through the Tatum gateway."
    )
    is_readonly = False
    parameters = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["publish", "fetch", "verify", "discover", "status"],
                "description": "publish | fetch | verify | discover | status",
            },
            "run_dir": {
                "type": "string",
                "description": "Backtest run directory to publish (for action=publish).",
            },
            "manifest_blob_id": {
                "type": "string",
                "description": "Walrus manifest blob id (for fetch/verify).",
            },
            "blob_id": {
                "type": "string",
                "description": "Raw Walrus blob id to read (for fetch).",
            },
            "expected_sha256": {
                "type": "string",
                "description": "Optional manifest SHA-256 to assert during verify.",
            },
            "register_on_chain": {
                "type": "boolean",
                "description": "Attempt the Sui on-chain registration (default true).",
            },
            "network": {
                "type": "string",
                "enum": ["mainnet", "testnet", "devnet"],
                "description": "Override Sui/Walrus network (default from env).",
            },
        },
        "required": ["action"],
    }
    repeatable = True

    def execute(self, **kwargs: Any) -> str:
        action = kwargs.get("action", "")
        network = kwargs.get("network")
        try:
            vault = SignalVault(network=network)
            if action == "publish":
                return self._publish(vault, kwargs)
            if action == "fetch":
                return self._fetch(vault, kwargs)
            if action == "verify":
                return self._verify(vault, kwargs)
            if action == "discover":
                return self._discover(vault, kwargs)
            if action == "status":
                return self._status(vault)
            return json.dumps({"status": "error", "error": f"Unknown action: {action}"})
        except (WalrusError, SuiRpcError, FileNotFoundError) as exc:
            return json.dumps({"status": "error", "error": str(exc)})

    def _publish(self, vault: SignalVault, kwargs: dict) -> str:
        run_dir = kwargs.get("run_dir")
        if not run_dir:
            return json.dumps({"status": "error", "error": "run_dir required for publish"})
        register = kwargs.get("register_on_chain", True)
        entry = vault.publish_run(run_dir, register_on_chain=register)
        result = entry.to_dict()
        result["status"] = "ok"
        result["on_chain"] = bool(entry.sui_tx_digest)
        # Concise multi-chain summary the agent can report back.
        chains: list[str] = []
        if entry.sui_object_id:
            chains.append("sui")
        chains.extend(e["chain"] for e in entry.evm if e.get("ok"))
        result["anchored_chains"] = chains
        if not entry.sui_tx_digest:
            result["note"] = (
                "Stored on Walrus. On-chain registration skipped (no signer/key/package). "
                "Run move_call.cli_hint to pin it on Sui."
            )
        return json.dumps(result, ensure_ascii=False)

    def _fetch(self, vault: SignalVault, kwargs: dict) -> str:
        manifest_id = kwargs.get("manifest_blob_id")
        blob_id = kwargs.get("blob_id")
        if manifest_id:
            manifest = vault.fetch_manifest(manifest_id)
            return json.dumps({"status": "ok", "manifest": manifest}, ensure_ascii=False)
        if blob_id:
            text = vault.walrus.read_text(blob_id)
            return json.dumps({"status": "ok", "blob_id": blob_id, "content": text[:8000]}, ensure_ascii=False)
        return json.dumps({"status": "error", "error": "manifest_blob_id or blob_id required"})

    def _discover(self, vault: SignalVault, kwargs: dict) -> str:
        report = vault.discover(limit=int(kwargs.get("limit", 10)))
        report["status"] = "ok"
        return json.dumps(report, ensure_ascii=False)

    def _verify(self, vault: SignalVault, kwargs: dict) -> str:
        manifest_id = kwargs.get("manifest_blob_id")
        if not manifest_id:
            return json.dumps({"status": "error", "error": "manifest_blob_id required for verify"})
        report = vault.verify(manifest_id, expected_sha256=kwargs.get("expected_sha256"))
        report["status"] = "ok"
        return json.dumps(report, ensure_ascii=False)

    def _status(self, vault: SignalVault) -> str:
        chain_id = vault.sui.get_chain_identifier()
        checkpoint = vault.sui.get_latest_checkpoint_sequence()
        return json.dumps(
            {
                "status": "ok",
                "network": vault.network,
                "rpc_endpoint": vault.sui.endpoint,
                "chain_identifier": chain_id,
                "latest_checkpoint": checkpoint,
                "walrus_publisher": vault.walrus.publisher,
                "walrus_aggregator": vault.walrus.aggregator,
                "vault_package": vault.package_id or "(unset)",
            },
            ensure_ascii=False,
        )
