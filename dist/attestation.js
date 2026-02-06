"use strict";
// CCTP Bridge Skill - Attestation Service
// Polls Circle's attestation API for burn messages
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAttestation = fetchAttestation;
exports.pollAttestation = pollAttestation;
exports.checkAttestationStatus = checkAttestationStatus;
const axios_1 = __importDefault(require("axios"));
const chains_1 = require("./chains");
/**
 * Fetch attestation from Circle's API
 */
async function fetchAttestation(messageHash) {
    try {
        const response = await axios_1.default.get(`${chains_1.ATTESTATION_API}/${messageHash}`, {
            timeout: 10000,
        });
        return {
            attestation: response.data.attestation || null,
            status: response.data.status,
            messageHash,
        };
    }
    catch (error) {
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
async function pollAttestation(messageHash, options = {}) {
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
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Check attestation status without polling
 */
async function checkAttestationStatus(messageHash) {
    return fetchAttestation(messageHash);
}
