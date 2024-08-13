const { fixupPluginRules } = require('@eslint/compat');

const babel = require('@babel/eslint-parser');
const eslintConfig = require('@1024pix/eslint-plugin/config');
const prettier = require('eslint-plugin-prettier/recommended');
const chai = require('eslint-plugin-chai-expect');
const n = require('eslint-plugin-n').configs['flat/recommended'];
const _import = require('eslint-plugin-import-x');
const knex = require('eslint-plugin-knex');
const unicorn = require('eslint-plugin-unicorn');

const mocha = require('eslint-plugin-mocha');

module.exports = [
  ...eslintConfig,
  prettier,
  { plugins: { 'chai-expect': fixupPluginRules(chai) } },
  n,
  { plugins: { import: _import } },
  { plugins: { knex: fixupPluginRules(knex) } },
  { plugins: { unicorn } },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: { module: 'readable', require: 'readable' },
    },
    rules: {
      'n/no-unpublished-require': 'off',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babel,
      parserOptions: {
        ecmaVersion: 2020,
        requireConfigFile: false,
        babelOptions: {
          parserOpts: {
            plugins: ['importAttributes'],
          },
        },
      },
    },
    rules: {
      'no-console': 'error',
      'no-sync': 'error',
      'knex/avoid-injections': 'error',
      'no-empty-function': 'error',
      'n/no-process-exit': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'n/no-unpublished-import': 'off',
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
  },
  mocha.configs.flat.recommended,
  {
    files: ['tests/**/*.js'],
    rules: {
      'mocha/no-hooks-for-single-case': 'off',
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-pending-tests': 'error',
      'mocha/no-skipped-tests': 'error',
      'mocha/no-top-level-hooks': 'error',
      'mocha/no-setup-in-describe': ['error'],
    },
  },
  {
    files: ['tests/integration/**/*.js'],
    rules: {
      'no-restricted-modules': [
        'error',
        {
          paths: ['@hapi/hapi'],
        },
      ],
    },
  },
  {
    files: ['tests/integration/application/**/*.js'],
    rules: {
      'no-restricted-modules': [
        'error',
        {
          paths: [
            {
              name: '../../../server',
              message: 'Please use http-server-test instead.',
            },
            {
              name: '../../../../server',
              message: 'Please use http-server-test instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/unit/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['knex', 'pg'],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['lib/**/*.js'],
    rules: {
      'no-restricted-modules': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message: 'Please use http-agent instead (ADR 23)',
            },
          ],
        },
      ],
      'n/no-process-env': 'error',
    },
  },
  {
    files: ['lib/application/**/*.js'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='parseInt']",
          message:
            'parseInt is unnecessary here because Joi already casts string into number if the field is properly described (Joi.number())',
        },
      ],
    },
  },
];
