// Setup global Jest environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key';

// Mock a singleton pattern for sequelize in test environment
const mockSequelize = {
  sync: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true)
};

// Extend Jest with custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

console.log('Jest setup complete - Test environment initialized');
