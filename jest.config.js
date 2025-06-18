module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/__tests__/**/*.jsx', '**/?(*.)+(spec|test).js', '**/?(*.)+(spec|test).jsx'],
  verbose: true,
  // Setup files to run before tests
  setupFilesAfterEnv: ['./src/backend/__tests__/setup.js'],
  // Setup test environment for React components
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  // Transform files with babel
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  // Mock file imports for non-JS files
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/frontend/__tests__/mocks/fileMock.js',
    '\\.(css|less|scss)$': '<rootDir>/src/frontend/__tests__/mocks/styleMock.js'
  }
};
