module.exports = {
  env: {
    embertest: true,
    mocha: true,
    jquery: true
  },
  extends: '../.eslintrc.js',
  globals: {
    'Showdown': false,
    'server': false
  },
  rules: {
    'no-unused-expressions': 0
  }
};
