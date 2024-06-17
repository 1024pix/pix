'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],

  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],

  rules: {
    'no-duplicate-landmark-elements': false,
  },

  ignore: ['blueprints/component-test/files/tests/integration/components/*'],

  overrides: [
    {
      files: ['**/integration/**/*_test.js'],
      rules: {
        prettier: false,
      },
    },
    {
      files: ['**/*.gjs'],
      rules: {
        prettier: 'off',
      },
    },
  ],
};
