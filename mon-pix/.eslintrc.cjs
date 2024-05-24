module.exports = {
  root: true,
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
    'no-console': 'error',
    'no-duplicate-imports': 'error',
    'no-restricted-imports': [
      'error',
      'lodash',
      {
        name: '@ember/test-helpers',
        importNames: ['render', 'visit', 'find'],
        message:
          "Please import 'render' from '@1024pix/ember-testing-library'.\n Please import 'visit' from '@1024pix/ember-testing-library'.\n. 'find' should be replaced with '@1024pix/ember-testing-library' 'find...'/'get...'/'query...' methods to enforce accessible usages.",
      },
    ],
    'ember/avoid-leaking-state-in-ember-objects': 'off',
    'ember/no-get': ['error'],
    'ember/no-empty-attrs': 'error',
    'ember/no-new-mixins': 'off',
    'ember/no-restricted-resolver-tests': 'off',
    'ember/use-ember-data-rfc-395-imports': 'error',
    'ember/order-in-models': [
      'error',
      {
        order: ['attribute', 'relationship', 'single-line-function', 'multi-line-function'],
      },
    ],
    /* Recommended rules */
    'ember/no-mixins': 'off',
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
    // test files
    {
      files: ['tests/**/*.js'],
      excludedFiles: ['tests/dummy/**/*.js'],
      env: {
        embertest: true,
      },
      globals: {
        server: false,
      },
    },
  ],
  settings: {
    'i18n-json/ignore-keys': ['pages.dashboard.presentation.link.text', 'pages.dashboard.presentation.link.url'],
  },
};
