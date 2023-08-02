"use strict";

module.exports = {
  plugins: ["yaml"],
  extends: ["@1024pix", "plugin:yaml/recommended"],
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
