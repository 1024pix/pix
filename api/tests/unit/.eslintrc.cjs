"use strict";

module.exports = {
  extends: "../.eslintrc.cjs",
  rules: {
    "no-restricted-imports": ["error", {
      paths: ["knex", "pg"]
    }]
  }
};
