import pixRecommendedConfig from '@1024pix/eslint-plugin/config';
import vitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import chaiExpect from 'eslint-plugin-chai-expect';
import i18nJsonPlugin from 'eslint-plugin-i18n-json';
import knex from 'eslint-plugin-knex';
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
  { plugins: { unicorn, knex } },
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
      'unicorn/no-array-sort': ['error', { allowExpressionStatement: false }],
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
      'unicorn/no-array-sort': ['error', { allowExpressionStatement: false }],
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
    ...vitest.configs.env,
    files: ['tests/**/*.{js,ts}'],
    plugins: { vitest },
    languageOptions: {
      ...vitest.configs.env.languageOptions,
      // Declared to match exactly what tests/setup/vitest-hooks.js injects. Vitest runs with
      // `globals: false`, so spreading the plugin's full global set would declare `expect`,
      // `vi` and friends as available and let a missing `import { expect } from 'chai'` pass
      // lint, only to fail at runtime.
      globals: {
        describe: 'readonly',
        context: 'readonly', // Mocha's alias for describe, still injected
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      // Only the direct equivalents of the rules that were enforced under
      // eslint-plugin-mocha. The plugin's own `recommended` set would flag pre-existing
      // content across the whole suite, which is a separate discussion.
      'vitest/no-focused-tests': 'error', // was mocha/no-exclusive-tests
      'vitest/no-disabled-tests': 'error', // was mocha/no-pending-tests
      // The plugin does not know `context` is an alias for `describe`, so it would miss
      // `context.only`, which silently reduces CI to a single suite.
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='context'][callee.property.name=/^(only|skip)$/]",
          message: 'Use describe.only / describe.skip so that the vitest lint rules can catch it.',
        },
      ],
    },
  },
  // Allow process.env for specific files
  {
    files: [
      'tests/setup/*.{js,ts}',
      'vitest.config.{js,ts}',
      'config/config.{js,ts}',
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
    files: ['src/certification/**/*.{js,mjs,ts}'],
    rules: {
      'func-style': ['error', 'declaration'],
    },
  },
]);
