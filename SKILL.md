---
name: cctp-bridge
description: "Bridge USDC across chains using Circle's Cross-Chain Transfer Protocol (CCTP). Supports testnet bridging between Base Sepolia, Ethereum Sepolia, and Arbitrum Sepolia."
metadata:
  {
    "openclaw":
      {
        "emoji": "🌉",
        "requires": { "env": ["PRIVATE_KEY"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "./package.json",
              "bins": ["cctp_bridge"],
              "label": "CCTP Bridge Skill",
            },
          ],
      },
  }
---

# CCTP Bridge Skill 🌉

Bridge USDC across blockchain networks using Circle's Cross-Chain Transfer Protocol (CCTP). Built for AI agents participating in the USDC ecosystem.

## Features

- **Cross-Chain Bridging**: Move USDC between supported testnet chains
- **Automatic Attestation**: Polls Circle's attestation service automatically
- **Status Checking**: Check bridge transaction status anytime
- **Multi-Chain Support**: Base Sepolia, Ethereum Sepolia, Arbitrum Sepolia

## Supported Chains

| Chain | Domain ID | Status |
|-------|-----------|--------|
| Base Sepolia | 6 | ✅ Ready |
| Ethereum Sepolia | 0 | ✅ Ready |
| Arbitrum Sepolia | 3 | ✅ Ready |

## Installation

```bash
npm install
npm run build
```

## Usage

### Bridge USDC

```bash
export PRIVATE_KEY=0x...
cctp_bridge bridge <amount> <source-chain> <dest-chain> <recipient>
```

**Example:**
```bash
cctp_bridge bridge 10 base-sepolia eth-sepolia 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

This will:
1. Approve USDC spend on source chain
2. Burn USDC via CCTP TokenMessenger
3. Poll Circle's attestation service
4. Mint USDC on destination chain

### Check Bridge Status

```bash
cctp_bridge status <message-hash>
```

**Example:**
```bash
cctp_bridge status 0xabc123...
```

### List Supported Chains

```bash
cctp_bridge chains
```

## How It Works

CCTP (Cross-Chain Transfer Protocol) is Circle's native bridging solution for USDC:

1. **Burn**: USDC is burned on the source chain via `depositForBurn()`
2. **Attest**: Circle's attestation service observes and signs the burn
3. **Mint**: Signed attestation is used to mint USDC on the destination chain

This skill automates all three steps for AI agents.

## Security Notes

- ⚠️ **Testnet Only**: This skill only works on testnets
- 🔐 **Private Key**: Keep your private key secure; use environment variables
- ⛽ **Gas**: Ensure you have testnet ETH on both source and destination chains

## Contract Addresses

### Base Sepolia
- Token Messenger: `0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5`
- Message Transmitter: `0x7865fAfC2db2093669d92c0F33AeEF291086BEFD`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Ethereum Sepolia
- Token Messenger: `0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5`
- Message Transmitter: `0x7865fAfC2db2093669d92c0F33AeEF291086BEFD`
- USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

## Links

- [Circle CCTP Documentation](https://developers.circle.com/stablecoins/cctp-getting-started)
- [CCTP Contract Addresses](https://developers.circle.com/stablecoins/supported-domains)
- [USDC Hackathon](https://moltbook.com/m/usdc)

## License

MIT
