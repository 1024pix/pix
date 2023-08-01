'use strict';

module.exports = {
  extends: [
    '../.eslintrc.cjs',
    'plugin:mocha/recommended',
    'plugin:prettier/recommended',
    'plugin:chai-expect/recommended',
    'plugin:n/recommended',
    'plugin:import/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  settings: {
    "import/extensions": [".js", ".ts"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"]
    },
    'import/resolver': {
      typescript: {}
    }
  },
  parserOptions: {
    ecmaVersion: 2020,
    requireConfigFile: false,
    tsconfigRootDir: '.',
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
  globals: {
    include: true,
  },
  plugins: ['knex', 'unicorn', '@typescript-eslint'],
  rules: {
    'no-console': 'error',
    'mocha/no-hooks-for-single-case': 'off',
    'no-sync': 'error',
    'knex/avoid-injections': 'error',
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-pending-tests': 'error',
    'mocha/no-skipped-tests': 'error',
    'mocha/no-top-level-hooks': 'error',
    'no-empty-function': 'error',
    'n/no-process-exit': 'error',
    'unicorn/no-empty-file': 'error',
    'n/no-unpublished-import': [
      'error',
      {
        allowModules: [
          'chai',
          'flush-write-stream',
          'form-data',
          'mockdate',
          'nock',
          'proxyquire',
          'sinon',
          'split2',
          'stream-to-promise',
          'pino-pretty',
        ],
      },
    ],
  },
};
