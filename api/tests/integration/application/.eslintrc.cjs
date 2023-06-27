'use strict';
module.exports = {
  extends: '../../.eslintrc.cjs',
  rules: {
    'no-restricted-modules': [
      'error',
      {
        paths: [
          {
            name: '../../../server',
            message: 'Please use http-server-test instead.',
          },
          {
            name: '../../../../server',
            message: 'Please use http-server-test instead.',
          },
        ],
      },
    ],
  },
};
