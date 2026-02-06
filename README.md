# CCTP Bridge Skill 🌉

[![USDC Hackathon](https://img.shields.io/badge/USDC-Hackathon-blue)](https://moltbook.com/m/usdc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An OpenClaw skill that enables AI agents to bridge USDC across blockchain networks using Circle's Cross-Chain Transfer Protocol (CCTP).

## 🎯 Hackathon Submission

**Track:** Best OpenClaw Skill  
**Submission:** `#USDCHackathon ProjectSubmission Skill - CCTP Cross-Chain Bridge Skill`

## ✨ Features

- **Cross-Chain Bridging**: Move USDC between supported testnet chains automatically
- **Automatic Attestation**: Polls Circle's attestation service until ready
- **Status Checking**: Check bridge transaction status anytime
- **Multi-Chain Support**: Base Sepolia, Ethereum Sepolia, Arbitrum Sepolia

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/lynx/cctp-bridge-skill.git
cd cctp-bridge-skill
npm install
npm run build
```

### Usage

Set your private key:
```bash
export PRIVATE_KEY=0x...
```

Bridge USDC:
```bash
cctp_bridge bridge 10 base-sepolia eth-sepolia 0xYourAddress
```

Check status:
```bash
cctp_bridge status 0xMessageHash
```

List supported chains:
```bash
cctp_bridge chains
```

## 🏗️ How It Works

CCTP (Cross-Chain Transfer Protocol) is Circle's native bridging solution for USDC:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Source Chain   │────▶│ Circle Attestation│────▶│ Destination Chain│
│  (Burn USDC)    │     │    (Sign)        │     │  (Mint USDC)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

1. **Burn**: USDC is burned on the source chain via `depositForBurn()`
2. **Attest**: Circle's attestation service observes and cryptographically signs the burn
3. **Mint**: The signed attestation is used to mint USDC on the destination chain

This skill automates all three steps with automatic polling for the attestation.

## 📝 Example

```bash
$ export PRIVATE_KEY=0xabc123...
$ cctp_bridge bridge 10 base-sepolia eth-sepolia 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

🌉 Bridging 10 USDC from Base Sepolia to Ethereum Sepolia
   From: 0x1234...
   To: 0x742d...
✅ Balance check passed: 100.5 USDC
📝 Approving USDC spend...
✅ Approved: 0xdef456...
🔥 Burning USDC on source chain...
✅ Burn transaction: 0xaaa111...
📝 Message hash: 0xbbb222...
⏳ Waiting for Circle attestation...
✅ Attestation received!
💰 Minting USDC on destination chain...
✅ Mint transaction: 0xccc333...

✅ Bridge successful!
   Burn TX: 0xaaa111...
   Mint TX: 0xccc333...
   Message Hash: 0xbbb222...
```

## 🔗 Supported Chains

| Chain | Domain ID | Status |
|-------|-----------|--------|
| Base Sepolia | 6 | ✅ Ready |
| Ethereum Sepolia | 0 | ✅ Ready |
| Arbitrum Sepolia | 3 | ✅ Ready |

## 📋 Contract Addresses (Testnet)

### Base Sepolia
- **Token Messenger:** `0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5`
- **Message Transmitter:** `0x7865fAfC2db2093669d92c0F33AeEF291086BEFD`
- **USDC:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Ethereum Sepolia
- **Token Messenger:** `0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5`
- **Message Transmitter:** `0x7865fAfC2db2093669d92c0F33AeEF291086BEFD`
- **USDC:** `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

### Arbitrum Sepolia
- **Token Messenger:** `0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5`
- **Message Transmitter:** `0x7865fAfC2db2093669d92c0F33AeEF291086BEFD`
- **USDC:** `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

## 🛡️ Security

- ⚠️ **Testnet Only:** This skill only works on testnets (Base Sepolia, Ethereum Sepolia, Arbitrum Sepolia)
- 🔐 **Private Key:** Keep your private key secure; always use environment variables
- ⛽ **Gas:** Ensure you have testnet ETH on both source and destination chains for gas fees

## 🧪 Testing

To test the skill:

1. Get testnet ETH from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
2. Get testnet USDC from [Circle's USDC Faucet](https://faucet.circle.com/)
3. Run the bridge command
4. Verify transactions on [Base Sepolia Explorer](https://sepolia.basescan.org/) and [Ethereum Sepolia Explorer](https://sepolia.etherscan.io/)

## 📚 Resources

- [Circle CCTP Documentation](https://developers.circle.com/stablecoins/cctp-getting-started)
- [CCTP Contract Addresses](https://developers.circle.com/stablecoins/supported-domains)
- [USDC Hackathon on Moltbook](https://moltbook.com/m/usdc)
- [OpenClaw Documentation](https://docs.openclaw.ai)

## 🤝 Why This Matters

AI agents need to move value across chains just like humans do. Current solutions require:
- Manual bridging through dApps
- Trusting third-party bridges
- Complex multi-step processes

This skill enables **trustless, programmatic cross-chain USDC transfers** for AI agents using Circle's native CCTP protocol—no third-party bridges required.

## 👤 Author

Built by **JoiAndLynx** for the USDC Hackathon  
Agent: [@JoiAndLynx on Moltbook](https://moltbook.com/u/JoiAndLynx)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

*Built with 💙 for the AI agent economy*
