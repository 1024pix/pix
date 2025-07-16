import pixRecommendedConfig from '@1024pix/eslint-plugin/config';
import babelParser from '@babel/eslint-parser';
import emberParser from 'ember-eslint-parser';
import emberRecommendedConfig from 'eslint-plugin-ember/configs/recommended';
import emberGjsRecommendedConfig from 'eslint-plugin-ember/configs/recommended-gjs';
import i18nJsonPlugin from 'eslint-plugin-i18n-json';
import nRecommendedConfig from 'eslint-plugin-n';
import prettierRecommendedConfig from 'eslint-plugin-prettier/recommended';
import qunitRecommendedConfig from 'eslint-plugin-qunit/configs/recommended';
import globals from 'globals';

const unconventionalJsFiles = ['blueprints/**/files/*', 'app/vendor/*'];
const compiledOutputFiles = ['dist/*', 'tmp/*'];
const dependenciesFiles = ['bower_components/*', 'node_modules/*'];
const miscFiles = ['coverage/*', '!**/.*', '**/.eslintcache'];
const emberTryFiles = ['.node_modules.ember-try/*', 'bower.json.ember-try', 'package.json.ember-try'];
const translationFiles = ['translations/*.json'];

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

export default [
  ...pixRecommendedConfig,
  ...emberRecommendedConfig,
  ...emberGjsRecommendedConfig,
  qunitRecommendedConfig,
  prettierRecommendedConfig,
  {
    ignores: [...unconventionalJsFiles, ...compiledOutputFiles, ...dependenciesFiles, ...miscFiles, ...emberTryFiles],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          configFile: false,
          babelrc: false,
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
    ...nRecommendedConfig.configs['flat/recommended'],
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
  {
    files: translationFiles,
    plugins: { 'i18n-json': i18nJsonPlugin },
    processor: {
      meta: { name: '.json' },
      ...i18nJsonPlugin.processors['.json'],
    },
    rules: {
      ...i18nJsonPlugin.configs.recommended.rules,
    },
  },
];
