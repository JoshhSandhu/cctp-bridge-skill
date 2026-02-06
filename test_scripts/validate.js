#!/usr/bin/env node
/**
 * Validation Script for CCTP Bridge Skill
 * 
 * This script validates:
 * 1. All dependencies are installed
 * 2. TypeScript compiles without errors
 * 3. Chain configurations are valid
 * 4. Contract addresses are properly formatted
 * 5. Test suite passes
 * 
 * Usage: node validate.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let exitCode = 0;

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = type === 'error' ? RED + '✗' : type === 'success' ? GREEN + '✓' : type === 'warning' ? YELLOW + '⚠' : 'ℹ';
  console.log(`[${timestamp}] ${prefix} ${message}${RESET}`);
}

function runCommand(command, description) {
  log(`${description}...`);
  try {
    execSync(command, { stdio: 'pipe', cwd: path.join(__dirname, '..') });
    log(`${description} - PASSED`, 'success');
    return true;
  } catch (error) {
    log(`${description} - FAILED`, 'error');
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.log(error.stderr.toString());
    exitCode = 1;
    return false;
  }
}

console.log('\n========================================');
console.log('CCTP Bridge Skill - Validation Suite');
console.log('========================================\n');

// Check 1: Dependencies installed
log('Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
  log('node_modules not found. Running npm install...', 'warning');
  if (!runCommand('npm install', 'Installing dependencies')) {
    process.exit(1);
  }
} else {
  log('Dependencies installed', 'success');
}

// Check 2: TypeScript compilation
log('\n--- TypeScript Compilation ---');
runCommand('npx tsc --noEmit', 'TypeScript compiles without errors');

// Check 3: Build output exists
log('\n--- Build Output ---');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  if (files.length > 0) {
    log(`Build output exists (${files.length} files)`, 'success');
    files.forEach(f => log(`  - ${f}`));
  } else {
    log('Build output directory is empty', 'warning');
    if (!runCommand('npm run build', 'Building project')) {
      log('Build failed', 'error');
    }
  }
} else {
  log('Build output not found', 'warning');
  if (!runCommand('npm run build', 'Building project')) {
    log('Build failed', 'error');
  }
}

// Check 4: Chain configurations
log('\n--- Chain Configuration Validation ---');
try {
  const chains = require('../dist/chains.js');
  
  // Check supported chains
  const supportedChains = chains.getSupportedChains();
  log(`Supported chains: ${supportedChains.join(', ')}`);
  
  // Validate each chain
  supportedChains.forEach(chainKey => {
    try {
      const chain = chains.getChain(chainKey);
      
      // Check contract addresses
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      const validTokenMessenger = addressRegex.test(chain.tokenMessenger);
      const validMessageTransmitter = addressRegex.test(chain.messageTransmitter);
      const validUsdc = addressRegex.test(chain.usdc);
      
      if (validTokenMessenger && validMessageTransmitter && validUsdc) {
        log(`${chain.name}: Valid contract addresses`, 'success');
      } else {
        log(`${chain.name}: Invalid contract addresses`, 'error');
        exitCode = 1;
      }
      
      // Check RPC URL
      if (chain.rpcUrl && chain.rpcUrl.startsWith('http')) {
        log(`  ${chain.name}: Valid RPC endpoint`, 'success');
      } else {
        log(`  ${chain.name}: Invalid RPC endpoint`, 'error');
        exitCode = 1;
      }
      
    } catch (e) {
      log(`${chainKey}: Failed to validate - ${e.message}`, 'error');
      exitCode = 1;
    }
  });
  
} catch (e) {
  log(`Failed to load chains module: ${e.message}`, 'error');
  exitCode = 1;
}

// Check 5: Contract ABIs
log('\n--- Contract ABI Validation ---');
try {
  const { TOKEN_MESSENGER_ABI, MESSAGE_TRANSMITTER_ABI, USDC_ABI } = require('../dist/chains.js');
  
  // Check TokenMessenger ABI
  const depositFunc = TOKEN_MESSENGER_ABI.find((item) => item.name === 'depositForBurn');
  if (depositFunc) {
    log('TokenMessenger ABI: depositForBurn function found', 'success');
  } else {
    log('TokenMessenger ABI: depositForBurn function missing', 'error');
    exitCode = 1;
  }
  
  // Check MessageTransmitter ABI
  const receiveFunc = MESSAGE_TRANSMITTER_ABI.find((item) => item.name === 'receiveMessage');
  if (receiveFunc) {
    log('MessageTransmitter ABI: receiveMessage function found', 'success');
  } else {
    log('MessageTransmitter ABI: receiveMessage function missing', 'error');
    exitCode = 1;
  }
  
  // Check USDC ABI
  const approveFunc = USDC_ABI.find((item) => item.name === 'approve');
  if (approveFunc) {
    log('USDC ABI: approve function found', 'success');
  } else {
    log('USDC ABI: approve function missing', 'error');
    exitCode = 1;
  }
  
} catch (e) {
  log(`Failed to validate ABIs: ${e.message}`, 'error');
  exitCode = 1;
}

// Check 6: Test suite (if test dependencies installed)
log('\n--- Test Suite ---');
const testNodeModules = path.join(__dirname, 'node_modules');
if (fs.existsSync(testNodeModules)) {
  try {
    execSync('npm test', { 
      stdio: 'inherit', 
      cwd: __dirname 
    });
    log('All tests passed', 'success');
  } catch (e) {
    log('Some tests failed', 'error');
    exitCode = 1;
  }
} else {
  log('Test dependencies not installed. Skipping tests.', 'warning');
  log('To run tests: cd test_scripts && npm install && npm test');
}

// Check 7: Documentation
log('\n--- Documentation ---');
const readmePath = path.join(__dirname, '..', 'README.md');
const skillMdPath = path.join(__dirname, '..', 'SKILL.md');

if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf8');
  log(`README.md exists (${readme.length} characters)`, 'success');
} else {
  log('README.md missing', 'error');
  exitCode = 1;
}

if (fs.existsSync(skillMdPath)) {
  const skillMd = fs.readFileSync(skillMdPath, 'utf8');
  log(`SKILL.md exists (${skillMd.length} characters)`, 'success');
} else {
  log('SKILL.md missing', 'error');
  exitCode = 1;
}

// Summary
console.log('\n========================================');
if (exitCode === 0) {
  log('✅ ALL VALIDATIONS PASSED', 'success');
  console.log('\nThe CCTP Bridge Skill is ready for submission! 🎉');
} else {
  log('❌ SOME VALIDATIONS FAILED', 'error');
  console.log('\nPlease fix the errors above before submitting.');
}
console.log('========================================\n');

process.exit(exitCode);
