// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
module.exports = {
  extends: ['../.eslintrc.yaml'],
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
    'node/no-process-env': 'error',
  },
};
