import pixRecommendedConfig from '@1024pix/eslint-plugin/config';
import { fixupPluginRules } from '@eslint/compat';
import { defineConfig } from 'eslint/config';
import chaiExpect from 'eslint-plugin-chai-expect';
import i18nJsonPlugin from 'eslint-plugin-i18n-json';
import knex from 'eslint-plugin-knex';
import mocha from 'eslint-plugin-mocha';
import nRecommendedConfig from 'eslint-plugin-n';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // Linter setup
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  // Loads plugins and apply their rules
  ...pixRecommendedConfig,
  nRecommendedConfig.configs['flat/recommended'],
  chaiExpect.configs['recommended-flat'],
  // Loads plugins only (rules not applied yet)
  { plugins: { unicorn, knex: fixupPluginRules(knex) } },
  // Setup global language options
  { languageOptions: { ecmaVersion: 2025, sourceType: 'module' } },
  // Rules for "js" files
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
      'n/no-process-env': ['error', { allowedVariables: ['NODE_ENV'] }],
    },
  },
  // Rules for "ts" files
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'error',
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      'knex/avoid-injections': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'n/no-sync': ['error', { ignores: ['catchErrSync'] }],
      'n/no-process-exit': 'error',
      'n/no-unpublished-import': 'off',
      'n/no-process-env': ['error', { allowedVariables: ['NODE_ENV'] }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
  // Overridden language options for CommonJS files
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: { module: 'writable', require: 'readonly' } },
  },
  // Overridden rules for "scripts" files
  {
    files: ['scripts/**/*.{js,ts}'],
    rules: { 'no-console': 'off' },
  },
  // Overridden rules for "tests" files
  {
    ...mocha.configs.recommended,
    files: ['tests/**/*.{js,ts}'],
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
  // Allow process.env for specific files
  {
    files: [
      'tests/setup/*.{js,ts}',
      'src/shared/config.{js,ts}',
      'config/seeds-config.{js,ts}',
      'db/migrations/*.{js,ts}',
      'src/shared/infrastructure/validate-environment-variables.{js,ts}',
      'src/shared/infrastructure/open-telemetry/scalingo-detector.{js,ts}',
      'scripts/*.{js,ts}',
    ],
    rules: {
      'n/no-process-env': 'off',
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
  // Overridden rules for "db/migrations" files : old migrations are never modified
  {
    files: ['db/migrations/**/*.{js,mjs}'],
    rules: { 'no-useless-assignment': 'off' },
  },
  {
    files: [
      'src/certification/configuration/**/*.{js,mjs,ts}',
      'src/certification/results/**/*.{js,mjs,ts}',
      'src/certification/evaluation/**/*.{js,mjs,ts}',
    ],
    rules: {
      'func-style': ['error', 'declaration'],
    },
  },
]);
