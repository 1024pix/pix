'use strict';
const fs = require('node:fs');

module.exports = {
  globals: {
    server: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2018,
    sourceType: 'module',
    babelOptions: {
      plugins: [['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }]],
    },
  },
  plugins: ['ember', 'qunit'],
  extends: [
    ...(fs.existsSync('../.eslintrc.cjs') ? ['../.eslintrc.cjs'] : []),
    'plugin:ember/recommended',
    'plugin:qunit/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {
    'no-restricted-imports': ['error', { paths: ['lodash'] }],
    'no-irregular-whitespace': 'off',
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.cjs',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
    },
  ],
};
