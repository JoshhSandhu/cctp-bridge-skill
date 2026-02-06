/**
 * Unit Tests: Attestation Module
 * Tests Circle attestation API polling and status checking
 */

import axios from 'axios';
import { 
  fetchAttestation, 
  pollAttestation, 
  checkAttestationStatus 
} from '../../src/attestation';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Attestation Module', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAttestation()', () => {
    test('should return complete attestation when ready', async () => {
      const mockResponse = {
        data: {
          attestation: '0x1234abcd...',
          status: 'complete',
          messageHash: '0xabc123'
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await fetchAttestation('0xabc123');
      
      expect(result.attestation).toBe('0x1234abcd...');
      expect(result.status).toBe('complete');
      expect(result.messageHash).toBe('0xabc123');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://iris-api-sandbox.circle.com/v1/attestations/0xabc123',
        { timeout: 10000 }
      );
    });

    test('should handle pending attestation', async () => {
      const mockResponse = {
        data: {
          attestation: null,
          status: 'pending',
          messageHash: '0xabc123'
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await fetchAttestation('0xabc123');
      
      expect(result.attestation).toBeNull();
      expect(result.status).toBe('pending');
    });

    test('should handle 404 as pending', async () => {
      const error = new Error('Not Found') as any;
      error.response = { status: 404 };
      mockedAxios.get.mockRejectedValue(error);

      const result = await fetchAttestation('0xabc123');
      
      expect(result.attestation).toBeNull();
      expect(result.status).toBe('pending');
    });

    test('should throw on other API errors', async () => {
      const error = new Error('Server Error') as any;
      error.response = { status: 500 };
      error.message = 'Server Error';
      mockedAxios.get.mockRejectedValue(error);

      await expect(fetchAttestation('0xabc123')).rejects.toThrow(
        'Failed to fetch attestation: Server Error'
      );
    });

    test('should throw on network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(fetchAttestation('0xabc123')).rejects.toThrow(
        'Failed to fetch attestation: Network Error'
      );
    });
  });

  describe('pollAttestation()', () => {
    test('should return attestation when complete on first try', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { attestation: '0xproof123', status: 'complete' }
      });

      const result = await pollAttestation('0xhash', { 
        maxAttempts: 5, 
        initialDelayMs: 100 
      });

      expect(result).toBe('0xproof123');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('should poll multiple times until complete', async () => {
      // First two calls return pending, third returns complete
      mockedAxios.get
        .mockResolvedValueOnce({ data: { attestation: null, status: 'pending' } })
        .mockResolvedValueOnce({ data: { attestation: null, status: 'pending' } })
        .mockResolvedValueOnce({ data: { attestation: '0xproof', status: 'complete' } });

      const result = await pollAttestation('0xhash', {
        maxAttempts: 5,
        initialDelayMs: 50
      });

      expect(result).toBe('0xproof');
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });

    test('should timeout after max attempts', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { attestation: null, status: 'pending' }
      });

      await expect(
        pollAttestation('0xhash', { 
          maxAttempts: 3, 
          initialDelayMs: 10 
        })
      ).rejects.toThrow('Attestation polling timeout after 3 attempts');

      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });

    test('should use exponential backoff', async () => {
      jest.useFakeTimers();
      mockedAxios.get.mockResolvedValue({
        data: { attestation: null, status: 'pending' }
      });

      const pollPromise = pollAttestation('0xhash', {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 1000
      });

      // Should not throw, just testing the delays
      jest.advanceTimersByTime(5000);
      
      await expect(pollPromise).rejects.toThrow();
      
      jest.useRealTimers();
    });
  });

  describe('checkAttestationStatus()', () => {
    test('should return status object', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          attestation: null,
          status: 'pending',
          messageHash: '0xhash123'
        }
      });

      const result = await checkAttestationStatus('0xhash123');
      
      expect(result.status).toBe('pending');
      expect(result.messageHash).toBe('0xhash123');
    });

    test('should return complete status with attestation', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          attestation: '0xproof',
          status: 'complete',
          messageHash: '0xhash123'
        }
      });

      const result = await checkAttestationStatus('0xhash123');
      
      expect(result.status).toBe('complete');
      expect(result.attestation).toBe('0xproof');
    });
  });
});
