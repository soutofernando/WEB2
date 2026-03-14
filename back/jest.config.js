module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/public/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'public/src/**/*.ts',
    '!public/src/**/*.d.ts',
    '!public/src/index.ts',
    '!public/src/config/**',
    '!public/src/models/**',
    '!public/src/routes/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/public/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/public/src/__tests__/setup.ts'],
};
