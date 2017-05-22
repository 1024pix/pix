module.exports = {
  env: {
    embertest: true,
    mocha: true
  },
  globals: {
    'Showdown': false,
    'server': false
  },
  parserOptions: {
    ecmaVersion: 8
  },
  rules: {
    'no-unused-expressions': 0
  }
};
