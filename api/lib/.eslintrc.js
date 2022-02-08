const path = require('path');
module.exports = {
  extends: '../.eslintrc.yaml',
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
  },
  overrides: [
    {
      files: 'domain/usecases/**',
      rules: {
        'node/no-restricted-require': [
          'error',
          [
            {
              name: path.resolve(__dirname, 'infrastructure/DomainTransaction**'),
              message: "Don't use DomainTransaction in use-cases, use it in controller and scripts (ADR 9).",
            },
          ],
        ],
      },
    },
  ],
};
