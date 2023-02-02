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
