// CCTP Bridge Skill - Core Bridge Logic
// Handles depositForBurn and receiveMessage

import { createWalletClient, createPublicClient, http, parseUnits, formatUnits, keccak256, hexToBytes, bytesToHex, pad } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  ChainConfig,
  getChain,
  TOKEN_MESSENGER_ABI,
  MESSAGE_TRANSMITTER_ABI,
  USDC_ABI,
} from './chains';
import { pollAttestation } from './attestation';

export interface BridgeResult {
  success: boolean;
  messageHash: string;
  nonce: bigint;
  burnTxHash: string;
  mintTxHash?: string;
  attestation?: string;
  error?: string;
}

export interface BridgeParams {
  amount: string; // Amount as string (e.g., "10.5")
  sourceChain: string; // e.g., "base-sepolia"
  destinationChain: string; // e.g., "eth-sepolia"
  recipient: string; // Address to receive on destination
  privateKey: string;
}

/**
 * Bridge USDC from source chain to destination chain using CCTP
 */
export async function bridgeUSDC(params: BridgeParams): Promise<BridgeResult> {
  const { amount, sourceChain, destinationChain, recipient, privateKey } = params;

  try {
    // Get chain configs
    const source = getChain(sourceChain);
    const dest = getChain(destinationChain);

    // Setup wallet client for source chain
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const sourceClient = createWalletClient({
      account,
      chain: {
        id: source.chainId,
        name: source.name,
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [source.rpcUrl] } },
      },
      transport: http(source.rpcUrl),
    });

    const sourcePublicClient = createPublicClient({
      chain: {
        id: source.chainId,
        name: source.name,
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [source.rpcUrl] } },
      },
      transport: http(source.rpcUrl),
    });

    // Convert amount to USDC units (6 decimals)
    const amountUnits = parseUnits(amount, 6);

    console.log(`🌉 Bridging ${amount} USDC from ${source.name} to ${dest.name}`);
    console.log(`   From: ${account.address}`);
    console.log(`   To: ${recipient}`);

    // Step 1: Check USDC balance
    const balance = await sourcePublicClient.readContract({
      address: source.usdc as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    }) as bigint;

    if (balance < amountUnits) {
      throw new Error(
        `Insufficient USDC balance. Have: ${formatUnits(balance, 6)}, Need: ${amount}`
      );
    }

    console.log(`✅ Balance check passed: ${formatUnits(balance, 6)} USDC`);

    // Step 2: Approve TokenMessenger to spend USDC
    console.log('📝 Approving USDC spend...');
    const approveTx = await sourceClient.writeContract({
      address: source.usdc as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [source.tokenMessenger, amountUnits],
    });

    await sourcePublicClient.waitForTransactionReceipt({ hash: approveTx });
    console.log(`✅ Approved: ${approveTx}`);

    // Step 3: Call depositForBurn
    console.log('🔥 Burning USDC on source chain...');

    // Pad recipient address to bytes32
    const mintRecipient = pad(recipient as `0x${string}`, { size: 32 });

    const burnTx = await sourceClient.writeContract({
      address: source.tokenMessenger as `0x${string}`,
      abi: TOKEN_MESSENGER_ABI,
      functionName: 'depositForBurn',
      args: [amountUnits, dest.domain, mintRecipient, source.usdc],
    });

    const burnReceipt = await sourcePublicClient.waitForTransactionReceipt({
      hash: burnTx,
    });

    console.log(`✅ Burn transaction: ${burnTx}`);

    // Extract message hash from event logs
    // This is a simplified version - in production, parse the MessageSent event
    const messageHash = keccak256(burnTx); // Placeholder - should parse actual event

    console.log(`📝 Message hash: ${messageHash}`);

    // Step 4: Poll for attestation
    console.log('⏳ Waiting for Circle attestation...');
    const attestation = await pollAttestation(messageHash);

    // Step 5: Mint on destination chain
    console.log('💰 Minting USDC on destination chain...');

    const destClient = createWalletClient({
      account,
      chain: {
        id: dest.chainId,
        name: dest.name,
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [dest.rpcUrl] } },
      },
      transport: http(dest.rpcUrl),
    });

    // Note: In production, we'd extract the actual message from the burn event
    // For now, using the message hash as a placeholder
    const message = burnTx; // Placeholder - should be actual message bytes

    const mintTx = await destClient.writeContract({
      address: dest.messageTransmitter as `0x${string}`,
      abi: MESSAGE_TRANSMITTER_ABI,
      functionName: 'receiveMessage',
      args: [message as `0x${string}`, attestation as `0x${string}`],
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
  } catch (error: any) {
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
export async function getBridgeStatus(
  messageHash: string,
  destinationChain: string,
  privateKey: string
): Promise<{ status: string; canMint: boolean }> {
  // Implementation would check if attestation is ready
  // and if mint has already been executed
  return { status: 'pending', canMint: false };
}
