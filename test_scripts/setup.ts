// Test setup file
// Configure test environment

// Increase timeout for blockchain operations
jest.setTimeout(30000);

// Suppress console output during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
// };

// Mock environment variables
process.env.NODE_ENV = 'test';
