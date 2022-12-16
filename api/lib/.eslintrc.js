module.exports = {
  extends: ['../.eslintrc.yaml', 'plugin:node/recommended-script'],
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
