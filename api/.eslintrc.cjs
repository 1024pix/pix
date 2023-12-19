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
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: ['api/lib/domain/usecases', 'lib/domain/usecases'],
            from: ['api/lib/infrastructure/repositories', 'lib/infrastructure/repositories'],
            except: [],
            message:
              "Repositories are automatically injected in use-case, you don't need to import them. Check for further details: https://github.com/1024pix/pix/blob/dev/docs/adr/0046-injecter-les-dependances-api.md",
          },
          { target: 'tests/unit', from: 'db' },
        ],
      },
    ],
  },
};
