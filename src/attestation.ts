// CCTP Bridge Skill - Attestation Service
// Polls Circle's attestation API for burn messages

import axios from 'axios';
import { ATTESTATION_API } from './chains';

export interface AttestationResponse {
  attestation: string | null;
  status: 'pending' | 'complete';
  messageHash: string;
}

/**
 * Fetch attestation from Circle's API
 */
export async function fetchAttestation(messageHash: string): Promise<AttestationResponse> {
  try {
    const response = await axios.get(`${ATTESTATION_API}/${messageHash}`, {
      timeout: 10000,
    });

    return {
      attestation: response.data.attestation || null,
      status: response.data.status,
      messageHash,
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        attestation: null,
        status: 'pending',
        messageHash,
      };
    }
    throw new Error(`Failed to fetch attestation: ${error.message}`);
  }
}

/**
 * Poll for attestation with exponential backoff
 */
export async function pollAttestation(
  messageHash: string,
  options: {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
  } = {}
): Promise<string> {
  const { maxAttempts = 60, initialDelayMs = 5000, maxDelayMs = 30000 } = options;

  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Polling attestation... attempt ${attempt}/${maxAttempts}`);

    const result = await fetchAttestation(messageHash);

    if (result.status === 'complete' && result.attestation) {
      console.log('✅ Attestation received!');
      return result.attestation;
    }

    if (attempt < maxAttempts) {
      console.log(`⏳ Waiting ${delay}ms before next attempt...`);
      await sleep(delay);
      delay = Math.min(delay * 1.5, maxDelayMs);
    }
  }

  throw new Error(`Attestation polling timeout after ${maxAttempts} attempts`);
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check attestation status without polling
 */
export async function checkAttestationStatus(messageHash: string): Promise<AttestationResponse> {
  return fetchAttestation(messageHash);
}
