const fs = require('fs');

module.exports = {
  globals: {
    server: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: [
    'ember',
  ],
  extends: [
    ...(fs.existsSync('../.eslintrc.yaml') ? ['../.eslintrc.yaml'] : []),
    'plugin:ember/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {
    'no-restricted-imports': ['error', { 'paths': ['lodash'] }],
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
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
