// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SignalVault — on-chain registry for Vibe-Trading artifacts on Walrus.
/// @notice EVM counterpart of the Sui `signal_vault` Move module. Each entry
/// pins a Walrus manifest blob id together with the SHA-256 of its content and
/// its byte size. Because a Walrus blobId is content-addressed and the hash is
/// co-recorded, anyone can fetch the manifest from any Walrus aggregator and
/// prove it matches what the publisher committed on-chain. The chain provides
/// the tamper-evident, ownership-bearing pointer; Walrus holds the bytes.
///
/// Deployed to Mantle Sepolia (chainId 5003) and Somnia Shannon (chainId 50312).
contract SignalVault {
    struct SignalEntry {
        string blobId; // Walrus content-addressed manifest blob id
        string sha256; // hex SHA-256 of the manifest content
        uint256 size; // manifest size in bytes
        address publisher; // who registered it
        uint256 createdAt; // block timestamp (seconds)
    }

    /// @dev Append-only list of registered entries.
    SignalEntry[] private _entries;

    /// @dev Entry ids registered by each publisher (for agent discovery).
    mapping(address => uint256[]) private _byPublisher;

    /// @notice Emitted on every publish so agents/indexers can discover signals.
    event SignalPublished(
        uint256 indexed id,
        address indexed publisher,
        string blobId,
        string sha256,
        uint256 size,
        uint256 createdAt
    );

    /// @notice Register a new signal-vault entry.
    /// @param blobId Walrus manifest blob id to pin on-chain.
    /// @param sha256_ Hex SHA-256 of the manifest content.
    /// @param size Manifest byte size.
    /// @return id The new entry's index.
    function publishSignal(
        string calldata blobId,
        string calldata sha256_,
        uint256 size
    ) external returns (uint256 id) {
        id = _entries.length;
        _entries.push(
            SignalEntry({
                blobId: blobId,
                sha256: sha256_,
                size: size,
                publisher: msg.sender,
                createdAt: block.timestamp
            })
        );
        _byPublisher[msg.sender].push(id);
        emit SignalPublished(id, msg.sender, blobId, sha256_, size, block.timestamp);
    }

    /// @notice Total number of registered entries.
    function count() external view returns (uint256) {
        return _entries.length;
    }

    /// @notice Read a single entry by id.
    function getEntry(uint256 id) external view returns (SignalEntry memory) {
        require(id < _entries.length, "SignalVault: id out of range");
        return _entries[id];
    }

    /// @notice The most recently registered entry.
    function latest() external view returns (SignalEntry memory) {
        require(_entries.length > 0, "SignalVault: empty");
        return _entries[_entries.length - 1];
    }

    /// @notice Entry ids registered by `publisher`.
    function entriesOf(address publisher) external view returns (uint256[] memory) {
        return _byPublisher[publisher];
    }
}
