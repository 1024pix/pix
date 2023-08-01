'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],

  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],

  rules: {
    'no-duplicate-landmark-elements': false,
    'require-valid-alt-text': false,
  },

  ignore: ['blueprints/component-test/files/tests/integration/components/*'],

  overrides: [
    {
      files: ['**/integration/**/*_test.js'],
      rules: {
        prettier: false,
      },
    },
  ],
};
