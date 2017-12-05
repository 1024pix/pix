module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: '../.eslintrc',
  env: {
    browser: true
  },
  rules: {},
  globals: {
    jsyaml: true
  }
};
