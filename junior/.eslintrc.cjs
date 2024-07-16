'use strict';

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
  extends: ['@1024pix', 'plugin:ember/recommended', 'plugin:qunit/recommended', 'plugin:prettier/recommended'],
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
      files: ['**/*.gjs'],
      parser: 'ember-eslint-parser',
      plugins: ['ember', 'qunit'],
      extends: [
        '@1024pix',
        'plugin:ember/recommended',
        'plugin:ember/recommended-gjs',
        'plugin:qunit/recommended',
        'plugin:prettier/recommended',
      ],
    },
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
      extends: ['plugin:n/recommended'],
    },
  ],
};
