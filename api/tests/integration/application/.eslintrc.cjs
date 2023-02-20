// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
module.exports = {
  extends: '../../.eslintrc.yaml',
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
