"""Thin Sui JSON-RPC client routed through Tatum's gateway.

Tatum exposes the standard Sui JSON-RPC surface behind an API-key-authenticated
gateway. We only need a handful of methods: chain identity / liveness, object
reads (to resolve a vault entry), event queries (to discover published signals),
and transaction submission (to register a new vault entry on-chain).

Auth: Tatum gateways accept the API key via the ``x-api-key`` header. The key is
read from ``TATUM_API_KEY`` and never logged. Endpoints default to the hackathon
gateway hosts but can be overridden with ``SUI_RPC_URL``.

The client is intentionally dependency-light (httpx only) so it works without a
full Sui SDK. Transaction *building/signing* lives in :mod:`src.integrations.vault`
and is optional; reads and submission of pre-signed bytes work with this client
alone.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any, Mapping, Sequence

import httpx

# Tatum-powered Sui RPC endpoints (from the hackathon brief).
DEFAULT_ENDPOINTS: dict[str, str] = {
    "mainnet": "https://sui-mainnet.gateway.tatum.io",
    "testnet": "https://sui-testnet.gateway.tatum.io",
    "devnet": "https://sui-devnet.gateway.tatum.io",
}

_DEFAULT_TIMEOUT = 30.0


class SuiRpcError(RuntimeError):
    """Raised when a Sui JSON-RPC call returns an error or malformed payload."""

    def __init__(self, message: str, *, code: int | None = None, data: Any = None) -> None:
        super().__init__(message)
        self.code = code
        self.data = data


def resolve_endpoint(network: str | None = None, url: str | None = None) -> str:
    """Resolve the RPC URL to use.

    Precedence: explicit ``url`` arg > ``SUI_RPC_URL`` env > network default.

    Args:
        network: One of ``mainnet`` | ``testnet`` | ``devnet``. Falls back to
            ``SUI_NETWORK`` env, then ``mainnet``.
        url: Explicit full RPC URL override.

    Returns:
        A fully-qualified RPC URL.
    """
    if url:
        return url.rstrip("/")
    env_url = os.getenv("SUI_RPC_URL", "").strip()
    if env_url:
        return env_url.rstrip("/")
    net = (network or os.getenv("SUI_NETWORK", "mainnet")).strip().lower()
    if net not in DEFAULT_ENDPOINTS:
        raise SuiRpcError(f"Unknown Sui network '{net}'. Expected one of {list(DEFAULT_ENDPOINTS)}.")
    return DEFAULT_ENDPOINTS[net]


@dataclass(slots=True)
class TatumSuiClient:
    """Minimal synchronous Sui JSON-RPC client over the Tatum gateway.

    Args:
        network: Network name used when ``url`` is not given.
        url: Explicit RPC URL override.
        api_key: Tatum API key. Defaults to ``TATUM_API_KEY`` env.
        timeout: Per-request timeout in seconds.
    """

    network: str | None = None
    url: str | None = None
    api_key: str | None = None
    timeout: float = _DEFAULT_TIMEOUT
    endpoint: str = field(init=False, default="")
    _api_key: str = field(init=False, default="", repr=False)
    _request_id: int = field(init=False, default=0, repr=False)

    def __post_init__(self) -> None:
        self.endpoint = resolve_endpoint(self.network, self.url)
        self._api_key = (self.api_key or os.getenv("TATUM_API_KEY", "")).strip()
        self._request_id = 0

    # -- low-level ---------------------------------------------------------

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self._api_key:
            # Tatum gateway auth. Harmless on public nodes that ignore it.
            headers["x-api-key"] = self._api_key
        return headers

    def call(self, method: str, params: Sequence[Any] | None = None) -> Any:
        """Invoke a single JSON-RPC method and return its ``result``.

        Args:
            method: Sui RPC method name, e.g. ``sui_getObject``.
            params: Positional params for the method.

        Returns:
            The decoded ``result`` field.

        Raises:
            SuiRpcError: On transport failure or a JSON-RPC ``error`` payload.
        """
        self._request_id += 1
        payload = {
            "jsonrpc": "2.0",
            "id": self._request_id,
            "method": method,
            "params": list(params or []),
        }
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(self.endpoint, json=payload, headers=self._headers())
        except httpx.HTTPError as exc:  # network/timeout
            raise SuiRpcError(f"RPC transport error calling {method}: {exc}") from exc

        if resp.status_code >= 400:
            raise SuiRpcError(
                f"RPC HTTP {resp.status_code} calling {method}: {resp.text[:300]}",
                code=resp.status_code,
            )
        try:
            body = resp.json()
        except ValueError as exc:
            raise SuiRpcError(f"RPC returned non-JSON for {method}: {resp.text[:300]}") from exc

        if "error" in body and body["error"] is not None:
            err = body["error"]
            raise SuiRpcError(
                f"RPC error calling {method}: {err.get('message', err)}",
                code=err.get("code"),
                data=err.get("data"),
            )
        return body.get("result")

    # -- convenience methods ----------------------------------------------

    def get_chain_identifier(self) -> str:
        """Return the chain identifier (proves connectivity + correct network)."""
        return self.call("sui_getChainIdentifier")

    def get_latest_checkpoint_sequence(self) -> str:
        """Return the latest checkpoint sequence number as a string."""
        return self.call("sui_getLatestCheckpointSequenceNumber")

    def get_reference_gas_price(self) -> str:
        """Return the current reference gas price (MIST per gas unit)."""
        return self.call("suix_getReferenceGasPrice")

    def get_object(self, object_id: str, *, with_content: bool = True) -> dict[str, Any]:
        """Fetch a Sui object by id.

        Args:
            object_id: 0x-prefixed object id.
            with_content: Include parsed Move content + type in the response.
        """
        options: dict[str, bool] = {
            "showType": True,
            "showOwner": True,
            "showPreviousTransaction": True,
            "showContent": with_content,
        }
        return self.call("sui_getObject", [object_id, options])

    def get_owned_objects(self, owner: str, struct_type: str | None = None) -> dict[str, Any]:
        """List objects owned by ``owner``, optionally filtered by StructType."""
        query: dict[str, Any] = {
            "options": {"showType": True, "showContent": True},
        }
        if struct_type:
            query["filter"] = {"StructType": struct_type}
        return self.call("suix_getOwnedObjects", [owner, query])

    def query_events(self, event_type: str, *, limit: int = 50, descending: bool = True) -> dict[str, Any]:
        """Query emitted events by their fully-qualified Move event type.

        Args:
            event_type: e.g. ``0xPKG::signal_vault::SignalPublished``.
            limit: Max events to return.
            descending: Newest-first ordering.
        """
        return self.call(
            "suix_queryEvents",
            [{"MoveEventType": event_type}, None, limit, descending],
        )

    def get_balance(self, owner: str, coin_type: str = "0x2::sui::SUI") -> dict[str, Any]:
        """Return the coin balance for ``owner`` (default native SUI)."""
        return self.call("suix_getBalance", [owner, coin_type])

    def dry_run_transaction_block(self, tx_bytes_b64: str) -> dict[str, Any]:
        """Dry-run a BCS-serialized transaction block (base64) without executing."""
        return self.call("sui_dryRunTransactionBlock", [tx_bytes_b64])

    def execute_transaction_block(
        self,
        tx_bytes_b64: str,
        signatures: Sequence[str],
        *,
        options: Mapping[str, bool] | None = None,
        request_type: str = "WaitForLocalExecution",
    ) -> dict[str, Any]:
        """Submit a signed transaction block through the Tatum gateway.

        Args:
            tx_bytes_b64: base64 BCS transaction bytes.
            signatures: List of base64 ``flag||sig||pubkey`` serialized signatures.
            options: Response options (effects, events, object changes).
            request_type: Sui execution request type.
        """
        opts = dict(
            options
            or {
                "showEffects": True,
                "showEvents": True,
                "showObjectChanges": True,
            }
        )
        return self.call(
            "sui_executeTransactionBlock",
            [tx_bytes_b64, list(signatures), opts, request_type],
        )
