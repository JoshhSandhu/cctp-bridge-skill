/**
 * Unit Tests: Chain Configuration Module
 * Tests chain configs, contract addresses, and utilities
 */

import { 
  CHAINS, 
  getChain, 
  getSupportedChains,
  TOKEN_MESSENGER_ABI,
  MESSAGE_TRANSMITTER_ABI,
  USDC_ABI,
  ATTESTATION_API 
} from '../../src/chains';

describe('Chain Configuration', () => {
  
  describe('Chain Definitions', () => {
    test('should have Base Sepolia configured', () => {
      const baseSepolia = CHAINS['base-sepolia'];
      expect(baseSepolia).toBeDefined();
      expect(baseSepolia.name).toBe('Base Sepolia');
      expect(baseSepolia.chainId).toBe(84532);
      expect(baseSepolia.domain).toBe(6);
    });

    test('should have Ethereum Sepolia configured', () => {
      const ethSepolia = CHAINS['eth-sepolia'];
      expect(ethSepolia).toBeDefined();
      expect(ethSepolia.name).toBe('Ethereum Sepolia');
      expect(ethSepolia.chainId).toBe(11155111);
      expect(ethSepolia.domain).toBe(0);
    });

    test('should have Arbitrum Sepolia configured', () => {
      const arbSepolia = CHAINS['arb-sepolia'];
      expect(arbSepolia).toBeDefined();
      expect(arbSepolia.name).toBe('Arbitrum Sepolia');
      expect(arbSepolia.chainId).toBe(421614);
      expect(arbSepolia.domain).toBe(3);
    });
  });

  describe('Contract Addresses', () => {
    test('should have valid contract addresses for Base Sepolia', () => {
      const baseSepolia = CHAINS['base-sepolia'];
      
      // Check addresses are valid hex strings
      expect(baseSepolia.tokenMessenger).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(baseSepolia.messageTransmitter).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(baseSepolia.usdc).toMatch(/^0x[a-fA-F0-9]{40}$/);
      
      // Check specific known addresses
      expect(baseSepolia.tokenMessenger).toBe('0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5');
      expect(baseSepolia.usdc).toBe('0x036CbD53842c5426634e7929541eC2318f3dCF7e');
    });

    test('should have valid contract addresses for Ethereum Sepolia', () => {
      const ethSepolia = CHAINS['eth-sepolia'];
      
      expect(ethSepolia.tokenMessenger).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(ethSepolia.messageTransmitter).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(ethSepolia.usdc).toMatch(/^0x[a-fA-F0-9]{40}$/);
      
      expect(ethSepolia.usdc).toBe('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238');
    });
  });

  describe('RPC Endpoints', () => {
    test('should have valid RPC URLs', () => {
      Object.values(CHAINS).forEach(chain => {
        expect(chain.rpcUrl).toBeDefined();
        expect(chain.rpcUrl).toMatch(/^https?:\/\//);
      });
    });

    test('should use public Sepolia endpoints', () => {
      expect(CHAINS['base-sepolia'].rpcUrl).toBe('https://sepolia.base.org');
      expect(CHAINS['eth-sepolia'].rpcUrl).toBe('https://rpc.sepolia.org');
    });
  });

  describe('getChain() utility', () => {
    test('should return chain config by name', () => {
      const chain = getChain('base-sepolia');
      expect(chain.name).toBe('Base Sepolia');
    });

    test('should be case insensitive', () => {
      const chain1 = getChain('BASE-SEPOLIA');
      const chain2 = getChain('Base-Sepolia');
      expect(chain1.name).toBe('Base Sepolia');
      expect(chain2.name).toBe('Base Sepolia');
    });

    test('should throw error for unknown chain', () => {
      expect(() => getChain('unknown-chain')).toThrow('Unknown chain: unknown-chain');
    });
  });

  describe('getSupportedChains() utility', () => {
    test('should return array of chain keys', () => {
      const chains = getSupportedChains();
      expect(Array.isArray(chains)).toBe(true);
      expect(chains).toContain('base-sepolia');
      expect(chains).toContain('eth-sepolia');
      expect(chains).toContain('arb-sepolia');
    });
  });

  describe('Contract ABIs', () => {
    test('should have TokenMessenger ABI defined', () => {
      expect(TOKEN_MESSENGER_ABI).toBeDefined();
      expect(Array.isArray(TOKEN_MESSENGER_ABI)).toBe(true);
      expect(TOKEN_MESSENGER_ABI.length).toBeGreaterThan(0);
      
      // Check for depositForBurn function
      const depositFunc = TOKEN_MESSENGER_ABI.find(
        (item: any) => item.name === 'depositForBurn'
      );
      expect(depositFunc).toBeDefined();
    });

    test('should have MessageTransmitter ABI defined', () => {
      expect(MESSAGE_TRANSMITTER_ABI).toBeDefined();
      expect(Array.isArray(MESSAGE_TRANSMITTER_ABI)).toBe(true);
      
      const receiveFunc = MESSAGE_TRANSMITTER_ABI.find(
        (item: any) => item.name === 'receiveMessage'
      );
      expect(receiveFunc).toBeDefined();
    });

    test('should have USDC ABI defined', () => {
      expect(USDC_ABI).toBeDefined();
      expect(Array.isArray(USDC_ABI)).toBe(true);
      
      // Check for approve function
      const approveFunc = USDC_ABI.find(
        (item: any) => item.name === 'approve'
      );
      expect(approveFunc).toBeDefined();
    });
  });

  describe('Attestation API', () => {
    test('should have correct attestation API endpoint', () => {
      expect(ATTESTATION_API).toBe('https://iris-api-sandbox.circle.com/v1/attestations');
    });
  });
});
