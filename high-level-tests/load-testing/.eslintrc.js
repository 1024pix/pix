module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  'overrides': [
    {
      'files': ['*.yaml', '*.yml'],
      'plugins': ['yaml'],
      'extends': ['plugin:yaml/recommended'],
    },
  ],
};
