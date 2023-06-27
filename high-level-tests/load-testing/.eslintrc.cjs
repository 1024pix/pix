"use strict";

module.exports = {
  plugins: ["yaml"],
  extends: ["../../.eslintrc.cjs", "plugin:yaml/recommended"],
  globals: {
    include: true,
  },
  env: {
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 11,
  },
};
