const emberRecommendedConfig = require('eslint-plugin-ember/configs/recommended');
const emberGjsRecommendedConfig = require('eslint-plugin-ember/configs/recommended-gjs');
const qunitRecommendedConfig = require('eslint-plugin-qunit/configs/recommended');
const prettierRecommendedConfig = require('eslint-plugin-prettier/recommended');
const nRecommendedConfig = require('eslint-plugin-n').configs['flat/recommended'];
const pixRecommendedConfig = require('@1024pix/eslint-plugin/config');
const globals = require('globals');
const babelParser = require('@babel/eslint-parser');
const emberParser = require('ember-eslint-parser');

const unconventionalJsFiles = ['blueprints/**/files/*', 'app/vendor/*'];
const compiledOutputFiles = ['dist/*', 'tmp/*'];
const dependenciesFiles = ['bower_components/*', 'node_modules/*'];
const miscFiles = ['coverage/*', '!**/.*', '**/.eslintcache'];
const emberTryFiles = ['.node_modules.ember-try/*', 'bower.json.ember-try', 'package.json.ember-try'];
const phraseGeneratedFiles = ['translations/*.json', '!translations/en.json', '!translations/fr.json'];

const nodeFiles = [
  'eslint.config.cjs',
  '.template-lintrc.js',
  'ember-cli-build.js',
  'testem.js',
  'blueprints/*/index.js',
  'config/**/*.js',
  'lib/*/index.js',
  'server/**/*.js',
];

const emberPatchedParser = Object.assign(
  {
    meta: {
      name: 'ember-eslint-parser',
      version: '*',
    },
  },
  emberParser,
);

module.exports = [
  ...pixRecommendedConfig,
  ...emberRecommendedConfig,
  ...emberGjsRecommendedConfig,
  qunitRecommendedConfig,
  prettierRecommendedConfig,
  {
    ignores: [
      ...unconventionalJsFiles,
      ...compiledOutputFiles,
      ...dependenciesFiles,
      ...miscFiles,
      ...emberTryFiles,
      ...phraseGeneratedFiles,
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: babelParser,
      ecmaVersion: 2018,
      sourceType: 'module',

      parserOptions: {
        requireConfigFile: false,

        babelOptions: {
          plugins: [
            [
              '@babel/plugin-proposal-decorators',
              {
                decoratorsBeforeExport: true,
              },
            ],
          ],
        },
      },
    },

    rules: {
      'no-console': 'error',
      'no-duplicate-imports': 'error',

      'no-restricted-imports': [
        'error',
        'lodash',
        {
          name: '@ember/test-helpers',
          importNames: ['render', 'visit', 'find'],
          message:
            "Please import 'render' from '@1024pix/ember-testing-library'.\n Please import 'visit' from '@1024pix/ember-testing-library'.\n. 'find' should be replaced with '@1024pix/ember-testing-library' 'find...'/'get...'/'query...' methods to enforce accessible usages.",
        },
      ],

      'ember/avoid-leaking-state-in-ember-objects': 'off',
      'ember/no-get': ['error'],
      'ember/no-empty-attrs': 'error',
      'ember/no-new-mixins': 'off',
      'ember/no-restricted-resolver-tests': 'off',
      'ember/use-ember-data-rfc-395-imports': 'error',

      'ember/order-in-models': [
        'error',
        {
          order: ['attribute', 'relationship', 'single-line-function', 'multi-line-function'],
        },
      ],

      'ember/no-mixins': 'off',
      'no-irregular-whitespace': 'off',
    },
  },
  {
    files: ['**/*.gjs'],
    languageOptions: {
      parser: emberPatchedParser,
      sourceType: 'module',
    },
  },
  {
    ...nRecommendedConfig,
    files: nodeFiles,

    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 5,
      sourceType: 'script',
    },
  },
  {
    files: ['tests/**/*.js', 'tests/**/*.gjs'],

    languageOptions: {
      globals: {
        ...globals.embertest,
        server: false,
      },
    },
  },
];
