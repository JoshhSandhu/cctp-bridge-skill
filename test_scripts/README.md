# CCTP Bridge Skill - Test Suite

Comprehensive test suite for the CCTP Cross-Chain Bridge Skill.

## 📁 Test Structure

```
test_scripts/
├── unit/
│   ├── chains.test.ts          # Chain configuration tests
│   ├── attestation.test.ts     # Circle API polling tests
│   └── bridge.test.ts          # Bridge logic tests
├── integration/
│   └── bridge.integration.test.ts  # End-to-end tests
├── jest.config.js              # Test configuration
├── package.json                # Test dependencies
└── README.md                   # This file
```

## 🚀 Running Tests

### Install Dependencies
```bash
cd test_scripts
npm install
```

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run with Coverage
```bash
npm run test:coverage
```

### Watch Mode (for development)
```bash
npm run test:watch
```

## 🧪 What We Test

### Unit Tests

#### Chain Configuration (`chains.test.ts`)
- ✅ All supported chains are defined (Base Sepolia, Ethereum Sepolia, Arbitrum Sepolia)
- ✅ Contract addresses are valid hex strings
- ✅ RPC endpoints are properly configured
- ✅ Chain domain IDs are correct
- ✅ Contract ABIs are properly structured
- ✅ Utility functions work correctly

#### Attestation Module (`attestation.test.ts`)
- ✅ Fetches attestation from Circle API
- ✅ Handles pending attestations
- ✅ Handles 404 errors as pending
- ✅ Throws on API errors
- ✅ Polls until attestation is ready
- ✅ Exponential backoff works
- ✅ Timeout after max attempts

#### Bridge Module (`bridge.test.ts`)
- ✅ Validates chain names
- ✅ Checks USDC balance
- ✅ Fails on insufficient balance
- ✅ Returns correct result structure
- ✅ Error handling

### Integration Tests

#### Bridge Flow (`bridge.integration.test.ts`)
- ✅ Chain configurations work together
- ✅ Parameter parsing works end-to-end
- ✅ USDC amount precision (6 decimals)
- ✅ Address validation
- ✅ Error propagation

## 📊 Coverage Goals

- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

## 🔧 Test Configuration

Tests are configured in `jest.config.js`:
- Uses `ts-jest` for TypeScript support
- 30 second timeout for blockchain operations
- Coverage collection from `src/` directory
- Test environment: Node.js

## 📝 Writing New Tests

### Pattern for Unit Tests
```typescript
describe('Module Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should do something', async () => {
    // Arrange
    const input = 'value';
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Pattern for Integration Tests
```typescript
describe('Feature Integration', () => {
  test('should work end-to-end', async () => {
    // Test the full flow with real data/mocks
  });
});
```

## 🐛 Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Specific Test File
```bash
npm test -- chains.test.ts
```

### Specific Test
```bash
npm test -- -t "should return complete attestation"
```

## 🔒 Security Notes

- Tests use **testnet only** configurations
- No real private keys in test files
- Mocked blockchain interactions
- Isolated test environment

## 📈 Test Results

After running tests, you'll see:
- Number of passed/failed tests
- Coverage report
- Detailed error messages for failures

Example output:
```
Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        5.234s
```

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Add integration tests for new flows

## 📚 References

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Circle CCTP Docs](https://developers.circle.com/stablecoins/cctp-getting-started)
