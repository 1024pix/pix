'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'a11y', 'ember-template-lint-plugin-prettier:recommended'],
  rules: {
    'no-invalid-interactive': false,
    'no-nested-interactive': false,
  },
};
