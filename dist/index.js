"use strict";
// CCTP Bridge Skill - Main Entry Point
// OpenClaw skill for cross-chain USDC bridging
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAttestationStatus = exports.getSupportedChains = exports.bridgeUSDC = void 0;
const bridge_1 = require("./bridge");
Object.defineProperty(exports, "bridgeUSDC", { enumerable: true, get: function () { return bridge_1.bridgeUSDC; } });
const chains_1 = require("./chains");
Object.defineProperty(exports, "getSupportedChains", { enumerable: true, get: function () { return chains_1.getSupportedChains; } });
const attestation_1 = require("./attestation");
Object.defineProperty(exports, "checkAttestationStatus", { enumerable: true, get: function () { return attestation_1.checkAttestationStatus; } });
// CLI entry point
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    switch (command) {
        case 'bridge':
            await handleBridge(args.slice(1));
            break;
        case 'status':
            await handleStatus(args.slice(1));
            break;
        case 'chains':
            handleChains();
            break;
        default:
            showHelp();
    }
}
async function handleBridge(args) {
    const amount = args[0];
    const source = args[1];
    const dest = args[2];
    const recipient = args[3];
    const privateKey = process.env.PRIVATE_KEY;
    if (!amount || !source || !dest || !recipient) {
        console.error('Usage: cctp_bridge bridge <amount> <source-chain> <dest-chain> <recipient>');
        console.error('Example: cctp_bridge bridge 10 base-sepolia eth-sepolia 0x1234...');
        process.exit(1);
    }
    if (!privateKey) {
        console.error('Error: PRIVATE_KEY environment variable required');
        process.exit(1);
    }
    const params = {
        amount,
        sourceChain: source,
        destinationChain: dest,
        recipient,
        privateKey,
    };
    const result = await (0, bridge_1.bridgeUSDC)(params);
    if (result.success) {
        console.log('\n✅ Bridge successful!');
        console.log(`   Burn TX: ${result.burnTxHash}`);
        console.log(`   Mint TX: ${result.mintTxHash}`);
        console.log(`   Message Hash: ${result.messageHash}`);
    }
    else {
        console.error('\n❌ Bridge failed:', result.error);
        process.exit(1);
    }
}
async function handleStatus(args) {
    const messageHash = args[0];
    if (!messageHash) {
        console.error('Usage: cctp_bridge status <message-hash>');
        process.exit(1);
    }
    const status = await (0, attestation_1.checkAttestationStatus)(messageHash);
    console.log(`Attestation Status: ${status.status}`);
    if (status.attestation) {
        console.log(`Attestation: ${status.attestation.substring(0, 64)}...`);
    }
}
function handleChains() {
    console.log('Supported chains:');
    for (const chain of (0, chains_1.getSupportedChains)()) {
        const config = (0, chains_1.getChain)(chain);
        console.log(`  - ${chain}: ${config.name} (Chain ID: ${config.chainId})`);
    }
}
function showHelp() {
    console.log(`
CCTP Bridge Skill - Cross-chain USDC bridging for AI agents

Commands:
  cctp_bridge bridge <amount> <source> <dest> <recipient>
    Bridge USDC from source chain to destination chain
    
  cctp_bridge status <message-hash>
    Check attestation status for a bridge message
    
  cctp_bridge chains
    List supported chains

Environment:
  PRIVATE_KEY - Your wallet private key (with 0x prefix)

Examples:
  PRIVATE_KEY=0x... cctp_bridge bridge 10 base-sepolia eth-sepolia 0x1234...
  cctp_bridge status 0xabcd...
  cctp_bridge chains
`);
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
