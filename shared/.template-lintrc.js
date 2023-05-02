'use strict';

module.exports = {
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  plugins: ['ember-template-lint-plugin-prettier'],
  rules: {
    'no-invalid-interactive': false,
    'no-nested-interactive': false,
    'no-outlet-outside-routes': false,
    'no-inline-styles': {
      allowDynamicStyles: true,
    },
  },
};
