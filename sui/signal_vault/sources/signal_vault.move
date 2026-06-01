/// On-chain registry for Vibe-Trading signal/backtest artifacts stored on Walrus.
///
/// Each `SignalEntry` pins a Walrus manifest `blob_id` together with the SHA-256
/// of its content and its byte size. Because a Walrus `blobId` is content
/// addressed and we co-record the hash, anyone can fetch the manifest from any
/// Walrus aggregator and prove it matches what the publisher committed on Sui —
/// the chain provides the tamper-evident, ownership-bearing pointer; Walrus
/// provides the bytes.
module signal_vault::signal_vault;

use std::string::{Self, String};
use sui::clock::{Self, Clock};
use sui::event;

/// An owned, on-chain pointer to a Walrus-stored trading artifact manifest.
public struct SignalEntry has key, store {
    id: UID,
    /// Walrus content-addressed manifest blob id.
    blob_id: String,
    /// Hex SHA-256 of the manifest content (independent integrity check).
    sha256: String,
    /// Manifest size in bytes.
    size: u64,
    /// Publisher address.
    publisher: address,
    /// Creation time (ms since epoch) from the shared Clock.
    created_at_ms: u64,
}

/// Emitted on every publish so indexers / the agent can discover new signals
/// via `suix_queryEvents` without walking owned objects.
public struct SignalPublished has copy, drop {
    entry_id: ID,
    blob_id: String,
    sha256: String,
    publisher: address,
    created_at_ms: u64,
}

/// Publish a new signal-vault entry. The created object is transferred to the
/// caller, who can later share, transfer, or trade it.
public fun publish_signal(
    blob_id: vector<u8>,
    sha256: vector<u8>,
    size: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let now = clock::timestamp_ms(clock);
    let publisher = ctx.sender();
    let entry = SignalEntry {
        id: object::new(ctx),
        blob_id: string::utf8(blob_id),
        sha256: string::utf8(sha256),
        size,
        publisher,
        created_at_ms: now,
    };

    event::emit(SignalPublished {
        entry_id: object::id(&entry),
        blob_id: entry.blob_id,
        sha256: entry.sha256,
        publisher,
        created_at_ms: now,
    });

    transfer::public_transfer(entry, publisher);
}

// --- read-only accessors (used by the Python verifier) ---

public fun blob_id(entry: &SignalEntry): String { entry.blob_id }

public fun sha256(entry: &SignalEntry): String { entry.sha256 }

public fun size(entry: &SignalEntry): u64 { entry.size }

public fun publisher(entry: &SignalEntry): address { entry.publisher }

public fun created_at_ms(entry: &SignalEntry): u64 { entry.created_at_ms }
