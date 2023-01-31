'use strict';

module.exports = {
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  plugins: ['ember-template-lint-plugin-prettier'],
  rules: {
    'no-duplicate-landmark-elements': false,
    'no-invalid-interactive': false,
  },
  ignore: ['blueprints/**'],
};
