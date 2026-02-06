"use strict";
// CCTP Bridge Skill - Core Bridge Logic
// Handles depositForBurn and receiveMessage
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridgeUSDC = bridgeUSDC;
exports.getBridgeStatus = getBridgeStatus;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("./chains");
const attestation_1 = require("./attestation");
/**
 * Bridge USDC from source chain to destination chain using CCTP
 */
async function bridgeUSDC(params) {
    const { amount, sourceChain, destinationChain, recipient, privateKey } = params;
    try {
        // Get chain configs
        const source = (0, chains_1.getChain)(sourceChain);
        const dest = (0, chains_1.getChain)(destinationChain);
        // Setup wallet client for source chain
        const account = (0, accounts_1.privateKeyToAccount)(privateKey);
        const sourceClient = (0, viem_1.createWalletClient)({
            account,
            chain: {
                id: source.chainId,
                name: source.name,
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: { default: { http: [source.rpcUrl] } },
            },
            transport: (0, viem_1.http)(source.rpcUrl),
        });
        const sourcePublicClient = (0, viem_1.createPublicClient)({
            chain: {
                id: source.chainId,
                name: source.name,
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: { default: { http: [source.rpcUrl] } },
            },
            transport: (0, viem_1.http)(source.rpcUrl),
        });
        // Convert amount to USDC units (6 decimals)
        const amountUnits = (0, viem_1.parseUnits)(amount, 6);
        console.log(`🌉 Bridging ${amount} USDC from ${source.name} to ${dest.name}`);
        console.log(`   From: ${account.address}`);
        console.log(`   To: ${recipient}`);
        // Step 1: Check USDC balance
        const balance = await sourcePublicClient.readContract({
            address: source.usdc,
            abi: chains_1.USDC_ABI,
            functionName: 'balanceOf',
            args: [account.address],
        });
        if (balance < amountUnits) {
            throw new Error(`Insufficient USDC balance. Have: ${(0, viem_1.formatUnits)(balance, 6)}, Need: ${amount}`);
        }
        console.log(`✅ Balance check passed: ${(0, viem_1.formatUnits)(balance, 6)} USDC`);
        // Step 2: Approve TokenMessenger to spend USDC
        console.log('📝 Approving USDC spend...');
        const approveTx = await sourceClient.writeContract({
            address: source.usdc,
            abi: chains_1.USDC_ABI,
            functionName: 'approve',
            args: [source.tokenMessenger, amountUnits],
        });
        await sourcePublicClient.waitForTransactionReceipt({ hash: approveTx });
        console.log(`✅ Approved: ${approveTx}`);
        // Step 3: Call depositForBurn
        console.log('🔥 Burning USDC on source chain...');
        // Pad recipient address to bytes32
        const mintRecipient = (0, viem_1.pad)(recipient, { size: 32 });
        const burnTx = await sourceClient.writeContract({
            address: source.tokenMessenger,
            abi: chains_1.TOKEN_MESSENGER_ABI,
            functionName: 'depositForBurn',
            args: [amountUnits, dest.domain, mintRecipient, source.usdc],
        });
        const burnReceipt = await sourcePublicClient.waitForTransactionReceipt({
            hash: burnTx,
        });
        console.log(`✅ Burn transaction: ${burnTx}`);
        // Extract message hash from event logs
        // This is a simplified version - in production, parse the MessageSent event
        const messageHash = (0, viem_1.keccak256)(burnTx); // Placeholder - should parse actual event
        console.log(`📝 Message hash: ${messageHash}`);
        // Step 4: Poll for attestation
        console.log('⏳ Waiting for Circle attestation...');
        const attestation = await (0, attestation_1.pollAttestation)(messageHash);
        // Step 5: Mint on destination chain
        console.log('💰 Minting USDC on destination chain...');
        const destClient = (0, viem_1.createWalletClient)({
            account,
            chain: {
                id: dest.chainId,
                name: dest.name,
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: { default: { http: [dest.rpcUrl] } },
            },
            transport: (0, viem_1.http)(dest.rpcUrl),
        });
        // Note: In production, we'd extract the actual message from the burn event
        // For now, using the message hash as a placeholder
        const message = burnTx; // Placeholder - should be actual message bytes
        const mintTx = await destClient.writeContract({
            address: dest.messageTransmitter,
            abi: chains_1.MESSAGE_TRANSMITTER_ABI,
            functionName: 'receiveMessage',
            args: [message, attestation],
        });
        console.log(`✅ Mint transaction: ${mintTx}`);
        return {
            success: true,
            messageHash,
            nonce: BigInt(0), // Extract from event in production
            burnTxHash: burnTx,
            mintTxHash: mintTx,
            attestation,
        };
    }
    catch (error) {
        console.error('❌ Bridge failed:', error.message);
        return {
            success: false,
            messageHash: '',
            nonce: BigInt(0),
            burnTxHash: '',
            error: error.message,
        };
    }
}
/**
 * Get bridge status by message hash
 */
async function getBridgeStatus(messageHash, destinationChain, privateKey) {
    // Implementation would check if attestation is ready
    // and if mint has already been executed
    return { status: 'pending', canMint: false };
}
