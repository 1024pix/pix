"use strict";
module.exports = {
  extends: "plugin:cypress/recommended",
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["cypress"],
  ignorePatterns: ["**/cypress/plugins/*.js"],
  env: {
    browser: false,
    node: true,
    "cypress/globals": true,
  },
  rules: {
    "no-unused-vars": [2, {argsIgnorePattern: "_"}],
  },
};
