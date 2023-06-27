'use strict';

module.exports = {
  extends: '../.eslintrc.cjs',
  env: {
    mocha: true,
  },
  rules: {
    'no-console': ['off'],
    'n/no-process-exit': 'error',
  },
};
