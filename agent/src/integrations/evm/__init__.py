"""EVM (Mantle, Somnia) anchoring for the Signal Vault.

EVM counterpart of the Sui integration: publishes the same Walrus manifest blob
id + SHA-256 + size to a ``SignalVault`` Solidity contract on one or more
EVM chains. Chain-agnostic — configured per chain via env (see ``vault_evm``).
"""

from src.integrations.evm.client import (
    EvmChainConfig,
    EvmSignalVault,
    EvmVaultError,
    load_targets_from_env,
)

__all__ = [
    "EvmChainConfig",
    "EvmSignalVault",
    "EvmVaultError",
    "load_targets_from_env",
]
