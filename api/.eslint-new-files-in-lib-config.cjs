'use strict';

module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ['importAssertions'],
      },
    },
  },
  parser: '@babel/eslint-parser',
  globals: {
    include: true,
  },
  rules: {
    'max-lines': ['error', 0],
  },
};
