"""EVM SignalVault client: publish + read on Mantle / Somnia (or any EVM chain).

Uses web3.py to build, sign, and send a ``publishSignal`` transaction to the
``SignalVault`` Solidity contract, then parses the ``SignalPublished`` event for
the new entry id. Reads (count/latest/getEntry) go through the same RPC.

Configuration is per-named-chain via env, so the worker can anchor to several
chains in one cycle. Two chains are seeded by default:

    EVM_PRIVATE_KEY                 hex private key (0x...) shared across chains
    VIBE_EVM_TARGETS                comma list, e.g. "mantle,somnia" (default: both
                                    chains that have a *_VAULT_ADDRESS set)
    MANTLE_RPC_URL / MANTLE_CHAIN_ID / MANTLE_VAULT_ADDRESS
    SOMNIA_RPC_URL / SOMNIA_CHAIN_ID / SOMNIA_VAULT_ADDRESS

Absence of web3, a key, or a contract address makes a target inactive; callers
treat that as "not configured" rather than an error.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

# Minimal ABI: just what we call/read + the discovery event.
SIGNAL_VAULT_ABI: list[dict[str, Any]] = [
    {
        "type": "function",
        "name": "publishSignal",
        "stateMutability": "nonpayable",
        "inputs": [
            {"name": "blobId", "type": "string"},
            {"name": "sha256_", "type": "string"},
            {"name": "size", "type": "uint256"},
        ],
        "outputs": [{"name": "id", "type": "uint256"}],
    },
    {
        "type": "function",
        "name": "count",
        "stateMutability": "view",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256"}],
    },
    {
        "type": "event",
        "name": "SignalPublished",
        "anonymous": False,
        "inputs": [
            {"name": "id", "type": "uint256", "indexed": True},
            {"name": "publisher", "type": "address", "indexed": True},
            {"name": "blobId", "type": "string", "indexed": False},
            {"name": "sha256", "type": "string", "indexed": False},
            {"name": "size", "type": "uint256", "indexed": False},
            {"name": "createdAt", "type": "uint256", "indexed": False},
        ],
    },
]

# Built-in defaults for the two hackathon targets (overridable by env).
_CHAIN_DEFAULTS: dict[str, dict[str, Any]] = {
    "mantle": {"rpc": "https://rpc.sepolia.mantle.xyz", "chain_id": 5003, "symbol": "MNT",
               "explorer": "https://explorer.sepolia.mantle.xyz"},
    "somnia": {"rpc": "https://dream-rpc.somnia.network", "chain_id": 50312, "symbol": "STT",
               "explorer": "https://shannon-explorer.somnia.network"},
}


class EvmVaultError(RuntimeError):
    """Raised on an EVM publish/read failure."""


@dataclass(slots=True)
class EvmChainConfig:
    """Resolved config for one EVM target."""

    name: str
    rpc_url: str
    chain_id: int
    contract_address: str
    explorer: str = ""
    symbol: str = "ETH"

    @property
    def configured(self) -> bool:
        return bool(self.rpc_url and self.chain_id and self.contract_address)


def _chain_config(name: str) -> EvmChainConfig | None:
    """Build an EvmChainConfig for ``name`` from env + built-in defaults."""
    key = name.strip().lower()
    defaults = _CHAIN_DEFAULTS.get(key, {})
    prefix = key.upper()
    rpc = os.getenv(f"{prefix}_RPC_URL", "").strip() or defaults.get("rpc", "")
    chain_id_raw = os.getenv(f"{prefix}_CHAIN_ID", "").strip()
    chain_id = int(chain_id_raw) if chain_id_raw.isdigit() else int(defaults.get("chain_id", 0))
    address = os.getenv(f"{prefix}_VAULT_ADDRESS", "").strip()
    if not (rpc and chain_id and address):
        return None
    return EvmChainConfig(
        name=key,
        rpc_url=rpc,
        chain_id=chain_id,
        contract_address=address,
        explorer=os.getenv(f"{prefix}_EXPLORER", "").strip() or defaults.get("explorer", ""),
        symbol=defaults.get("symbol", "ETH"),
    )


def load_targets_from_env() -> list[EvmChainConfig]:
    """Return the configured EVM targets.

    ``VIBE_EVM_TARGETS`` (comma list) selects which chains to anchor to. When
    unset, every known chain that has a ``*_VAULT_ADDRESS`` is included.
    """
    requested = os.getenv("VIBE_EVM_TARGETS", "").strip()
    names = [n.strip() for n in requested.split(",") if n.strip()] if requested else list(_CHAIN_DEFAULTS)
    configs = [_chain_config(n) for n in names]
    return [c for c in configs if c is not None]


class EvmSignalVault:
    """Publish/read SignalVault entries on a single EVM chain."""

    def __init__(self, config: EvmChainConfig, *, private_key: str | None = None, timeout: float = 60.0) -> None:
        self.config = config
        self._private_key = (private_key or os.getenv("EVM_PRIVATE_KEY", "")).strip()
        self.timeout = timeout

    def _connect(self):
        """Return (w3, account, contract). Raises EvmVaultError if unusable."""
        try:
            from web3 import Web3
            from eth_account import Account
        except ImportError as exc:
            raise EvmVaultError(f"web3 not installed: {exc}") from exc
        if not self._private_key:
            raise EvmVaultError("EVM_PRIVATE_KEY not set")

        w3 = Web3(Web3.HTTPProvider(self.config.rpc_url, request_kwargs={"timeout": self.timeout}))
        # Some L2s (Mantle) are not strictly EIP-1559; legacy gas is safest.
        account = Account.from_key(self._private_key)
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(self.config.contract_address),
            abi=SIGNAL_VAULT_ABI,
        )
        return w3, account, contract

    def publish_signal(self, blob_id: str, sha256: str, size: int) -> dict[str, Any]:
        """Send publishSignal and return tx hash + decoded entry id.

        Returns:
            ``{chain, chain_id, tx_hash, entry_id, explorer_tx, address}``.
        """
        w3, account, contract = self._connect()
        from web3 import Web3

        try:
            nonce = w3.eth.get_transaction_count(account.address)
            gas_price = w3.eth.gas_price
            fn = contract.functions.publishSignal(blob_id, sha256, int(size))
            tx = fn.build_transaction(
                {
                    "from": account.address,
                    "nonce": nonce,
                    "chainId": self.config.chain_id,
                    "gasPrice": gas_price,
                }
            )
            # Estimate gas with headroom; fall back to a safe ceiling.
            try:
                tx["gas"] = int(w3.eth.estimate_gas(tx) * 1.25)
            except Exception:
                tx["gas"] = 500_000

            signed = account.sign_transaction(tx)
            raw = getattr(signed, "raw_transaction", None) or getattr(signed, "rawTransaction")
            tx_hash = w3.eth.send_raw_transaction(raw)
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=self.timeout)
        except EvmVaultError:
            raise
        except Exception as exc:
            raise EvmVaultError(f"{self.config.name} publish failed: {exc}") from exc

        if receipt.get("status") != 1:
            raise EvmVaultError(f"{self.config.name} tx reverted: {Web3.to_hex(tx_hash)}")

        entry_id = self._decode_entry_id(contract, receipt)
        tx_hex = Web3.to_hex(tx_hash)
        return {
            "chain": self.config.name,
            "chain_id": self.config.chain_id,
            "address": self.config.contract_address,
            "tx_hash": tx_hex,
            "entry_id": entry_id,
            "explorer_tx": f"{self.config.explorer}/tx/{tx_hex}" if self.config.explorer else None,
        }

    @staticmethod
    def _decode_entry_id(contract, receipt) -> int | None:
        """Pull the SignalPublished entry id from the receipt logs."""
        try:
            events = contract.events.SignalPublished().process_receipt(receipt)
            if events:
                return int(events[0]["args"]["id"])
        except Exception:
            return None
        return None

    def count(self) -> int:
        """Return the on-chain entry count (proves connectivity)."""
        _w3, _account, contract = self._connect()
        return int(contract.functions.count().call())
