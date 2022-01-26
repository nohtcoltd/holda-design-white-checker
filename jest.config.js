module.exports = {
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '^/@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.[jt]sx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
        loaders: {
          '.jest.ts': 'tsx',
        },
      },
    ],
    // '\\.[jt]sx?$': 'esjest-transform',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/ApiInteractor/api/**',
    '!**/Repository/api/**',
    '!**/interfaces/**',
    '!**/types/**',
    '!**/type/**',
    '!**/debug/**',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Test Report',
      },
    ],
  ],
  verbose: false,
  silent: false,
};
