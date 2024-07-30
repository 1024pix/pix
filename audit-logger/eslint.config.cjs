/* eslint-disable @typescript-eslint/no-var-requires */
const { fixupPluginRules, includeIgnoreFile } = require('@eslint/compat');

const path = require('node:path');
const globals = require('globals');
const eslintConfig = require('@1024pix/eslint-plugin/config');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier/recommended');
const nodeConfig = require('eslint-plugin-n');
const knex = require('eslint-plugin-knex');
/*eslint-enable*/

const gitignorePath = path.resolve(__dirname, '.gitignore');
const { ignores } = includeIgnoreFile(gitignorePath);

module.exports = tseslint.config(
  { ignores },
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
