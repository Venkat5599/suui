"""Walrus decentralized storage client (publisher / aggregator HTTP API).

Walrus stores arbitrary blobs across a Sui-coordinated storage network. Writes
go to a *publisher*; reads come from an *aggregator*. Both are plain HTTP:

    PUT  {publisher}/v1/blobs?epochs=N        -> { newlyCreated | alreadyCertified }
    GET  {aggregator}/v1/blobs/{blobId}       -> raw bytes

A blob's ``blobId`` is a content-addressed identifier: the same bytes always map
to the same id, which is what makes the on-chain pointer tamper-evident. We pair
the Walrus ``blobId`` with our own SHA-256 of the bytes so verification does not
depend on trusting any single aggregator.

Endpoints default to public Walrus testnet hosts and are overridable via
``WALRUS_PUBLISHER_URL`` / ``WALRUS_AGGREGATOR_URL`` (e.g. to point at a
Tatum-hosted Walrus endpoint per the hackathon tutorial).
"""

from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass, field
from typing import Any

import httpx

DEFAULT_PUBLISHERS: dict[str, str] = {
    "testnet": "https://publisher.walrus-testnet.walrus.space",
    "mainnet": "https://publisher.walrus-mainnet.walrus.space",
}
DEFAULT_AGGREGATORS: dict[str, str] = {
    "testnet": "https://aggregator.walrus-testnet.walrus.space",
    "mainnet": "https://aggregator.walrus-mainnet.walrus.space",
}

_DEFAULT_TIMEOUT = 120.0  # uploads can be slow on the public network
_DEFAULT_EPOCHS = 5


class WalrusError(RuntimeError):
    """Raised on a Walrus store/read failure."""


@dataclass(slots=True)
class WalrusBlob:
    """Result of a Walrus store operation.

    Attributes:
        blob_id: Walrus content-addressed blob identifier.
        sha256: Hex SHA-256 of the stored bytes (independent integrity check).
        size: Byte length of the stored content.
        certified: True if the blob was already certified or newly certified.
        sui_object_id: The Sui object id of the blob registration, if returned.
        end_epoch: Storage expiry epoch, if reported by the publisher.
        raw: Full publisher JSON response for debugging.
    """

    blob_id: str
    sha256: str
    size: int
    certified: bool
    sui_object_id: str | None = None
    end_epoch: int | None = None
    raw: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "blob_id": self.blob_id,
            "sha256": self.sha256,
            "size": self.size,
            "certified": self.certified,
            "sui_object_id": self.sui_object_id,
            "end_epoch": self.end_epoch,
        }


def _resolve(url_arg: str | None, env_var: str, defaults: dict[str, str], network: str) -> str:
    if url_arg:
        return url_arg.rstrip("/")
    env_value = os.getenv(env_var, "").strip()
    if env_value:
        return env_value.rstrip("/")
    net = network.strip().lower()
    if net not in defaults:
        raise WalrusError(f"No default Walrus endpoint for network '{net}'.")
    return defaults[net]


@dataclass(slots=True)
class WalrusClient:
    """HTTP client for Walrus blob store/read.

    Args:
        network: ``testnet`` | ``mainnet`` for default endpoint selection.
        publisher_url: Override publisher base URL.
        aggregator_url: Override aggregator base URL.
        epochs: Number of storage epochs to retain new blobs.
        timeout: Per-request timeout in seconds.
    """

    network: str = "testnet"
    publisher_url: str | None = None
    aggregator_url: str | None = None
    epochs: int = _DEFAULT_EPOCHS
    timeout: float = _DEFAULT_TIMEOUT
    publisher: str = field(init=False, default="")
    aggregator: str = field(init=False, default="")

    def __post_init__(self) -> None:
        self.publisher = _resolve(self.publisher_url, "WALRUS_PUBLISHER_URL", DEFAULT_PUBLISHERS, self.network)
        self.aggregator = _resolve(self.aggregator_url, "WALRUS_AGGREGATOR_URL", DEFAULT_AGGREGATORS, self.network)
        env_epochs = os.getenv("WALRUS_EPOCHS", "").strip()
        if env_epochs.isdigit():
            self.epochs = int(env_epochs)

    def store_bytes(self, data: bytes, *, epochs: int | None = None) -> WalrusBlob:
        """Store raw bytes on Walrus and return the blob descriptor.

        Args:
            data: Content to store.
            epochs: Override retention epochs for this blob.

        Raises:
            WalrusError: On HTTP failure or unparseable response.
        """
        sha = hashlib.sha256(data).hexdigest()
        keep = epochs if epochs is not None else self.epochs
        put_url = f"{self.publisher}/v1/blobs"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.put(put_url, params={"epochs": keep}, content=data)
        except httpx.HTTPError as exc:
            raise WalrusError(f"Walrus store transport error: {exc}") from exc

        if resp.status_code >= 400:
            raise WalrusError(f"Walrus store HTTP {resp.status_code}: {resp.text[:300]}")
        try:
            body = resp.json()
        except ValueError as exc:
            raise WalrusError(f"Walrus store returned non-JSON: {resp.text[:300]}") from exc

        return self._parse_store_response(body, sha=sha, size=len(data))

    def store_text(self, text: str, *, epochs: int | None = None) -> WalrusBlob:
        """Store a UTF-8 string on Walrus."""
        return self.store_bytes(text.encode("utf-8"), epochs=epochs)

    def read_bytes(self, blob_id: str) -> bytes:
        """Read a blob's raw bytes from the aggregator.

        Raises:
            WalrusError: If the blob cannot be fetched.
        """
        get_url = f"{self.aggregator}/v1/blobs/{blob_id}"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(get_url)
        except httpx.HTTPError as exc:
            raise WalrusError(f"Walrus read transport error: {exc}") from exc
        if resp.status_code >= 400:
            raise WalrusError(f"Walrus read HTTP {resp.status_code} for {blob_id}: {resp.text[:200]}")
        return resp.content

    def read_text(self, blob_id: str) -> str:
        """Read a blob and decode it as UTF-8."""
        return self.read_bytes(blob_id).decode("utf-8")

    def verify(self, blob_id: str, expected_sha256: str) -> bool:
        """Fetch ``blob_id`` and confirm its SHA-256 matches ``expected_sha256``."""
        data = self.read_bytes(blob_id)
        return hashlib.sha256(data).hexdigest() == expected_sha256

    @staticmethod
    def _parse_store_response(body: dict[str, Any], *, sha: str, size: int) -> WalrusBlob:
        """Normalize the two publisher response shapes into a WalrusBlob."""
        # newlyCreated: first time this content was stored this epoch range.
        if "newlyCreated" in body:
            info = body["newlyCreated"]["blobObject"]
            return WalrusBlob(
                blob_id=info["blobId"],
                sha256=sha,
                size=size,
                certified=True,
                sui_object_id=info.get("id"),
                end_epoch=info.get("storage", {}).get("endEpoch"),
                raw=body,
            )
        # alreadyCertified: identical content already lives on the network.
        if "alreadyCertified" in body:
            info = body["alreadyCertified"]
            return WalrusBlob(
                blob_id=info["blobId"],
                sha256=sha,
                size=size,
                certified=True,
                sui_object_id=None,
                end_epoch=info.get("endEpoch"),
                raw=body,
            )
        raise WalrusError(f"Unrecognized Walrus store response keys: {list(body)}")
