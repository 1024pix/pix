module.exports = {
  extends: "plugin:cypress/recommended",
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'cypress',
  ],
  env: {
    browser: false,
    node: true,
    "cypress/globals": true
  },
  rules: {
    "no-unused-vars": [
      2, { argsIgnorePattern: "_" }
    ]
  }
};
