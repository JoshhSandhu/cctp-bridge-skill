// CCTP Bridge Skill - Chain Configurations
// Testnet only - CCTP supported chains

export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  tokenMessenger: string;
  messageTransmitter: string;
  usdc: string;
  domain: number; // CCTP domain identifier
}

// CCTP Contract Addresses - Testnet
// Source: https://developers.circle.com/stablecoins/supported-domains

export const CHAINS: Record<string, ChainConfig> = {
  'base-sepolia': {
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    messageTransmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    domain: 6, // Base domain
  },
  'eth-sepolia': {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    messageTransmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    domain: 0, // Ethereum domain
  },
  'arb-sepolia': {
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    messageTransmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD',
    usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    domain: 3, // Arbitrum domain
  },
};

// ABI for TokenMessenger contract
export const TOKEN_MESSENGER_ABI = [
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
    ],
    name: 'depositForBurn',
    outputs: [{ name: 'nonce', type: 'uint64' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'localMessageTransmitter',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// ABI for MessageTransmitter contract
export const MESSAGE_TRANSMITTER_ABI = [
  {
    inputs: [
      { name: 'message', type: 'bytes' },
      { name: 'attestation', type: 'bytes' },
    ],
    name: 'receiveMessage',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// ABI for USDC token
export const USDC_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'account', type: 'address' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Circle Attestation API
export const ATTESTATION_API = 'https://iris-api-sandbox.circle.com/v1/attestations';

// Get chain by name
export function getChain(name: string): ChainConfig {
  const chain = CHAINS[name.toLowerCase()];
  if (!chain) {
    throw new Error(`Unknown chain: ${name}. Supported: ${Object.keys(CHAINS).join(', ')}`);
  }
  return chain;
}

// Get all supported chains
export function getSupportedChains(): string[] {
  return Object.keys(CHAINS);
}
