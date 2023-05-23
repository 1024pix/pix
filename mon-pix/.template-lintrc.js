'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],

  extends: ['recommended', 'a11y', 'ember-template-lint-plugin-prettier:recommended'],

  rules: {
    'no-duplicate-landmark-elements': false,
    'no-redundant-role': false,
    'no-html-comments': false,
    'no-bare-strings': ['Pix', '&nbsp;', '&#8226;', '.', '*', '1024', '/', '•', '-', '%'],
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
