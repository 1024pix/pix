'use strict';

module.exports = {
  extends: ['../.eslintrc.cjs'],
  rules: {
    'no-restricted-modules': [
      'error',
      {
        paths: [
          {
            name: 'axios',
            message: 'Please use http-agent instead (ADR 23)',
          },
        ],
      },
    ],
    'n/no-process-env': 'error',
  },
};
