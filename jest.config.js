module.exports = {
  roots: [
    '<rootDir>/src'
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'reports/coverage',
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  testEnvironment: 'node',
  bail: false,
  verbose: true,
  preset: 'ts-jest',
  testMatch: null
}
