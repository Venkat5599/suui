"""Signal Vault: anchor trust-layer artifacts to Walrus + Sui.

A *vault entry* binds a Vibe-Trading artifact (a backtest run card and, when
present, the LLM-generated signal-engine source) to:

  1. Walrus blobs — the actual content, stored on decentralized storage.
  2. A manifest blob — a small JSON index of those blobs + their SHA-256s.
  3. An optional on-chain record on Sui (via the ``signal_vault`` Move package),
     submitted through the Tatum RPC gateway, that pins the manifest ``blobId``
     and its content hash so anyone can verify the artifact has not been altered.

The Sui write requires a funded keypair and the optional ``pysui`` dependency.
When either is missing, :meth:`SignalVault.publish` still stores everything on
Walrus and returns the exact Move-call arguments needed to register on-chain
later — so the pipeline is useful with or without signing keys.
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from src.integrations.sui.tatum_rpc import TatumSuiClient
from src.integrations.walrus.client import WalrusBlob, WalrusClient

MANIFEST_SCHEMA = "vibe-signal-vault/1"


@dataclass(slots=True)
class VaultArtifact:
    """One stored file within a vault entry."""

    role: str  # "run_card" | "strategy_source" | "metrics" | "extra"
    filename: str
    blob: WalrusBlob

    def to_dict(self) -> dict[str, Any]:
        return {"role": self.role, "filename": self.filename, **self.blob.to_dict()}


@dataclass(slots=True)
class VaultEntry:
    """A published vault entry: artifacts + manifest + optional on-chain proof."""

    manifest_blob_id: str
    manifest_sha256: str
    artifacts: list[VaultArtifact] = field(default_factory=list)
    network: str = "testnet"
    sui_tx_digest: str | None = None
    sui_object_id: str | None = None
    move_call: dict[str, Any] | None = None
    evm: list[dict[str, Any]] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": MANIFEST_SCHEMA,
            "manifest_blob_id": self.manifest_blob_id,
            "manifest_sha256": self.manifest_sha256,
            "network": self.network,
            "artifacts": [a.to_dict() for a in self.artifacts],
            "sui_tx_digest": self.sui_tx_digest,
            "sui_object_id": self.sui_object_id,
            "move_call": self.move_call,
            "evm": self.evm,
            "created_at": self.created_at,
        }


# Artifact filenames we look for inside a backtest run directory, in priority
# order, mapped to their manifest role.
_RUN_DIR_ARTIFACTS: tuple[tuple[str, str], ...] = (
    ("run_card.json", "run_card"),
    ("run_card.md", "run_card_md"),
    ("metrics.json", "metrics"),
    ("strategy.py", "strategy_source"),
)


class SignalVault:
    """Publish / fetch / verify Vibe-Trading artifacts on Walrus + Sui.

    Args:
        walrus: Configured Walrus client (created from env if omitted).
        sui: Configured Tatum Sui client (created from env if omitted).
        package_id: Deployed ``signal_vault`` Move package id (``SUI_VAULT_PACKAGE``).
        network: Network label recorded in the manifest.
    """

    def __init__(
        self,
        *,
        walrus: WalrusClient | None = None,
        sui: TatumSuiClient | None = None,
        package_id: str | None = None,
        network: str | None = None,
    ) -> None:
        self.network = (network or os.getenv("SUI_NETWORK", "testnet")).strip().lower()
        self.walrus = walrus or WalrusClient(network=self.network)
        self.sui = sui or TatumSuiClient(network=self.network)
        self.package_id = (package_id or os.getenv("SUI_VAULT_PACKAGE", "")).strip()

    # -- publish -----------------------------------------------------------

    def publish_run(self, run_dir: str | Path, *, register_on_chain: bool = True) -> VaultEntry:
        """Publish all known artifacts in a backtest run directory.

        Args:
            run_dir: Directory produced by a backtest run (holds run_card.json etc.).
            register_on_chain: Attempt the Sui Move call when signing is available.

        Returns:
            A populated :class:`VaultEntry`.

        Raises:
            FileNotFoundError: If ``run_dir`` has no recognizable artifacts.
        """
        run_path = Path(run_dir)
        artifacts: list[VaultArtifact] = []
        for filename, role in _RUN_DIR_ARTIFACTS:
            fpath = run_path / filename
            if fpath.is_file():
                blob = self.walrus.store_bytes(fpath.read_bytes())
                artifacts.append(VaultArtifact(role=role, filename=filename, blob=blob))

        if not artifacts:
            raise FileNotFoundError(
                f"No vault artifacts found in {run_path}. "
                f"Expected one of: {[f for f, _ in _RUN_DIR_ARTIFACTS]}"
            )
        return self._finalize(artifacts, register_on_chain=register_on_chain)

    def publish_files(
        self,
        files: dict[str, str | Path],
        *,
        register_on_chain: bool = True,
    ) -> VaultEntry:
        """Publish an explicit ``role -> path`` mapping of files."""
        artifacts: list[VaultArtifact] = []
        for role, path in files.items():
            p = Path(path)
            if not p.is_file():
                raise FileNotFoundError(f"Vault artifact not found: {p}")
            blob = self.walrus.store_bytes(p.read_bytes())
            artifacts.append(VaultArtifact(role=role, filename=p.name, blob=blob))
        return self._finalize(artifacts, register_on_chain=register_on_chain)

    def _finalize(self, artifacts: list[VaultArtifact], *, register_on_chain: bool) -> VaultEntry:
        """Store the manifest blob and (optionally) register it on Sui."""
        manifest = {
            "schema": MANIFEST_SCHEMA,
            "network": self.network,
            "created_at": time.time(),
            "artifacts": [a.to_dict() for a in artifacts],
        }
        manifest_bytes = json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode("utf-8")
        manifest_blob = self.walrus.store_bytes(manifest_bytes)

        entry = VaultEntry(
            manifest_blob_id=manifest_blob.blob_id,
            manifest_sha256=manifest_blob.sha256,
            artifacts=artifacts,
            network=self.network,
        )
        # Always provide the Move-call descriptor so the on-chain step is
        # reproducible by hand even when we cannot sign here.
        entry.move_call = self._build_move_call(manifest_blob)

        if register_on_chain:
            try:
                proof = self._register_on_chain(manifest_blob)
                if proof:
                    entry.sui_tx_digest = proof.get("digest")
                    entry.sui_object_id = proof.get("object_id")
            except _SigningUnavailable:
                pass  # Walrus-only mode; move_call already populated.
            # Anchor the same manifest on any configured EVM chains (Mantle/Somnia).
            entry.evm = self._register_evm(manifest_blob)
        return entry

    def _register_evm(self, manifest_blob: WalrusBlob) -> list[dict[str, Any]]:
        """Anchor the manifest on every configured EVM target. Best-effort."""
        try:
            from src.integrations.evm import EvmSignalVault, EvmVaultError, load_targets_from_env
        except ImportError:
            return []
        results: list[dict[str, Any]] = []
        for cfg in load_targets_from_env():
            try:
                res = EvmSignalVault(cfg).publish_signal(
                    manifest_blob.blob_id, manifest_blob.sha256, manifest_blob.size
                )
                res["ok"] = True
                results.append(res)
            except EvmVaultError as exc:
                results.append({"ok": False, "chain": cfg.name, "error": str(exc)})
        return results

    def _build_move_call(self, manifest_blob: WalrusBlob) -> dict[str, Any]:
        """Describe the ``signal_vault::publish_signal`` call for this manifest."""
        return {
            "package": self.package_id or "<SUI_VAULT_PACKAGE unset>",
            "module": "signal_vault",
            "function": "publish_signal",
            "type_arguments": [],
            "arguments": [
                manifest_blob.blob_id,
                manifest_blob.sha256,
                str(manifest_blob.size),
                "0x6",  # shared Clock object
            ],
            "cli_hint": (
                f"sui client call --package {self.package_id or '<PKG>'} "
                f"--module signal_vault --function publish_signal "
                f"--args '{manifest_blob.blob_id}' '{manifest_blob.sha256}' "
                f"{manifest_blob.size} 0x6 --gas-budget 10000000"
            ),
        }

    def _register_on_chain(self, manifest_blob: WalrusBlob) -> dict[str, Any] | None:
        """Build, sign, and submit the publish_signal tx via Tatum RPC.

        Requires ``pysui`` and ``SUI_PRIVATE_KEY``/keystore + ``SUI_VAULT_PACKAGE``.
        Raises :class:`_SigningUnavailable` when prerequisites are missing so the
        caller can fall back to Walrus-only publishing.
        """
        if not self.package_id:
            raise _SigningUnavailable("SUI_VAULT_PACKAGE not set")
        try:
            from src.integrations.sui_signer import submit_publish_signal  # lazy, optional
        except ImportError as exc:
            raise _SigningUnavailable(f"signer unavailable: {exc}") from exc
        return submit_publish_signal(
            sui=self.sui,
            package_id=self.package_id,
            blob_id=manifest_blob.blob_id,
            sha256=manifest_blob.sha256,
            size=manifest_blob.size,
        )

    # -- fetch / verify ----------------------------------------------------

    def fetch_manifest(self, manifest_blob_id: str) -> dict[str, Any]:
        """Read and parse a manifest blob from Walrus."""
        return json.loads(self.walrus.read_text(manifest_blob_id))

    def verify(self, manifest_blob_id: str, *, expected_sha256: str | None = None) -> dict[str, Any]:
        """Verify a published vault entry's integrity end-to-end.

        Checks that the manifest blob hashes to ``expected_sha256`` (when given)
        and that every referenced artifact blob still hashes to its recorded
        SHA-256 on Walrus.

        Returns:
            A report dict: ``{ok, manifest_ok, artifacts: [{role, blob_id, ok}], ...}``.
        """
        manifest_bytes = self.walrus.read_bytes(manifest_blob_id)
        import hashlib

        manifest_sha = hashlib.sha256(manifest_bytes).hexdigest()
        manifest_ok = expected_sha256 is None or manifest_sha == expected_sha256

        manifest = json.loads(manifest_bytes.decode("utf-8"))
        results: list[dict[str, Any]] = []
        for art in manifest.get("artifacts", []):
            ok = self.walrus.verify(art["blob_id"], art["sha256"])
            results.append({"role": art.get("role"), "blob_id": art["blob_id"], "ok": ok})

        all_ok = manifest_ok and all(r["ok"] for r in results)
        return {
            "ok": all_ok,
            "manifest_ok": manifest_ok,
            "manifest_sha256": manifest_sha,
            "artifacts": results,
        }

    def verify_on_chain(self, object_id: str) -> dict[str, Any]:
        """Read a published vault object from Sui and return its fields.

        Cross-checks the on-chain ``blob_id``/``sha256`` against the live Walrus
        manifest, proving the chain record and storage agree.
        """
        obj = self.sui.get_object(object_id)
        content = (obj.get("data") or {}).get("content") or {}
        fields = content.get("fields", {})
        blob_id = fields.get("blob_id")
        on_chain_sha = fields.get("sha256")
        report: dict[str, Any] = {"object_id": object_id, "fields": fields}
        if blob_id:
            report["walrus"] = self.verify(blob_id, expected_sha256=on_chain_sha)
        return report


class _SigningUnavailable(RuntimeError):
    """Internal: raised when on-chain signing prerequisites are missing."""
