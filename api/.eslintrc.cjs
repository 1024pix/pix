const path = require('path');

module.exports = {
  extends: [
    '../.eslintrc.yaml',
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
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'NewExpression[callee.name=Date][arguments.length=1][arguments.0.type=Literal]:not([arguments.0.value=/^[12][0-9]{3}-(0[0-9]|1[0-2])-([0-2][0-9]|3[01])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]Z)?$/])',
        message: "Use only ISO8601 UTC syntax ('2019-03-12T01:02:03Z') in Date constructor",
      },
      {
        selector:
          "CallExpression[callee.object.object.name='faker'][callee.object.property.name='internet'][callee.property.name='email']",
        message: 'Use only faker.internet.exampleEmail()',
      },
    ],
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
    'i18n-json/sorted-keys': [
      'error',
      {
        sortFunctionPath: path.resolve('./config/linter-translation-order.cjs'),
      },
    ],
  },
};
