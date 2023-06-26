'use strict';

module.exports = {
  extends: '../.eslintrc.cjs',
  rules: {
    'no-restricted-modules': [
      'error',
      {
        paths: ['@hapi/hapi'],
      },
    ],
  },
};
