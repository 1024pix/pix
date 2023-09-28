'use strict';

module.exports = {
  extends: [
    '@1024pix',
    'plugin:mocha/recommended',
    'plugin:prettier/recommended',
    'plugin:chai-expect/recommended',
    'plugin:n/recommended',
    'plugin:import/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ['importAssertions'],
      },
    },
  },
  parser: '@babel/eslint-parser',
  globals: {
    include: true,
  },
  plugins: ['knex', 'unicorn'],
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
    'import/no-restricted-paths': ['error', { zones: [{ target: 'lib/domain/usecases', from: 'lib/infrastructure/repositories', except: [] }] }],
  },
};
