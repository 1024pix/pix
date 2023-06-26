"use strict";

module.exports = {
  extends: "../../.eslintrc.cjs",
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
