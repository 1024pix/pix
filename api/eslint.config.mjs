import pixRecommendedConfig from '@1024pix/eslint-plugin/config';
import { fixupPluginRules } from '@eslint/compat';
import { defineConfig, globalIgnores } from 'eslint/config';
import chaiExpect from 'eslint-plugin-chai-expect';
import i18nJsonPlugin from 'eslint-plugin-i18n-json';
import knex from 'eslint-plugin-knex';
import mocha from 'eslint-plugin-mocha';
import nRecommendedConfig from 'eslint-plugin-n';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig([
  // Loads plugins and apply their rules
  ...pixRecommendedConfig,
  nRecommendedConfig.configs['flat/recommended'],
  chaiExpect.configs['recommended-flat'],
  // Loads plugins only (rules not applied yet)
  { plugins: { unicorn } },
  { plugins: { knex: fixupPluginRules(knex) } },
  // Setup global language options
  { languageOptions: { ecmaVersion: 2025, sourceType: 'module' } },
  // Overridden rules for "js" files
  {
    files: ['**/*.{js,mjs}'],
    rules: {
      'no-console': 'error',
      'no-empty-function': 'error',
      'knex/avoid-injections': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'n/no-sync': ['error', { ignores: ['catchErrSync'] }],
      'n/no-process-exit': 'error',
      'n/no-unpublished-import': 'off',
    },
  },
  // Overridden rules for "scripts" files
  {
    files: ['scripts/**/*.js'],
    rules: { 'no-console': 'off' },
  },
  // Overridden rules for "tests" files
  {
    ...mocha.configs.recommended,
    files: ['tests/**/*.js'],
    rules: {
      ...mocha.configs.recommended.rules,
      'mocha/no-hooks-for-single-case': 'off',
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-pending-tests': 'error',
      'mocha/no-top-level-hooks': 'error',
      'mocha/no-setup-in-describe': 'off',
      'mocha/consistent-spacing-between-blocks': 'off',
    },
  },
  // Overridden rules for "translations" files
  {
    files: ['translations/*.json'],
    plugins: { 'i18n-json': i18nJsonPlugin },
    processor: {
      meta: { name: '.json' },
      ...i18nJsonPlugin.processors['.json'],
    },
    rules: {
      ...i18nJsonPlugin.configs.recommended.rules,
    },
  },
  {
    files: ['src/certification/configuration/**/*.{js,mjs}'],
    rules: {
      'func-style': ['error', 'declaration'],
    },
  },
  // Ignored files
  globalIgnores(['tests/tooling/db-schemalint.cjs']),
]);
