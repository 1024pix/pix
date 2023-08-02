'use strict';

module.exports = {
  extends: '../.eslintrc.cjs',
  env: {
    mocha: true,
  },
  rules: {
    'no-console': ['error'],
    'mocha/no-setup-in-describe': ['error'],
  },
};
