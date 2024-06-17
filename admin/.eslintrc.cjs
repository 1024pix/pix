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
    'ember/no-mixins': 'off',
    'no-restricted-imports': ['error', { paths: ['lodash'] }],
    'qunit/require-expect': ['error', 'except-simple'],
  },
  overrides: [
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
    // node files
    {
      files: [
        '.eslintrc.cjs',
        '.prettierrc.js',
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
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
    },
  ],
};
