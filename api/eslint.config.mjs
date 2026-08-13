import pixRecommendedConfig from '@1024pix/eslint-plugin/config';
import { fixupPluginRules } from '@eslint/compat';
import vitest from '@vitest/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import chaiExpect from 'eslint-plugin-chai-expect';
import i18nJsonPlugin from 'eslint-plugin-i18n-json';
import knex from 'eslint-plugin-knex';
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
    ...vitest.configs.env,
    files: ['tests/**/*.js'],
    plugins: { vitest },
    languageOptions: {
      ...vitest.configs.env.languageOptions,
      globals: {
        ...vitest.configs.env.languageOptions.globals,
        // Mocha's `context()` alias for `describe()` is shimmed globally in tests/test-helper.js
        // rather than rewriting ~5,200 call sites; declared here so `no-undef` doesn't flag it.
        context: 'readonly',
      },
    },
    rules: {
      // Only the direct equivalents of the previous eslint-plugin-mocha rules are enabled here —
      // vitest's broader `recommended` ruleset (no-identical-title, expect-expect, valid-title...)
      // would flag pre-existing content across the whole suite, which is out of scope for a
      // runner swap.
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'error',
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
    files: [
      'src/certification/configuration/**/*.{js,mjs}',
      'src/certification/results/**/*.{js,mjs}',
      'src/certification/evaluation/**/*.{js,mjs}',
    ],
    rules: {
      'func-style': ['error', 'declaration'],
    },
  },
  // Ignored files
  globalIgnores(['tests/tooling/db-schemalint.cjs']),
]);
