module.exports = {
  preset: 'react-native',
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // The first render of a React Native component on a fresh clone compiles a lot of
  // react-native source and can take several seconds. Don't let that look like a failure.
  testTimeout: 30_000,
};
