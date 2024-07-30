/* eslint-disable @typescript-eslint/no-var-requires */
const { fixupPluginRules } = require('@eslint/compat');

const globals = require('globals');
const eslintConfig = require('@1024pix/eslint-plugin/config');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier/recommended');
const nodeConfig = require('eslint-plugin-n');
const knex = require('eslint-plugin-knex');
/*eslint-enable*/

module.exports = tseslint.config(
  ...eslintConfig,
  ...tseslint.configs.recommended,
  nodeConfig.configs['flat/recommended'],
  prettier,
  { plugins: { knex: fixupPluginRules(knex) } },
  { languageOptions: { globals: { ...globals.node } } },
  {
    rules: {
      'n/no-extraneous-require': ['error', { allowModules: ['@1024pix/eslint-plugin'] }],
    },
  },
);
