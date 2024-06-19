'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'a11y', 'ember-template-lint-plugin-prettier:recommended'],
  rules: {
    'no-invalid-interactive': false,
    'no-nested-interactive': false,
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
